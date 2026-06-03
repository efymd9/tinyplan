// Subscription access gate.
//
// Per the locked soft-launch decision, the full billing system is BUILT but
// enforcement stays OFF until real Stripe billing is configured. The gate is a
// no-op (open) whenever billing is not enforced, so current soft-launch users
// are never locked out. Enforcement turns on by config later — specifically
// once STRIPE_SECRET_KEY is set and DEV_BYPASS_PAYWALL is not 'true'.

import { redirect } from 'next/navigation';
import { localizeHref } from '@/lib/i18n/href';
import type { Locale } from '@/lib/i18n/config';
import type { AuthUser } from '@/lib/auth/magic-link';

/**
 * Is the subscription paywall actually enforced?
 *
 * Enforced only when real Stripe billing is configured (STRIPE_SECRET_KEY set)
 * AND the developer paywall bypass is not engaged. During the soft launch — no
 * Stripe key, or DEV_BYPASS_PAYWALL=true — this returns false and every gate is
 * a no-op, so nobody is locked out.
 */
export function isBillingEnforced(): boolean {
  return (
    process.env.DEV_BYPASS_PAYWALL !== 'true' && !!process.env.STRIPE_SECRET_KEY
  );
}

/**
 * Does this user currently have access via an active or trialing subscription?
 * 'trial' covers the 7-day intro window; 'active' covers a paid subscription.
 */
export function hasActiveSubscription(user: AuthUser | null): boolean {
  return (
    user?.subscriptionStatus === 'trial' || user?.subscriptionStatus === 'active'
  );
}

/**
 * Server-side gate for paid areas (the whole /dashboard once enforced).
 *
 * No-op while billing is not enforced (the soft launch). Once enforced, a user
 * without an active/trialing subscription is redirected to the localized
 * pricing page. Call this from a server component / layout AFTER resolving the
 * current user.
 */
export async function requireActiveSubscription(
  user: AuthUser | null,
  lang: Locale
): Promise<void> {
  if (!isBillingEnforced()) return; // gate OPEN during soft launch
  if (hasActiveSubscription(user)) return;
  redirect(localizeHref('/pricing', lang));
}
