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

const CHECKOUT_PLACEHOLDER_EMAIL_DOMAIN = "checkout.tinyplan.local";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function checkoutPlaceholderEmail(userId: string): string {
  return `${userId}@${CHECKOUT_PLACEHOLDER_EMAIL_DOMAIN}`;
}

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
    const submittedEmail = (user?.email || email || "").trim().toLowerCase();
    const hasCustomerEmail = isValidEmail(submittedEmail);

    const db = getDb();
    const existing = hasCustomerEmail
      ? db.select().from(users).where(eq(users.email, submittedEmail)).get()
      : null;
    const userId = existing?.id || user?.id || uuid();
    const localEmail = hasCustomerEmail
      ? submittedEmail
      : checkoutPlaceholderEmail(userId);
    if (!existing) {
      const now = Math.floor(Date.now() / 1000);
      // Provision the local user row before creating Stripe Checkout. Anonymous
      // funnel visitors no longer provide an email before checkout; Stripe
      // Checkout collects it natively. Until the webhook sends that real email,
      // keep a non-deliverable local placeholder so metadata.userId can still
      // resolve payments/subscription events to a stable user row.
      db.insert(users)
        .values({
          id: userId,
          email: localEmail,
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
      userEmail: hasCustomerEmail ? submittedEmail : undefined,
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
