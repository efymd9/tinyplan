import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
// getDb() resolves DATABASE_PATH lazily (on first call, inside the tests), so the
// static imports below never open the DB — setting the throwaway path here is
// enough to keep this run off the live database.
const tmp = path.join(os.tmpdir(), `tp-analytics-ingest-${process.pid}-${Date.now()}.db`);
process.env.DATABASE_PATH = tmp;

import { enqueueAnalyticsEvent, flushAnalytics } from '../src/lib/analytics/ingest-buffer';
import { getDb } from '../src/lib/db';
import { analyticsEvents } from '../src/lib/db/schema';

function row(name: string) {
  return {
    id: `${name}-${Math.random().toString(36).slice(2)}`,
    user_id: null,
    session_id: 's1',
    event_name: name,
    properties_json: null,
    path: '/es',
    referrer: null,
    user_agent: 'test',
    created_at: Date.now(),
  };
}

test('buffered events are not written until flush, then land in one batch', () => {
  const db = getDb();
  const before = db.select().from(analyticsEvents).all().length;

  enqueueAnalyticsEvent(row('page_viewed'));
  enqueueAnalyticsEvent(row('quiz_started'));

  // Still buffered — the request path did no DB write.
  assert.equal(db.select().from(analyticsEvents).all().length, before);

  flushAnalytics();
  assert.equal(db.select().from(analyticsEvents).all().length, before + 2);
});

test('flushing an empty queue is a no-op (no throw)', () => {
  flushAnalytics();
  const db = getDb();
  const count = db.select().from(analyticsEvents).all().length;
  flushAnalytics();
  assert.equal(db.select().from(analyticsEvents).all().length, count);
});

test('a batch larger than the insert chunk size is persisted in full', () => {
  const db = getDb();
  const before = db.select().from(analyticsEvents).all().length;
  const N = 1200; // > INSERT_CHUNK (500): exercises the multi-chunk transaction
  for (let i = 0; i < N; i++) enqueueAnalyticsEvent(row(`bulk_${i}`));
  flushAnalytics();
  assert.equal(db.select().from(analyticsEvents).all().length, before + N);
});
