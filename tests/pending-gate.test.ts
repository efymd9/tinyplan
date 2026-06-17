import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pendingGateAction, MAX_SERVER_PLAN_POLLS } from '../src/lib/dashboard/pending-gate';

test('a pending reclaim waits for the layout reclaimer', () => {
  assert.equal(
    pendingGateAction({ hasPending: true, waitForServerPlan: false, attempts: 0 }),
    'wait-reclaim'
  );
});

test('a paid user with no plan yet keeps polling below the cap', () => {
  assert.equal(
    pendingGateAction({ hasPending: false, waitForServerPlan: true, attempts: 0 }),
    'poll'
  );
  assert.equal(
    pendingGateAction({
      hasPending: false,
      waitForServerPlan: true,
      attempts: MAX_SERVER_PLAN_POLLS - 1,
    }),
    'poll'
  );
});

test('polling stops at the cap instead of spinning forever', () => {
  assert.equal(
    pendingGateAction({
      hasPending: false,
      waitForServerPlan: true,
      attempts: MAX_SERVER_PLAN_POLLS,
    }),
    'timeout'
  );
});

test('an unpaid visitor with nothing pending is sent to the quiz', () => {
  assert.equal(
    pendingGateAction({ hasPending: false, waitForServerPlan: false, attempts: 0 }),
    'redirect-quiz'
  );
});

test('a paid anonymous checkout being bridged by session id polls, never quiz-bounces', () => {
  // Mismatched Stripe-vs-Clerk email: the account looks free + plan-less while
  // the reclaimer adopts by session id — must wait, not redirect to the quiz.
  assert.equal(
    pendingGateAction({
      hasPending: false,
      waitForServerPlan: false,
      hasPendingSession: true,
      attempts: 0,
    }),
    'poll'
  );
});

test('a session-bridge gate still bounds its polling at the cap', () => {
  assert.equal(
    pendingGateAction({
      hasPending: false,
      waitForServerPlan: false,
      hasPendingSession: true,
      attempts: MAX_SERVER_PLAN_POLLS,
    }),
    'timeout'
  );
});

test('a pending plan reclaim takes precedence over a pending session', () => {
  assert.equal(
    pendingGateAction({
      hasPending: true,
      waitForServerPlan: false,
      hasPendingSession: true,
      attempts: 0,
    }),
    'wait-reclaim'
  );
});
