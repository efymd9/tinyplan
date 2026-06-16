import { eq, sql } from 'drizzle-orm';
import { payments } from '../db/schema';
import type { getDb } from '../db';

type Db = ReturnType<typeof getDb>;

/**
 * Real purchases = distinct customers with at least one *successful* payment,
 * read from the `payments` table — the source of truth for money actually
 * collected.
 *
 * Deliberately NOT derived from the `purchase_completed` analytics event. That
 * event historically fired on every checkout-success page load (reloads,
 * back-button, repeated QA/test runs, anonymous funnel hits) with no link to a
 * real charge, so it massively over-counted real buyers; it is no longer
 * emitted at all (removed in f6264f3). The admin "Purchases" tile must reflect
 * payments, not funnel telemetry.
 *
 * Counted DISTINCT by user so a buyer's $1 trial charge plus their $14.99
 * renewal count as one paying customer, and filtered to `status='paid'` so
 * `failed` charges are excluded.
 */
export function countPaidCustomers(db: Db): number {
  return (
    db
      .select({ count: sql<number>`count(distinct ${payments.user_id})` })
      .from(payments)
      .where(eq(payments.status, 'paid'))
      .get()?.count ?? 0
  );
}
