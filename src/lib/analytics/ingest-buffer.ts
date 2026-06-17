// Batched, async analytics ingestion.
//
// better-sqlite3 is synchronous, so writing each analytics event inline on the
// request path BLOCKS the single Node event loop — and the funnel fires ~40
// events per quiz-taker plus a page_viewed per navigation, so under an
// ad-traffic spike those serialized fsyncs become the dominant source of latency.
//
// Analytics is best-effort telemetry (the source of truth for money/conversion
// is the `payments` table, not these events), so decoupling the write from the
// response — and batching many rows into ONE fsync — matters far more than the
// at-most-one-second of events we might lose on an abrupt crash. One process, so
// a module-level queue + interval flusher is the whole story.
//
// SERVER-ONLY: imports getDb (better-sqlite3). Never import from client code.
import { getDb } from '@/lib/db';
import { analyticsEvents } from '@/lib/db/schema';

type AnalyticsRow = typeof analyticsEvents.$inferInsert;

const queue: AnalyticsRow[] = [];

// Hard cap so a marketing flood / bot storm sheds events instead of growing the
// heap unbounded (each row ~<1KB → ≤~10MB at the cap, well under MemoryMax).
const MAX_QUEUE = 10_000;
// Rows per INSERT, kept well under SQLite's ~32k bound-variable limit (÷ ~9 cols).
const INSERT_CHUNK = 500;
const FLUSH_INTERVAL_MS = 1000;
// Safety valve: if the queue spikes between ticks, flush early so memory stays
// bounded — this costs ONE batched fsync on ~1-in-FLUSH_AT_SIZE requests.
const FLUSH_AT_SIZE = 500;

let timer: ReturnType<typeof setInterval> | null = null;
let dropped = 0;

/** Drain the queue into the DB in one transaction (one fsync for the batch). */
export function flushAnalytics(): void {
  if (queue.length === 0) return;
  const batch = queue.splice(0, queue.length);
  try {
    const db = getDb();
    db.transaction((tx) => {
      for (let i = 0; i < batch.length; i += INSERT_CHUNK) {
        tx.insert(analyticsEvents).values(batch.slice(i, i + INSERT_CHUNK)).run();
      }
    });
  } catch (err) {
    // Telemetry must never crash or back-pressure the app — drop and move on.
    console.error('[analytics] flush failed, dropped', batch.length, 'event(s):', err);
  }
}

/** Enqueue one analytics row; the flusher persists it within ~1s. Non-blocking. */
export function enqueueAnalyticsEvent(row: AnalyticsRow): void {
  if (queue.length >= MAX_QUEUE) {
    dropped++;
    if (dropped % 1000 === 1) {
      console.warn('[analytics] queue full — shedding events (', dropped, 'dropped so far)');
    }
    return;
  }
  queue.push(row);

  if (!timer) {
    timer = setInterval(flushAnalytics, FLUSH_INTERVAL_MS);
    // Don't keep the process alive solely for the flusher.
    if (typeof timer.unref === 'function') timer.unref();
  }
  if (queue.length >= FLUSH_AT_SIZE) flushAnalytics();
}
