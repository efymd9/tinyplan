// Partner-network ingest — reports TinyPlan payments to the affiliate network
// (offer "tinyplan1" on partnernetwork.space). FAIL-SAFE: never throws; no-op
// unless PN_OFFER_KEY + PN_SIGNING_SECRET are set. A failure here must never
// break Stripe webhook handling / billing.
import crypto from "node:crypto";
import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { partnerNetworkEvents } from "@/lib/db/schema";

const NETWORK_URL = process.env.PN_NETWORK_URL || "https://partnernetwork.space";
const OFFER_KEY = process.env.PN_OFFER_KEY || "";
const SIGNING_SECRET = process.env.PN_SIGNING_SECRET || "";

type PnEvent = "lead" | "trial" | "sale" | "rebill";
type PnKind = "conversion" | "refund" | "chargeback";

function now() {
  return Math.floor(Date.now() / 1000);
}

function signedHeaders(rawBody: string): Record<string, string> {
  const ts = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(12).toString("hex");
  const sig = crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(`${ts}.${nonce}.${rawBody}`)
    .digest("hex");
  return {
    "Content-Type": "application/json",
    "X-Offer-Key": OFFER_KEY,
    "X-Ingest-Timestamp": ts,
    "X-Ingest-Nonce": nonce,
    "X-Ingest-Signature": sig,
  };
}

async function deliver(kind: PnKind, endpoint: string, payload: object, externalPaymentId?: string) {
  if (!OFFER_KEY || !SIGNING_SECRET) return;

  const db = getDb();
  const id = uuid();
  const createdAt = now();
  const body = JSON.stringify(payload);

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
    const res = await fetch(`${NETWORK_URL}${endpoint}`, {
      method: "POST",
      headers: signedHeaders(body),
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

  await deliver(
    kind,
    `/api/ingest/${kind}`,
    { external_payment_id: externalPaymentId },
    externalPaymentId
  );
}
