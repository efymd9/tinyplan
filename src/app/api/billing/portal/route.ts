import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/magic-link';
import { createBillingPortalSession } from '@/lib/payments/stripe';

/**
 * Create a Stripe Billing Portal session for the signed-in user so they can
 * manage / cancel their subscription. Returns { url } on success.
 *
 * Auth required (401 when signed out). When Stripe is not configured, or the
 * user has no Stripe customer id yet (e.g. soft-launch users who never paid),
 * returns 400 so the client can fall back gracefully.
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Billing is not configured' },
      { status: 400 }
    );
  }

  // The Clerk→local provisioning stores the customer id (set by the webhook on
  // first paid event). Read the live row rather than trusting the cached token.
  const db = getDb();
  const row = db.select().from(users).where(eq(users.id, user.id)).get();
  const customerId = row?.stripe_customer_id;

  if (!customerId) {
    return NextResponse.json(
      { error: 'No billing account found for this user' },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const { url } = await createBillingPortalSession({
      customerId,
      returnUrl: `${baseUrl}/`,
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[billing-portal] failed to create session:', err);
    return NextResponse.json(
      { error: 'Could not open billing portal' },
      { status: 500 }
    );
  }
}
