import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/magic-link";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { mergeUserInto } from "@/lib/auth/merge-users";
import { checkRateLimit } from "@/lib/rate-limit";

// Bridge a paid ANONYMOUS checkout onto the signed-in account by Stripe session
// id — independent of email.
//
// The anonymous funnel collects no email before payment; Stripe Checkout
// collects one (email A) and the webhook lands the subscription + generated plan
// on a placeholder row keyed by `metadata.userId`. The buyer then signs up via
// Clerk, possibly with a DIFFERENT email (B) — Apple "Hide My Email", a Google
// account, a typo. The existing email bridge (adoptStripeEmail / reconcile)
// only works when A == B; when they differ, the paying customer is stranded on a
// `free`, plan-less Clerk row and the enforced paywall locks them out.
//
// This endpoint closes that gap: the Stripe `session_id` (carried back in the
// browser from /checkout/success) is an unguessable capability proving the
// caller completed THIS checkout — the same trust model as plan reclaim. We
// resolve the placeholder via the session metadata and merge it onto the
// authenticated row.

const ADOPT_WINDOW_SECONDS = 24 * 60 * 60;

export async function POST(req: NextRequest) {
  try {
    const limited = checkRateLimit(req, {
      namespace: "checkout-adopt",
      limit: 20,
      windowSeconds: 60,
    });
    if (limited) return limited;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();
    // Only Stripe Checkout Session ids carry the linkage. Mock/non-Stripe ids
    // (e.g. session_id=mock) have nothing to adopt — succeed as a no-op.
    if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      return NextResponse.json({ ok: true, adopted: false });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) return NextResponse.json({ ok: true, adopted: false });

    const stripe = new Stripe(secretKey, {
      timeout: 3000,
      maxNetworkRetries: 1,
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Only a genuinely completed/paid checkout can grant access.
    const paid =
      session.status === "complete" || session.payment_status === "paid";
    const placeholderId =
      (session.metadata?.userId as string | undefined) || null;
    if (!paid || !placeholderId) {
      return NextResponse.json({ ok: true, adopted: false });
    }

    // The email bridge already resolved the buyer to this same row — nothing to
    // do (happy path when the Stripe email matched the Clerk email).
    if (placeholderId === user.id) {
      return NextResponse.json({ ok: true, adopted: false });
    }

    const db = getDb();
    const placeholder = db
      .select()
      .from(users)
      .where(eq(users.id, placeholderId))
      .get();
    // Already consumed (merged away by a prior adopt or the webhook path).
    if (!placeholder) return NextResponse.json({ ok: true, adopted: false });

    const paidStatus = placeholder.subscription_status;
    const isPaid = paidStatus === "trial" || paidStatus === "active";
    const ageOk =
      placeholder.created_at == null ||
      Math.floor(Date.now() / 1000) - placeholder.created_at <=
        ADOPT_WINDOW_SECONDS;

    // The webhook hasn't granted access to the placeholder yet (still `free`):
    // tell the client to retry — the subscription is in flight, not absent.
    if (!isPaid) {
      return NextResponse.json({ ok: true, adopted: false, pending: ageOk });
    }
    if (!ageOk) return NextResponse.json({ ok: true, adopted: false });

    // Ensure the authenticated row exists so the merge target FK is satisfiable
    // (mirrors /api/plan/reclaim's defensive provisioning).
    const me = db.select().from(users).where(eq(users.id, user.id)).get();
    if (!me) {
      const nowTs = Math.floor(Date.now() / 1000);
      db.insert(users)
        .values({
          id: user.id,
          email: user.email,
          subscription_status: user.subscriptionStatus,
          created_at: nowTs,
          updated_at: nowTs,
        })
        .run();
    }

    const customerId = placeholder.stripe_customer_id ?? null;

    // Move the paid placeholder's plan / payments / quiz session / check-ins onto
    // the authenticated row and delete the placeholder, then carry its access
    // status + Stripe customer id onto the surviving row. Idempotent: a second
    // call finds no placeholder and no-ops.
    mergeUserInto(db, placeholderId, user.id);
    db.update(users)
      .set({
        subscription_status: paidStatus,
        stripe_customer_id: customerId,
        updated_at: Math.floor(Date.now() / 1000),
      })
      .where(eq(users.id, user.id))
      .run();

    return NextResponse.json({ ok: true, adopted: true });
  } catch (err) {
    console.error("Checkout adopt error:", err);
    // Fail-safe: never block the dashboard on this. The email bridge / webhook
    // reconcile remain as the other paths to access.
    return NextResponse.json({ ok: false, adopted: false }, { status: 200 });
  }
}
