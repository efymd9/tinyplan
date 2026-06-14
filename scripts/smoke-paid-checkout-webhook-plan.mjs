#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import Database from 'better-sqlite3';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3002';
const dbPath = process.env.DATABASE_PATH || 'data/tinyplan.db';
const envText = fs.existsSync('.env.production') ? fs.readFileSync('.env.production', 'utf8') : '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || envText.match(/^STRIPE_WEBHOOK_SECRET=(.+)$/m)?.[1]?.trim();
if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is required for signed webhook smoke test');

const marker = `server_webhook_${Date.now()}_${Math.random().toString(16).slice(2)}`;
const email = `smoke+${marker}@example.com`;
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
if (!quiz?.id || !quiz.user_id) {
  throw new Error('checkout did not persist a user-attached quiz session before webhook');
}

const eventId = `evt_smoke_${marker}`.slice(0, 255);
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
      customer_details: { email },
      metadata: {
        userId: quiz.user_id,
        quizSessionId: quiz.id,
      },
    },
  },
  livemode: false,
  pending_webhooks: 1,
  request: null,
  type: 'checkout.session.completed',
};
const payload = JSON.stringify(event);
const timestamp = Math.floor(Date.now() / 1000);
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(`${timestamp}.${payload}`)
  .digest('hex');

const webhookRes = await fetch(`${baseUrl}/api/webhooks/stripe`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'stripe-signature': `t=${timestamp},v1=${signature}`,
  },
  body: payload,
});
const webhookBody = await webhookRes.text();
if (!webhookRes.ok) {
  throw new Error(`webhook failed: ${webhookRes.status} ${webhookBody}`);
}

const plan = db
  .prepare('select id, user_id, quiz_session_id, active from plans where user_id = ? and quiz_session_id = ? order by created_at desc limit 1')
  .get(quiz.user_id, quiz.id);
const user = db.prepare('select id, email, stripe_customer_id from users where id = ?').get(quiz.user_id);

try {
  if (!plan) throw new Error('signed checkout webhook did not create a server-side plan for the paid user');
  if (plan.active !== 1) throw new Error(`server-side plan ${plan.id} is not active`);
  if (user.email !== email) throw new Error(`webhook did not adopt Stripe email: ${user.email}`);
  if (!user.stripe_customer_id) throw new Error('webhook did not store Stripe customer id');

  console.log(JSON.stringify({ ok: true, eventId, planId: plan.id, userId: user.id, emailAdopted: true }, null, 2));
} finally {
  const paymentCount = db.prepare('select count(*) as c from payments where user_id = ?').get(quiz.user_id).c;
  if (paymentCount === 0) {
    db.prepare('delete from plans where user_id = ?').run(quiz.user_id);
    db.prepare('delete from quiz_sessions where id = ?').run(quiz.id);
    db.prepare('delete from users where id = ?').run(quiz.user_id);
    db.prepare('delete from stripe_events where id = ?').run(eventId);
  }
}
