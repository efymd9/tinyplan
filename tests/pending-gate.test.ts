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
