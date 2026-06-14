import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getDb, closeDb } from '../src/lib/db/index';
import {
  beginStripeEvent,
  completeStripeEvent,
  failStripeEvent,
} from '../src/lib/payments/stripe-events';

// Isolate this run on a throwaway DB. getDb() resolves DATABASE_PATH lazily, so
// setting it here (before the first getDb() call inside a test) is sufficient.
const tmp = path.join(os.tmpdir(), `tp-stripe-events-${process.pid}-${Date.now()}.db`);
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

test('a brand-new event is processed', () => {
  const db = getDb();
  const evt = { id: 'evt_new', type: 'invoice.paid', livemode: false };
  assert.equal(beginStripeEvent(db, evt, '{}'), true);
});

test('an event whose handler threw (never completed) is retried, not dropped', () => {
  const db = getDb();
  const evt = { id: 'evt_fail', type: 'invoice.paid', livemode: false };
  assert.equal(beginStripeEvent(db, evt, '{}'), true);
  // Handler threw (e.g. SQLITE_BUSY) → recorded as failed, NOT processed.
  failStripeEvent(db, evt.id, new Error('SQLITE_BUSY'));
  // Stripe redelivers the same event id after the 500 — it MUST reprocess.
  assert.equal(
    beginStripeEvent(db, evt, '{}'),
    true,
    'a failed event must remain retryable so the paying customer is not stranded'
  );
});

test('a fully processed event is skipped as a duplicate', () => {
  const db = getDb();
  const evt = { id: 'evt_done', type: 'invoice.paid', livemode: false };
  assert.equal(beginStripeEvent(db, evt, '{}'), true);
  completeStripeEvent(db, evt.id);
  assert.equal(
    beginStripeEvent(db, evt, '{}'),
    false,
    'a completed event must be deduped so side effects do not double-fire'
  );
});
