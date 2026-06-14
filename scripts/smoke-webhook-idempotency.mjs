#!/usr/bin/env node
// Live smoke for the critical billing fixes:
//   1. Webhook idempotency keys on processed_at — a duplicate delivery is acked
//      without re-running side effects, but an event that previously FAILED
//      (processed_at NULL) reprocesses on retry instead of being dropped.
//   2. A mixed-case Stripe email is stored lowercased (one canonical row), so a
//      later Clerk sign-in by the same address resolves to the paid row.
//
// Requires the app running (SMOKE_BASE_URL, default 127.0.0.1:3002) and the
// signing secret (STRIPE_WEBHOOK_SECRET or .env.production).
import crypto from 'node:crypto';
import fs from 'node:fs';
import Database from 'better-sqlite3';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3002';
const dbPath = process.env.DATABASE_PATH || 'data/tinyplan.db';
const envText = fs.existsSync('.env.production') ? fs.readFileSync('.env.production', 'utf8') : '';
const webhookSecret =
  process.env.STRIPE_WEBHOOK_SECRET || envText.match(/^STRIPE_WEBHOOK_SECRET=(.+)$/m)?.[1]?.trim();
if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is required for signed webhook smoke test');

const marker = `idem_${Date.now()}_${Math.random().toString(16).slice(2)}`;
// Deliberately MIXED CASE — the webhook must store it lowercased.
const mixedEmail = `Smoke.Upper+${marker}@Example.COM`;
const expectedEmail = mixedEmail.toLowerCase();

const answers = {
  smoke_marker: marker,
  main_pain: 'transitions',
  routine_moment: 'morning',
  parent_time: '7_10',
  child_style: ['curious_builder'],
  activity_likes: ['building'],
  plan_format: 'one_activity',
  materials: ['paper'],
  location: 'indoors',
};

const checkoutRes = await fetch(`${baseUrl}/api/checkout`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ answers }),
});
const checkout = await checkoutRes.json();
if (!checkoutRes.ok || !checkout.sessionId) {
  throw new Error(`checkout failed: ${checkoutRes.status} ${JSON.stringify(checkout)}`);
}

const db = new Database(dbPath);
const quiz = db
  .prepare("select id, user_id from quiz_sessions where answers_json like ? order by created_at desc limit 1")
  .get(`%${marker}%`);
if (!quiz?.id || !quiz.user_id) throw new Error('checkout did not persist a user-attached quiz session');

const eventId = `evt_${marker}`.slice(0, 255);
const event = {
  id: eventId,
  object: 'event',
  api_version: '2026-03-31.basil',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: checkout.sessionId,
      object: 'checkout.session',
      customer: `cus_${marker}`.slice(0, 255),
      customer_email: null,
      customer_details: { email: mixedEmail },
      metadata: { userId: quiz.user_id, quizSessionId: quiz.id },
    },
  },
  livemode: false,
  pending_webhooks: 1,
  request: null,
  type: 'checkout.session.completed',
};
const payload = JSON.stringify(event);

async function deliver() {
  const ts = Math.floor(Date.now() / 1000);
  const sig = crypto.createHmac('sha256', webhookSecret).update(`${ts}.${payload}`).digest('hex');
  const res = await fetch(`${baseUrl}/api/webhooks/stripe`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'stripe-signature': `t=${ts},v1=${sig}` },
    body: payload,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`webhook failed: ${res.status} ${JSON.stringify(body)}`);
  return body;
}

const planCount = () =>
  db.prepare('select count(*) as c from plans where user_id = ? and quiz_session_id = ?').get(quiz.user_id, quiz.id).c;

try {
  // 1) First delivery: processes, creates the plan, adopts the email lowercased.
  const first = await deliver();
  if (first.duplicate) throw new Error('first delivery was wrongly treated as a duplicate');
  if (planCount() !== 1) throw new Error(`expected 1 plan after first delivery, got ${planCount()}`);
  const user1 = db.prepare('select email from users where id = ?').get(quiz.user_id);
  if (user1.email !== expectedEmail) {
    throw new Error(`mixed-case email not normalized: stored "${user1.email}", expected "${expectedEmail}"`);
  }

  // 2) Duplicate delivery (same event id, already processed): acked, no new plan.
  const second = await deliver();
  if (!second.duplicate) throw new Error('duplicate delivery was NOT deduped');
  if (planCount() !== 1) throw new Error(`duplicate delivery created an extra plan: ${planCount()}`);

  // 3) Simulate a prior transient FAILURE: clear processed_at, then redeliver.
  //    The event must REPROCESS (not be dropped) and stay idempotent (no dup plan).
  db.prepare('update stripe_events set processed_at = NULL where id = ?').run(eventId);
  const third = await deliver();
  if (third.duplicate) throw new Error('a failed (processed_at NULL) event was dropped as a duplicate');
  if (planCount() !== 1) throw new Error(`reprocessed event created an extra plan: ${planCount()}`);

  console.log(
    JSON.stringify(
      { ok: true, eventId, planId: db.prepare('select id from plans where user_id = ?').get(quiz.user_id)?.id, emailNormalized: expectedEmail },
      null,
      2
    )
  );
} finally {
  const paymentCount = db.prepare('select count(*) as c from payments where user_id = ?').get(quiz.user_id).c;
  if (paymentCount === 0) {
    db.prepare('delete from plans where user_id = ?').run(quiz.user_id);
    db.prepare('delete from quiz_sessions where id = ?').run(quiz.id);
    db.prepare('delete from users where id = ?').run(quiz.user_id);
    db.prepare('delete from stripe_events where id = ?').run(eventId);
  }
}
