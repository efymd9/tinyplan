import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { getDb } from '@/lib/db';
import { users, payments } from '@/lib/db/schema';
import { verifyWebhookSignature } from '@/lib/payments/stripe';

// Stripe needs the raw, unparsed request body to verify the signature, so this
// handler reads `await req.text()` (Next.js 16 has no body-parser config knob).
export const dynamic = 'force-dynamic';

type LocalStatus = 'free' | 'trial' | 'active' | 'cancelled';

/** Map a Stripe subscription status onto our local subscription_status enum. */
function mapSubscriptionStatus(status: Stripe.Subscription.Status): LocalStatus {
  switch (status) {
    case 'trialing':
      return 'trial';
    case 'active':
    case 'past_due': // still has access; dunning in progress
      return 'active';
    case 'canceled':
    case 'incomplete_expired':
    case 'unpaid':
      return 'cancelled';
    default:
      // 'incomplete' / 'paused' — no confirmed access yet, leave as free.
      return 'free';
  }
}

/** Pull a plain id out of a field that may be a string id or an expanded object. */
function asId(
  value: string | { id?: string | null } | null | undefined
): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.id ?? null;
}

const now = () => Math.floor(Date.now() / 1000);

/**
 * Resolve the local users row for a Stripe event. Preference order:
 *   1. metadata.userId (set on the subscription + checkout session at creation)
 *   2. customer email (lowercased)
 *
 * Returns the row, or null when no matching local user exists (the webhook is
 * tolerant of unknown users and responds 200 in that case).
 */
function resolveUser(opts: {
  userId?: string | null;
  email?: string | null;
}): { id: string } | null {
  const db = getDb();

  if (opts.userId) {
    const byId = db.select().from(users).where(eq(users.id, opts.userId)).get();
    if (byId) return byId;
  }

  if (opts.email) {
    const email = opts.email.trim().toLowerCase();
    if (email) {
      const byEmail = db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .get();
      if (byEmail) return byEmail;
    }
  }

  return null;
}

/** Idempotently update a user's status + stripe_customer_id. */
function updateUser(
  userId: string,
  fields: { status?: LocalStatus; customerId?: string | null }
) {
  const db = getDb();
  const set: Record<string, unknown> = { updated_at: now() };
  if (fields.status) set.subscription_status = fields.status;
  if (fields.customerId) set.stripe_customer_id = fields.customerId;
  db.update(users).set(set).where(eq(users.id, userId)).run();
}

/**
 * Upsert a payments row for an invoice, keyed on the Stripe invoice id.
 *
 * The payments table has no dedicated invoice column, so we store the invoice
 * id in `stripe_session_id` (a generic text column) and use it as the
 * idempotency key — invoice ids are stable across webhook retries, so a
 * duplicate delivery is a no-op.
 */
function recordPayment(opts: {
  userId: string;
  invoiceId: string;
  subscriptionId: string | null;
  amountCents: number;
  currency: string;
  status: string;
}) {
  const db = getDb();
  // Idempotency: skip if we've already stored this invoice.
  const existing = db
    .select()
    .from(payments)
    .where(eq(payments.stripe_session_id, opts.invoiceId))
    .get();
  if (existing) return;

  db.insert(payments)
    .values({
      id: uuid(),
      user_id: opts.userId,
      stripe_session_id: opts.invoiceId,
      stripe_subscription_id: opts.subscriptionId,
      amount_cents: opts.amountCents,
      currency: opts.currency,
      status: opts.status,
      created_at: now(),
    })
    .run();
}

function handleSubscription(sub: Stripe.Subscription) {
  const userId = (sub.metadata?.userId as string | undefined) || null;
  const customerId = asId(sub.customer);
  const user = resolveUser({ userId });
  if (!user) return; // unknown user — tolerated

  updateUser(user.id, {
    status: mapSubscriptionStatus(sub.status),
    customerId,
  });
}

function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subDetails = invoice.parent?.subscription_details ?? null;
  const subscriptionId = asId(subDetails?.subscription ?? null);
  const userId =
    (subDetails?.metadata?.userId as string | undefined) || null;
  const customerId = asId(invoice.customer);
  const email = invoice.customer_email;

  const user = resolveUser({ userId, email });
  if (!user) return; // unknown user — tolerated

  // A paid invoice means access is granted (covers both the trial-start and
  // the recurring renewal cases).
  updateUser(user.id, { status: 'active', customerId });

  recordPayment({
    userId: user.id,
    invoiceId: invoice.id,
    subscriptionId,
    amountCents: invoice.amount_paid ?? 0,
    currency: invoice.currency ?? 'usd',
    status: 'paid',
  });
}

function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const subDetails = invoice.parent?.subscription_details ?? null;
  const userId =
    (subDetails?.metadata?.userId as string | undefined) || null;
  const email = invoice.customer_email;
  const user = resolveUser({ userId, email });
  if (!user) return;

  // Don't yank access on a single failed payment — Stripe will retry (dunning)
  // and the subscription.updated event drives status (past_due → active/cancelled).
  // We only record the failed attempt for the books.
  recordPayment({
    userId: user.id,
    invoiceId: invoice.id,
    subscriptionId: asId(subDetails?.subscription ?? null),
    amountCents: invoice.amount_due ?? 0,
    currency: invoice.currency ?? 'usd',
    status: 'failed',
  });
}

function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = (session.metadata?.userId as string | undefined) || null;
  const customerId = asId(session.customer);
  const email =
    session.customer_email ?? session.customer_details?.email ?? null;

  const user = resolveUser({ userId, email });
  if (!user) return;

  // Record the customer id so the billing portal can find them later. The
  // subscription.created / invoice.paid events set the concrete status.
  updateUser(user.id, { customerId });
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await verifyWebhookSignature(body, signature);
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        handleSubscription(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const user = resolveUser({
          userId: (sub.metadata?.userId as string | undefined) || null,
        });
        if (user) updateUser(user.id, { status: 'cancelled' });
        break;
      }

      case 'invoice.paid':
        handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        handleInvoiceFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    // A processing error should not make Stripe hammer us forever, but it IS a
    // real bug — surface it and let Stripe retry a few times.
    console.error(`[stripe-webhook] error handling ${event.type}:`, err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
