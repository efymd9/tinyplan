// Decision logic for the post-checkout "setting up your plan" gate, kept free of
// React/Next imports so it is unit-testable. See PendingPlanGate in
// src/components/dashboard/plan-reclaimer.tsx for the UI that drives it.

/** ~30s at the 2.5s poll interval before we stop and show a recovery state. */
export const MAX_SERVER_PLAN_POLLS = 12;

export type PendingGateAction =
  | 'wait-reclaim' // an anonymous plan id is pending; wait for the reclaimer's refresh
  | 'poll' // paid user, server-side plan not visible yet; keep refreshing
  | 'timeout' // polled too long; stop spinning and surface a recovery state
  | 'redirect-quiz'; // nothing to set up; send the visitor to the quiz

export function pendingGateAction(opts: {
  hasPending: boolean;
  waitForServerPlan: boolean;
  attempts: number;
  maxAttempts?: number;
  /**
   * A paid anonymous checkout is being bridged to this account by Stripe session
   * id (the reclaimer is POSTing /api/checkout/adopt). Until that lands, the
   * account may still look `free` and plan-less — so we must NOT bounce the
   * buyer to the quiz. Poll (bounded) and surface the recovery state on timeout,
   * exactly like waitForServerPlan.
   */
  hasPendingSession?: boolean;
}): PendingGateAction {
  const maxAttempts = opts.maxAttempts ?? MAX_SERVER_PLAN_POLLS;
  if (opts.hasPending) return 'wait-reclaim';
  if (opts.waitForServerPlan || opts.hasPendingSession) {
    return opts.attempts >= maxAttempts ? 'timeout' : 'poll';
  }
  return 'redirect-quiz';
}
