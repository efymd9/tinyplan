import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { and, eq } from 'drizzle-orm';

const tmp = path.join(os.tmpdir(), `tp-pn-${process.pid}-${Date.now()}.db`);
process.env.DATABASE_PATH = tmp;
process.env.PN_OFFER_KEY = 'test-offer';
process.env.PN_SIGNING_SECRET = 'test-secret';
process.env.PN_NETWORK_URL = 'https://partner.test';

import { getDb, closeDb } from '../src/lib/db/index';
import {
  shouldSendReversal,
  isFullRefund,
  pnConversion,
  pnReversal,
} from '../src/lib/partner-network';
import { partnerNetworkEvents } from '../src/lib/db/schema';

const realFetch = globalThis.fetch;
after(() => {
  globalThis.fetch = realFetch;
  closeDb();
  for (const f of [tmp, `${tmp}-wal`, `${tmp}-shm`]) {
    try {
      fs.unlinkSync(f);
    } catch {
      /* ignore */
    }
  }
});

function seed(db: ReturnType<typeof getDb>, row: { id: string; kind: string; ext: string }) {
  db.insert(partnerNetworkEvents)
    .values({ id: row.id, kind: row.kind, external_payment_id: row.ext, payload_json: '{}', status: 'sent', attempts: 1, created_at: 1, updated_at: 1 })
    .run();
}
function reversalsFor(db: ReturnType<typeof getDb>, ext: string) {
  return db.select().from(partnerNetworkEvents).where(eq(partnerNetworkEvents.external_payment_id, ext)).all().filter((r) => r.kind !== 'conversion');
}

test('isFullRefund is true only for a fully refunded charge', () => {
  assert.equal(isFullRefund({ refunded: true }), true);
  assert.equal(isFullRefund({ refunded: false }), false);
  assert.equal(isFullRefund({}), false);
});

test('shouldSendReversal: an organic refund (no conversion reported) is skipped', () => {
  assert.equal(shouldSendReversal(getDb(), 'inv_organic'), false);
});

test('shouldSendReversal: a reported conversion can be reversed once', () => {
  const db = getDb();
  seed(db, { id: 'c_a', kind: 'conversion', ext: 'inv_a' });
  assert.equal(shouldSendReversal(db, 'inv_a'), true);
});

test('shouldSendReversal: never reverses twice, even across refund+chargeback', () => {
  const db = getDb();
  seed(db, { id: 'c_b', kind: 'conversion', ext: 'inv_b' });
  seed(db, { id: 'r_b', kind: 'refund', ext: 'inv_b' });
  assert.equal(shouldSendReversal(db, 'inv_b'), false);
});

test('deliver carries a stable idempotency_key and gates reversals end-to-end', async () => {
  const db = getDb();
  const bodies: string[] = [];
  globalThis.fetch = (async (_url: string, opts: { body: string }) => {
    bodies.push(opts.body);
    return new Response('ok', { status: 200 });
  }) as typeof fetch;

  // Conversion is delivered, stored, and carries idempotency_key === row id.
  await pnConversion({ clickId: 'click1', userRef: 'u1', event: 'sale', externalPaymentId: 'inv_x', grossAmount: 14.99, currency: 'USD', isFirstPayment: true });
  const conv = db.select().from(partnerNetworkEvents).where(and(eq(partnerNetworkEvents.kind, 'conversion'), eq(partnerNetworkEvents.external_payment_id, 'inv_x'))).get()!;
  assert.equal(conv.status, 'sent');
  assert.equal(JSON.parse(conv.payload_json).idempotency_key, conv.id);
  assert.equal(bodies.at(-1), conv.payload_json, 'sent body equals stored body so retries are byte-identical');

  // Organic reversal (no conversion for inv_y) → nothing reported, no row created.
  await pnReversal('inv_y', 'refund');
  assert.equal(reversalsFor(db, 'inv_y').length, 0);

  // Legitimate reversal once; a duplicate event is a no-op.
  await pnReversal('inv_x', 'refund');
  await pnReversal('inv_x', 'refund');
  assert.equal(reversalsFor(db, 'inv_x').length, 1, 'a conversion is clawed back at most once');
});
