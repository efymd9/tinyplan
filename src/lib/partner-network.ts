// Partner-network ingest — reports TinyPlan payments to the affiliate network
// (offer "tinyplan1" on partnernetwork.space). FAIL-SAFE: never throws; no-op
// unless PN_OFFER_KEY + PN_SIGNING_SECRET are set. A failure here must never
// break Stripe webhook handling / billing.
import crypto from "node:crypto";
import { v4 as uuid } from "uuid";
import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { partnerNetworkEvents } from "@/lib/db/schema";

type Db = ReturnType<typeof getDb>;

// Read config lazily (not at module load) so env set after import — and tests —
// see the current values.
function config() {
  return {
    networkUrl: process.env.PN_NETWORK_URL || "https://partnernetwork.space",
    offerKey: process.env.PN_OFFER_KEY || "",
    signingSecret: process.env.PN_SIGNING_SECRET || "",
  };
}

type PnEvent = "lead" | "trial" | "sale" | "rebill";
type PnKind = "conversion" | "refund" | "chargeback";

function now() {
  return Math.floor(Date.now() / 1000);
}

function signedHeaders(rawBody: string, signingSecret: string, offerKey: string): Record<string, string> {
  const ts = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(12).toString("hex");
  const sig = crypto
    .createHmac("sha256", signingSecret)
    .update(`${ts}.${nonce}.${rawBody}`)
    .digest("hex");
  return {
    "Content-Type": "application/json",
    "X-Offer-Key": offerKey,
    "X-Ingest-Timestamp": ts,
    "X-Ingest-Nonce": nonce,
    "X-Ingest-Signature": sig,
  };
}

/** True only when a Stripe charge has been refunded in FULL (not a partial refund). */
export function isFullRefund(charge: { refunded?: boolean | null }): boolean {
  return charge.refunded === true;
}

/**
 * Whether a reversal (refund/chargeback) for this payment should be reported:
 * only if we actually reported a conversion for it, and only once per payment.
 * Prevents (a) clawing back organic refunds we never reported and (b)
 * double-counting when several Stripe events (partial+full refund, refund+
 * dispute) resolve to the same invoice id.
 */
export function shouldSendReversal(db: Db, externalPaymentId: string): boolean {
  const hadConversion = db
    .select({ id: partnerNetworkEvents.id })
    .from(partnerNetworkEvents)
    .where(
      and(
        eq(partnerNetworkEvents.kind, "conversion"),
        eq(partnerNetworkEvents.external_payment_id, externalPaymentId)
      )
    )
    .get();
  if (!hadConversion) return false;

  const alreadyReversed = db
    .select({ id: partnerNetworkEvents.id })
    .from(partnerNetworkEvents)
    .where(
      and(
        inArray(partnerNetworkEvents.kind, ["refund", "chargeback"]),
        eq(partnerNetworkEvents.external_payment_id, externalPaymentId)
      )
    )
    .get();
  return !alreadyReversed;
}

async function deliver(kind: PnKind, endpoint: string, payload: object, externalPaymentId?: string) {
  const { networkUrl, offerKey, signingSecret } = config();
  if (!offerKey || !signingSecret) return;

  const db = getDb();
  const id = uuid();
  const createdAt = now();
  // Carry a STABLE idempotency key in the (signed, stored) body — the row id,
  // which is constant across retries — so the receiver can dedup re-sends
  // regardless of the per-attempt X-Ingest-Nonce. The retry cron re-sends this
  // exact stored body, keeping it byte-identical.
  const body = JSON.stringify({ ...payload, idempotency_key: id });

  db.insert(partnerNetworkEvents)
    .values({
      id,
      kind,
      external_payment_id: externalPaymentId || null,
      payload_json: body,
      status: "pending",
      attempts: 0,
      created_at: createdAt,
      updated_at: createdAt,
    })
    .run();

  try {
    const res = await fetch(`${networkUrl}${endpoint}`, {
      method: "POST",
      headers: signedHeaders(body, signingSecret, offerKey),
      body,
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`${res.status} ${text}`.trim());
    }

    db.update(partnerNetworkEvents)
      .set({ status: "sent", attempts: 1, last_error: null, updated_at: now() })
      .where(eq(partnerNetworkEvents.id, id))
      .run();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    db.update(partnerNetworkEvents)
      .set({
        status: "pending",
        attempts: 1,
        last_error: message,
        next_attempt_at: now() + 5 * 60,
        updated_at: now(),
      })
      .where(eq(partnerNetworkEvents.id, id))
      .run();
    console.error(`[partner-network] ${kind} failed; queued for retry:`, message);
  }
}

export async function pnConversion(p: {
  clickId?: string | null;
  userRef: string;
  event: PnEvent;
  externalPaymentId: string;
  grossAmount: number;
  currency: string;
  isFirstPayment: boolean;
}): Promise<void> {
  if (!p.clickId) return;

  await deliver(
    "conversion",
    "/api/ingest/conversion",
    {
      click_id: p.clickId,
      user_ref: p.userRef,
      event: p.event,
      external_payment_id: p.externalPaymentId,
      gross_amount: p.grossAmount,
      currency: p.currency,
      is_first_payment: p.isFirstPayment,
    },
    p.externalPaymentId
  );
}

export async function pnReversal(
  externalPaymentId: string,
  kind: "refund" | "chargeback"
): Promise<void> {
  if (!externalPaymentId) return;

  const { offerKey, signingSecret } = config();
  if (!offerKey || !signingSecret) return;

  // Only report a clawback for a payment we actually reported as a conversion,
  // and at most once — see shouldSendReversal.
  if (!shouldSendReversal(getDb(), externalPaymentId)) return;

  await deliver(
    kind,
    `/api/ingest/${kind}`,
    { external_payment_id: externalPaymentId },
    externalPaymentId
  );
}
