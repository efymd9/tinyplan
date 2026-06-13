import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createCheckoutSession } from "@/lib/payments/stripe";
import { getCurrentUser } from "@/lib/auth/magic-link";
import { resolveLocale } from "@/lib/i18n/config";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const limited = checkRateLimit(req, {
      namespace: "checkout",
      limit: 10,
      windowSeconds: 60,
    });
    if (limited) return limited;

    const body = await req.json();
    const { email, answers } = body;

    const user = await getCurrentUser();
    const userEmail = (user?.email || email || "").trim().toLowerCase();
    if (!userEmail || !userEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required before checkout." },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = db.select().from(users).where(eq(users.email, userEmail)).get();
    const userId = existing?.id || user?.id || uuid();
    if (!existing) {
      const now = Math.floor(Date.now() / 1000);
      // Provision the local user row before creating Stripe Checkout. This
      // closes the anonymous buyer gap: Stripe webhooks can resolve by email
      // immediately, and Clerk sign-in later adopts this same row by email.
      db.insert(users)
        .values({
          id: userId,
          email: userEmail,
          name: null,
          subscription_status: user?.subscriptionStatus || "free",
          created_at: now,
          updated_at: now,
        })
        .run();
    }

    const jar = await cookies();
    const locale = resolveLocale(jar.get("tinyplan_locale")?.value);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const result = await createCheckoutSession({
      userEmail,
      userId,
      quizSessionId: answers ? "quiz_" + Date.now() : undefined,
      successUrl: `${baseUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/${locale}/result`,
      // Affiliate attribution: forward the captured partner click id (if any).
      clickId: jar.get("pn_click")?.value || undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
