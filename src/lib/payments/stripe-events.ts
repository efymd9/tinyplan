import { eq } from 'drizzle-orm';
import { stripeEvents } from '../db/schema';
import type { getDb } from '../db';

type Db = ReturnType<typeof getDb>;

/** Minimal shape we persist from a Stripe.Event (also lets tests pass plain objects). */
export interface StripeEventRecord {
  id: string;
  type: string;
  livemode: boolean;
}

const now = () => Math.floor(Date.now() / 1000);

function serializeError(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof Error) return error.stack || error.message;
  return String(error);
}

/**
 * Idempotency gate for Stripe webhooks. Returns `true` when the caller should
 * process the event, `false` when it is a confirmed duplicate to skip.
 *
 * An event counts as a "duplicate" ONLY once it has been fully processed
 * (`processed_at` set via {@link completeStripeEvent}). An event that was
 * recorded but whose handler threw — leaving `processed_at` null — is returned
 * as processable so Stripe's retry actually re-runs it instead of being
 * silently acked as a duplicate (which would permanently strand the customer).
 * The webhook handlers are individually idempotent, so reprocessing is safe.
 */
export function beginStripeEvent(
  db: Db,
  event: StripeEventRecord,
  rawBody: string
): boolean {
  const existing = db
    .select({ processedAt: stripeEvents.processed_at })
    .from(stripeEvents)
    .where(eq(stripeEvents.id, event.id))
    .get();

  if (existing) {
    // Fully processed → genuine duplicate, skip. Still in flight / previously
    // failed (processed_at null) → let the retry reprocess it.
    return existing.processedAt == null;
  }

  // First time we've seen this event. onConflictDoNothing guards the rare race
  // where two deliveries of the same event insert concurrently.
  db.insert(stripeEvents)
    .values({
      id: event.id,
      type: event.type,
      livemode: event.livemode ? 1 : 0,
      payload_json: rawBody,
      created_at: now(),
    })
    .onConflictDoNothing()
    .run();

  return true;
}

/** Mark an event as fully processed so later deliveries are deduped. */
export function completeStripeEvent(db: Db, eventId: string): void {
  db.update(stripeEvents)
    .set({ processed_at: now(), error: null })
    .where(eq(stripeEvents.id, eventId))
    .run();
}

/**
 * Record that processing failed WITHOUT marking the event processed, so the
 * next Stripe retry reprocesses it. (The previous implementation set
 * `processed_at` on failure, permanently poisoning the event after a transient
 * error and locking the paying customer out.)
 */
export function failStripeEvent(db: Db, eventId: string, error: unknown): void {
  db.update(stripeEvents)
    .set({ error: serializeError(error) })
    .where(eq(stripeEvents.id, eventId))
    .run();
}
