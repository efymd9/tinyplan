import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getDb, closeDb } from '../src/lib/db/index';
import { users, payments } from '../src/lib/db/schema';
import { countPaidCustomers } from '../src/lib/analytics/purchases';

// Isolate this run on a throwaway DB. getDb() resolves DATABASE_PATH lazily, so
// setting it here (before the first getDb() call inside a test) is sufficient.
const tmp = path.join(os.tmpdir(), `tp-admin-purchases-${process.pid}-${Date.now()}.db`);
process.env.DATABASE_PATH = tmp;

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

function addUser(id: string, email: string) {
  getDb().insert(users).values({ id, email, created_at: 0, updated_at: 0 }).run();
}

function addPayment(id: string, userId: string, status: string, amountCents = 100) {
  getDb()
    .insert(payments)
    .values({ id, user_id: userId, amount_cents: amountCents, status, created_at: 0 })
    .run();
}

test('with no payments, there are zero paying customers', () => {
  assert.equal(countPaidCustomers(getDb()), 0);
});

test('counts distinct paying customers: dedupes renewals, excludes failed charges', () => {
  addUser('u1', 'a@example.com');
  addUser('u2', 'b@example.com');
  addUser('u3', 'c@example.com');

  // u1 paid twice — the $1 trial charge AND the $14.99 renewal. That is ONE
  // paying customer, not two. (The old purchase_completed event metric had no
  // way to collapse these.)
  addPayment('p1', 'u1', 'paid', 100);
  addPayment('p2', 'u1', 'paid', 1499);
  // u2 paid once.
  addPayment('p3', 'u2', 'paid', 100);
  // u3 only ever had a FAILED charge — never actually purchased.
  addPayment('p4', 'u3', 'failed', 100);

  // Only u1 and u2 truly bought; u1's two rows collapse to one customer and
  // u3's failed charge is excluded.
  assert.equal(countPaidCustomers(getDb()), 2);
});
