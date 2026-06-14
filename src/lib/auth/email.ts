/**
 * Canonical email normalization shared by every auth + billing write/read path.
 *
 * SQLite's default collation is case-sensitive, so a user whose Clerk email is
 * `Bob@Example.com` and a Stripe webhook that stores `bob@example.com` would
 * otherwise resolve to two different `users` rows — orphaning the paid row
 * behind a new free one. Normalizing on both write and read keeps a single
 * canonical row per person regardless of which path created it.
 */
export function normalizeEmail(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}
