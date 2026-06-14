import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { and, eq, gte } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { getDb } from '@/lib/db';
import { users, payments, plans, quizSessions } from '@/lib/db/schema';
import {
  verifyWebhookSignature,
  getInvoiceIdForCharge,
} from '@/lib/payments/stripe';
import {
  beginStripeEvent,
  completeStripeEvent,
  failStripeEvent,
} from '@/lib/payments/stripe-events';
import { pnConversion, pnReversal, isFullRefund } from '@/lib/partner-network';
import { createPlanForUser, normalizeQuizAnswers } from '@/lib/plans/create-plan';
import { normalizeEmail } from '@/lib/auth/email';
import { mergeUserInto } from '@/lib/auth/merge-users';

// Minimum paid amount that counts as a qualifying sale for the affiliate network
// — 900 cents = $9.00, mirroring the offer's minAmount. The $1 intro is below
// this, so it is reported as a "trial"; the first $14.99 charge clears it and is
// a "sale".
const PN_QUALIFY_CENTS = 900;
const CHECKOUT_PLACEHOLDER_EMAIL_DOMAIN = 'checkout.tinyplan.local';

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
function isCheckoutPlaceholderEmail(email: string | null | undefined): boolean {
  return !!email && email.endsWith(`@${CHECKOUT_PLACEHOLDER_EMAIL_DOMAIN}`);
}

function normalizeStripeEmail(email: string | null | undefined): string | null {
  const normalized = normalizeEmail(email);
  return normalized.includes('@') ? normalized : null;
}

function resolveUser(opts: {
  userId?: string | null;
  email?: string | null;
}): { id: string; email: string } | null {
  const db = getDb();

  if (opts.userId) {
    const byId = db.select().from(users).where(eq(users.id, opts.userId)).get();
    if (byId) return byId;
  }

  if (opts.email) {
    const email = normalizeEmail(opts.email);
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
  fields: { status?: LocalStatus; customerId?: string | null; email?: string | null }
) {
  const db = getDb();
  const set: Record<string, unknown> = { updated_at: now() };
  if (fields.status) set.subscription_status = fields.status;
  if (fields.customerId) set.stripe_customer_id = fields.customerId;
  if (fields.email) set.email = fields.email;
  db.update(users).set(set).where(eq(users.id, userId)).run();
}

/**
 * Anonymous checkout starts with a local placeholder email because the quiz does
 * not collect email before payment. Once Stripe returns the payer email, adopt
 * it onto that same local row so Clerk sign-up by email reuses the paid user.
 */
function adoptStripeEmail(user: { id: string; email: string }, email: string | null) {
  const normalized = normalizeStripeEmail(email);
  if (!normalized || !isCheckoutPlaceholderEmail(user.email)) return;

  const db = getDb();
  const existing = db.select().from(users).where(eq(users.email, normalized)).get();
  if (existing && existing.id !== user.id) {
    // The buyer signed up via Clerk before this webhook fired, so a separate row
    // already owns the real email. Merge that (free, planless) row's children
    // into the paid placeholder and delete it, freeing the email to adopt — so
    // the buyer's authenticated identity resolves to the row holding their plan
    // instead of being stranded on a separate free row.
    mergeUserInto(db, existing.id, user.id);
  }

  updateUser(user.id, { email: normalized });
}

/**
 * Ensure the paid checkout's plan is persisted server-side. This makes checkout
 * abandonment safe: even if the buyer closes the browser before Clerk signup,
 * their paid local user already owns an active generated plan.
 */
function ensurePaidCheckoutPlan(user: { id: string }, quizSessionId: string | null) {
  if (!quizSessionId) return;

  const db = getDb();
  const existingPlan = db
    .select({ id: plans.id })
    .from(plans)
    .where(and(eq(plans.user_id, user.id), eq(plans.quiz_session_id, quizSessionId)))
    .get();
  if (existingPlan) return;

  const quizSession = db
    .select()
    .from(quizSessions)
    .where(eq(quizSessions.id, quizSessionId))
    .get();
  if (!quizSession) return;

  const answers = normalizeQuizAnswers(quizSession.answers_json);
  if (!answers) return;

  if (quizSession.user_id !== user.id) {
    db.update(quizSessions)
      .set({ user_id: user.id, updated_at: now() })
      .where(eq(quizSessions.id, quizSessionId))
      .run();
  }

  createPlanForUser({ userId: user.id, answers, quizSessionId });
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
}): boolean {
  const db = getDb();
  // Idempotency: skip if we've already stored this invoice. Returns false on a
  // duplicate so callers can avoid re-firing side effects (e.g. reporting the
  // same conversion to the affiliate network) on Stripe webhook retries.
  const existing = db
    .select()
    .from(payments)
    .where(eq(payments.stripe_session_id, opts.invoiceId))
    .get();
  if (existing) return false;

  try {
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
  } catch (err) {
    // The DB has a unique index on stripe_session_id. If two webhook deliveries
    // race, the loser should behave like a normal duplicate and skip side effects.
    if (err instanceof Error && err.message.includes('UNIQUE')) return false;
    throw err;
  }
  return true;
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

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subDetails = invoice.parent?.subscription_details ?? null;
  const subscriptionId = asId(subDetails?.subscription ?? null);
  const userId =
    (subDetails?.metadata?.userId as string | undefined) || null;
  const quizSessionId =
    (subDetails?.metadata?.quizSessionId as string | undefined) || null;
  const customerId = asId(invoice.customer);
  const email = invoice.customer_email;

  const user = resolveUser({ userId, email });
  if (!user) return; // unknown user — tolerated

  adoptStripeEmail(user, email);
  ensurePaidCheckoutPlan(user, quizSessionId);

  // A paid invoice means access is granted (covers both the trial-start and
  // the recurring renewal cases).
  updateUser(user.id, { status: 'active', customerId });

  // Determine whether this user already had a qualifying paid invoice BEFORE we
  // record the current one — this distinguishes the first real "sale" from a
  // later "rebill".
  const priorQualifying = !!getDb()
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.user_id, user.id),
        eq(payments.status, 'paid'),
        gte(payments.amount_cents, PN_QUALIFY_CENTS)
      )
    )
    .get();

  const inserted = recordPayment({
    userId: user.id,
    invoiceId: invoice.id,
    subscriptionId,
    amountCents: invoice.amount_paid ?? 0,
    currency: invoice.currency ?? 'usd',
    status: 'paid',
  });

  // Report the conversion to the affiliate network — once per invoice (skip on
  // Stripe webhook retries). Fail-safe: pnConversion never throws and no-ops
  // unless the PN_* env vars and a captured click id are present.
  if (inserted) {
    const amountCents = invoice.amount_paid ?? 0;
    // $1 intro invoice → "trial"; first $14.99 charge → "sale"; later $14.99
    // renewals (a prior qualifying invoice already exists) → "rebill".
    const event =
      invoice.billing_reason === 'subscription_create'
        ? 'trial'
        : priorQualifying
          ? 'rebill'
          : 'sale';
    await pnConversion({
      clickId: (subDetails?.metadata?.click_id as string | undefined) || null,
      userRef: user.id,
      event,
      externalPaymentId: invoice.id,
      grossAmount: amountCents / 100,
      currency: (invoice.currency ?? 'usd').toUpperCase(),
      isFirstPayment: event === 'sale',
    });
  }
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
  const quizSessionId = (session.metadata?.quizSessionId as string | undefined) || null;
  const customerId = asId(session.customer);
  const email =
    session.customer_email ?? session.customer_details?.email ?? null;

  const user = resolveUser({ userId, email });
  if (!user) return;

  adoptStripeEmail(user, email);
  ensurePaidCheckoutPlan(user, quizSessionId);

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

  const db = getDb();
  if (!beginStripeEvent(db, event, body)) {
    return NextResponse.json({ received: true, duplicate: true });
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
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        handleInvoiceFailed(event.data.object as Stripe.Invoice);
        break;

      case 'charge.refunded': {
        // Affiliate clawback: report the refund against the same invoice id we
        // reported as the conversion's external_payment_id. Only a FULL refund
        // reverses the conversion — a partial refund leaves the customer a
        // paying subscriber, so it is not reported. pnReversal additionally
        // skips payments we never reported and never reverses twice.
        const charge = event.data.object as Stripe.Charge;
        if (!isFullRefund(charge)) break;
        const invId = await getInvoiceIdForCharge(charge.id);
        if (invId) await pnReversal(invId, 'refund');
        break;
      }

      case 'charge.dispute.created': {
        // Affiliate clawback on chargeback — resolve the disputed charge back to
        // its invoice id, then report the reversal.
        const dispute = event.data.object as Stripe.Dispute;
        const chargeId = asId(dispute.charge);
        const invId = chargeId ? await getInvoiceIdForCharge(chargeId) : null;
        if (invId) await pnReversal(invId, 'chargeback');
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    // A processing error should not make Stripe hammer us forever, but it IS a
    // real bug — surface it and let Stripe retry a few times.
    console.error(`[stripe-webhook] error handling ${event.type}:`, err);
    failStripeEvent(db, event.id, err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  completeStripeEvent(db, event.id);
  return NextResponse.json({ received: true });
}
