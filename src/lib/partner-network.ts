// Partner-network ingest — reports TinyPlan payments to the affiliate network
// (offer "tinyplan1" on partnernetwork.space). FAIL-SAFE: never throws; no-op
// unless PN_OFFER_KEY + PN_SIGNING_SECRET are set. A failure here must never
// break Stripe webhook handling / billing.
import crypto from "node:crypto";

const NETWORK_URL = process.env.PN_NETWORK_URL || "https://partnernetwork.space";
const OFFER_KEY = process.env.PN_OFFER_KEY || "";
const SIGNING_SECRET = process.env.PN_SIGNING_SECRET || "";

type PnEvent = "lead" | "trial" | "sale" | "rebill";

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

export async function pnConversion(p: {
  clickId?: string | null;
  userRef: string;
  event: PnEvent;
  externalPaymentId: string;
  grossAmount: number;
  currency: string;
  isFirstPayment: boolean;
}): Promise<void> {
  if (!OFFER_KEY || !SIGNING_SECRET || !p.clickId) return;
  try {
    const body = JSON.stringify({
      click_id: p.clickId,
      user_ref: p.userRef,
      event: p.event,
      external_payment_id: p.externalPaymentId,
      gross_amount: p.grossAmount,
      currency: p.currency,
      is_first_payment: p.isFirstPayment,
    });
    const res = await fetch(`${NETWORK_URL}/api/ingest/conversion`, {
      method: "POST",
      headers: signedHeaders(body),
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(
        "[partner-network] conversion non-2xx:",
        res.status,
        await res.text().catch(() => "")
      );
    }
  } catch (err) {
    console.error("[partner-network] conversion failed (ignored):", err);
  }
}

export async function pnReversal(
  externalPaymentId: string,
  kind: "refund" | "chargeback"
): Promise<void> {
  if (!OFFER_KEY || !SIGNING_SECRET || !externalPaymentId) return;
  try {
    const body = JSON.stringify({ external_payment_id: externalPaymentId });
    const res = await fetch(`${NETWORK_URL}/api/ingest/${kind}`, {
      method: "POST",
      headers: signedHeaders(body),
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(
        `[partner-network] ${kind} non-2xx:`,
        res.status,
        await res.text().catch(() => "")
      );
    }
  } catch (err) {
    console.error(`[partner-network] ${kind} failed (ignored):`, err);
  }
}
