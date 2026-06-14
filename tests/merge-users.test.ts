import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { eq } from 'drizzle-orm';

const tmp = path.join(os.tmpdir(), `tp-merge-${process.pid}-${Date.now()}.db`);
process.env.DATABASE_PATH = tmp;

import { getDb, closeDb } from '../src/lib/db/index';
import { mergeUserInto } from '../src/lib/auth/merge-users';
import { users, plans, quizSessions } from '../src/lib/db/schema';

after(() => {
  closeDb();
  for (const f of [tmp, `${tmp}-wal`, `${tmp}-shm`]) {
    try {
      fs.unlinkSync(f);
    } catch {
      /* ignore */
    }
  }
});

test('merges a Clerk sign-up row into the paid placeholder row, re-pointing children', () => {
  const db = getDb();
  const t = 1;
  // X = anonymous placeholder that the webhook made paid; Z = the free row Clerk
  // provisioned when the buyer signed up before the webhook fired.
  db.insert(users)
    .values({ id: 'X', email: 'x@checkout.tinyplan.local', subscription_status: 'active', stripe_customer_id: 'cus_x', created_at: t, updated_at: t })
    .run();
  db.insert(users)
    .values({ id: 'Z', email: 'real@example.com', subscription_status: 'free', created_at: t, updated_at: t })
    .run();
  db.insert(quizSessions).values({ id: 'QX', user_id: 'X', answers_json: '{}', created_at: t, updated_at: t }).run();
  db.insert(quizSessions).values({ id: 'QZ', user_id: 'Z', answers_json: '{}', created_at: t, updated_at: t }).run();
  db.insert(plans).values({ id: 'P', user_id: 'X', quiz_session_id: 'QX', plan_json: '{}', created_at: t }).run();

  mergeUserInto(db, 'Z', 'X');

  // Z is gone, X keeps its paid state, and Z's child rows now point at X.
  assert.equal(db.select().from(users).where(eq(users.id, 'Z')).get(), undefined);
  assert.equal(db.select().from(users).where(eq(users.id, 'X')).get()!.subscription_status, 'active');
  assert.equal(db.select().from(quizSessions).where(eq(quizSessions.id, 'QZ')).get()!.user_id, 'X');
  assert.equal(db.select().from(plans).where(eq(plans.id, 'P')).get()!.user_id, 'X');
});

test('is a no-op when from and to are the same row', () => {
  const db = getDb();
  assert.doesNotThrow(() => mergeUserInto(db, 'X', 'X'));
  assert.ok(db.select().from(users).where(eq(users.id, 'X')).get());
});
