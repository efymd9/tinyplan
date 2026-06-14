import { eq } from 'drizzle-orm';
import {
  users,
  plans,
  quizSessions,
  payments,
  weeklyCheckins,
  analyticsEvents,
} from '../db/schema';
import type { getDb } from '../db';

type Db = ReturnType<typeof getDb>;

/**
 * Merge one user row into another: re-point every child row from `fromUserId`
 * to `toUserId`, then delete the now-empty `fromUserId` row — all in one
 * transaction.
 *
 * Used to reconcile the anonymous placeholder row that holds a paid subscription
 * with the row Clerk provisions at sign-up. A buyer who signs up BEFORE the
 * Stripe webhook fires would otherwise authenticate as a separate free row while
 * their paid plan sits orphaned on the placeholder.
 *
 * The caller decides which row survives (the paid one) and owns the email it
 * keeps; this function only moves children and removes the loser.
 */
export function mergeUserInto(db: Db, fromUserId: string, toUserId: string): void {
  if (fromUserId === toUserId) return;

  db.transaction((tx) => {
    tx.update(quizSessions).set({ user_id: toUserId }).where(eq(quizSessions.user_id, fromUserId)).run();
    tx.update(plans).set({ user_id: toUserId }).where(eq(plans.user_id, fromUserId)).run();
    tx.update(payments).set({ user_id: toUserId }).where(eq(payments.user_id, fromUserId)).run();
    tx.update(weeklyCheckins).set({ user_id: toUserId }).where(eq(weeklyCheckins.user_id, fromUserId)).run();
    tx.update(analyticsEvents).set({ user_id: toUserId }).where(eq(analyticsEvents.user_id, fromUserId)).run();
    tx.delete(users).where(eq(users.id, fromUserId)).run();
  });
}
