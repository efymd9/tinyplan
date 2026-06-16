// Synchronous subscription reconciliation from Stripe.
//
// Closes the "anonymous-buyer sync gap" race (DEPLOY.md → Going live, step 5):
// a buyer pays on Stripe Checkout BEFORE creating a Clerk account, then signs up
// and reaches the (now-enforced) dashboard gate. Their access normally arrives
// via the Stripe webhook (which adopts the payer email onto the paid row and/or
// merges the fresh Clerk row into it), but that is webhook-TIMING dependent. If
// the buyer finishes sign-up before the webhook lands, their local row is still
// `free` and the gate would wrongly bounce them to /pricing — locking them out
// of what they just bought.
//
// This helper gives the gate a fail-safe second opinion: look the buyer up in
// Stripe by email and, if they have a good-standing live (trialing/active)
// subscription, adopt that status onto the local row immediately — no webhook
// required. It is best-effort: ANY error (Stripe down, timeout, no match)
// returns null and the caller falls back to its normal decision.
//
// SECURITY ASSUMPTION: the grant is keyed on the email from getCurrentUser(),
// i.e. the Clerk session email. This is only safe because the live Clerk
// instance requires email-ownership verification before a session exists — so a
// signed-in email is a verified-owned email, and matching it to a Stripe payer
// email is a sound identity check. Keep Clerk's "verified email required" on.

import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { normalizeEmail } from '@/lib/auth/email';
import type { AuthUser } from '@/lib/auth/magic-link';

type LocalStatus = 'free' | 'trial' | 'active' | 'cancelled';

// Keep the Stripe call off the dashboard's critical path: short timeout + a
// single retry so a Stripe incident degrades to "fall back to local status"
// quickly (~max 6s) instead of hanging gated page renders.
const RECONCILE_TIMEOUT_MS = 3000;

// Only reconcile rows that could actually be in the sign-up-before-webhook race:
// a row created within the last hour. A long-standing `free` row is someone who
// never paid — reconciling them would mean a Stripe round-trip on EVERY gated
// render forever. Bounding by row age scopes the Stripe call to fresh sign-ups,
// which is exactly the race window.
const RECONCILE_MAX_ROW_AGE_SECONDS = 60 * 60;

/**
 * Reconcile a signed-in user's subscription status from Stripe, by email.
 *
 * Returns the granting status ('trial' | 'active') when a good-standing live
 * subscription is found (and persists it onto the local row, along with the
 * Stripe customer id so the billing portal can find them and later requests skip
 * the round-trip). Returns null on no-match, a too-old row, or any error — never
 * throws.
 */
export async function reconcileSubscriptionFromStripe(
  user: AuthUser
): Promise<LocalStatus | null> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  const email = normalizeEmail(user.email);
  if (!email.includes('@')) return null;

  const db = getDb();

  // Scope to fresh rows only (see RECONCILE_MAX_ROW_AGE_SECONDS). A missing
  // created_at is treated as too old (skip) — we never want this on the hot path
  // for an established free user.
  const row = db
    .select({ createdAt: users.created_at })
    .from(users)
    .where(eq(users.id, user.id))
    .get();
  const createdAt = row?.createdAt ?? null;
  const ageSeconds =
    createdAt == null ? Infinity : Math.floor(Date.now() / 1000) - createdAt;
  if (ageSeconds > RECONCILE_MAX_ROW_AGE_SECONDS) return null;

  try {
    const stripe = new Stripe(secretKey, {
      timeout: RECONCILE_TIMEOUT_MS,
      maxNetworkRetries: 1,
    });

    // The local email is normalized (lowercased); query Stripe with it. Stripe
    // may hold more than one customer for an email — check each. customers.list
    // is strongly consistent (unlike Search), which matters for this race.
    const customers = await stripe.customers.list({ email, limit: 10 });

    let granted: { status: LocalStatus; customerId: string } | null = null;
    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'all',
        limit: 10,
      });
      for (const sub of subs.data) {
        // Grant ONLY on a good-standing live subscription. Deliberately NOT
        // past_due: at the gate that means the initial invoice was attempted and
        // failed (they have not paid), so it must not grant first-time access —
        // the webhook will flip them to access once an invoice actually pays.
        if (sub.status === 'active' || sub.status === 'trialing') {
          granted = {
            status: sub.status === 'trialing' ? 'trial' : 'active',
            customerId: customer.id,
          };
          break;
        }
      }
      if (granted) break;
    }

    if (!granted) return null;

    db.update(users)
      .set({
        subscription_status: granted.status,
        stripe_customer_id: granted.customerId,
        updated_at: Math.floor(Date.now() / 1000),
      })
      .where(eq(users.id, user.id))
      .run();

    return granted.status;
  } catch (err) {
    console.error('[subscription-sync] reconcile from Stripe failed:', err);
    return null;
  }
}
