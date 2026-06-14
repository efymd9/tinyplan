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

// Keys in a Stripe event body that carry payer PII. We persist the (redacted)
// payload only for idempotency/debugging — never for reprocessing (Stripe
// redelivers the live body) — so stripping these keeps stripe_events free of
// personal data and out of scope for GDPR/CCPA erasure.
const PII_KEYS = new Set([
  'email',
  'customer_email',
  'receipt_email',
  'customer_details',
  'billing_details',
  'name',
  'customer_name',
  'phone',
  'address',
  'shipping',
  'tax_ids',
]);

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = PII_KEYS.has(k) ? '[redacted]' : redactValue(v);
    }
    return out;
  }
  return value;
}

/**
 * Strip payer PII from a raw Stripe webhook body before it is stored. On a parse
 * failure we drop the body entirely rather than risk persisting raw PII.
 */
export function redactStripeEventPayload(rawBody: string): string {
  try {
    return JSON.stringify(redactValue(JSON.parse(rawBody)));
  } catch {
    return '{"_redaction":"unparseable webhook body dropped to avoid storing PII"}';
  }
}

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
      payload_json: redactStripeEventPayload(rawBody),
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
