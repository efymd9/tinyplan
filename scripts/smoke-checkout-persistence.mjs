#!/usr/bin/env node
import Database from 'better-sqlite3';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3002';
const dbPath = process.env.DATABASE_PATH || 'data/tinyplan.db';
const marker = `server_plan_${Date.now()}_${Math.random().toString(16).slice(2)}`;

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

const res = await fetch(`${baseUrl}/api/checkout`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ answers }),
});

let body;
try {
  body = await res.json();
} catch {
  body = {};
}

if (!res.ok || !body.url || !body.sessionId) {
  throw new Error(`checkout did not return a session: status=${res.status} body=${JSON.stringify(body)}`);
}

const db = new Database(dbPath);
const quiz = db
  .prepare("select id, user_id, answers_json, completed from quiz_sessions where answers_json like ? order by created_at desc limit 1")
  .get(`%${marker}%`);

try {
  if (!quiz) {
    throw new Error('checkout did not persist a quiz_sessions row for the paid checkout intent');
  }
  if (!quiz.user_id) {
    throw new Error(`persisted checkout quiz session ${quiz.id} is not attached to the checkout user`);
  }
  if (quiz.completed !== 1) {
    throw new Error(`persisted checkout quiz session ${quiz.id} is not marked completed`);
  }

  const parsed = JSON.parse(quiz.answers_json);
  if (parsed.smoke_marker !== marker || parsed.main_pain !== answers.main_pain) {
    throw new Error(`persisted answers did not round-trip: ${quiz.answers_json}`);
  }

  console.log(JSON.stringify({ ok: true, sessionIdPrefix: String(body.sessionId).slice(0, 8), quizSessionId: quiz.id, userId: quiz.user_id }, null, 2));
} finally {
  // The smoke call creates only a placeholder user and quiz session before payment.
  // Clean those rows when no payment/plan has attached to them.
  if (quiz?.user_id) {
    const paymentCount = db.prepare('select count(*) as c from payments where user_id = ?').get(quiz.user_id).c;
    const planCount = db.prepare('select count(*) as c from plans where user_id = ? or quiz_session_id = ?').get(quiz.user_id, quiz.id).c;
    if (paymentCount === 0 && planCount === 0) {
      db.prepare('delete from quiz_sessions where id = ?').run(quiz.id);
      db.prepare('delete from users where id = ?').run(quiz.user_id);
    }
  }
}
