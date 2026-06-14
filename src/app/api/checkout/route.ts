import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createCheckoutSession } from "@/lib/payments/stripe";
import { getCurrentUser } from "@/lib/auth/magic-link";
import { normalizeEmail } from "@/lib/auth/email";
import { PARTNER_CLICK_COOKIE, isValidClickId } from "@/lib/partner-click";
import { resolveLocale } from "@/lib/i18n/config";
import { getDb } from "@/lib/db";
import { quizSessions, users } from "@/lib/db/schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildTagProfile } from "@/lib/quiz/tags";
import { normalizeQuizAnswers } from "@/lib/plans/create-plan";
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
    const submittedEmail = normalizeEmail(user?.email || email);
    const hasCustomerEmail = isValidEmail(submittedEmail);

    const db = getDb();
    const existing = hasCustomerEmail
      ? db.select().from(users).where(eq(users.email, submittedEmail)).get()
      : null;
    const userId = existing?.id || user?.id || uuid();
    const localEmail = hasCustomerEmail
      ? submittedEmail
      : checkoutPlaceholderEmail(userId);
    // Only provision a new row for a truly anonymous funnel visitor. A signed-in
    // user already has a row (provisioned by getCurrentUser); re-inserting by
    // user.id would hit a PRIMARY KEY conflict and 500 the whole checkout.
    if (!existing && !user) {
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
          // Only reached for anonymous visitors (see guard above), so a fresh
          // placeholder always starts free.
          subscription_status: "free",
          created_at: now,
          updated_at: now,
        })
        .run();
    }

    const parsedAnswers = normalizeQuizAnswers(answers);
    let quizSessionId: string | undefined;
    if (parsedAnswers) {
      const now = Math.floor(Date.now() / 1000);
      const tagProfile = buildTagProfile(parsedAnswers);
      quizSessionId = uuid();
      db.insert(quizSessions)
        .values({
          id: quizSessionId,
          user_id: userId,
          answers_json: JSON.stringify(parsedAnswers),
          tags_json: JSON.stringify(tagProfile),
          play_profile: tagProfile.play_profile,
          completed: 1,
          created_at: now,
          updated_at: now,
        })
        .run();
    }

    const jar = await cookies();
    const locale = resolveLocale(jar.get("tinyplan_locale")?.value);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Affiliate attribution: forward the captured partner click id only if it is
    // well-formed. Re-validating here (not just on write) stops a tampered cookie
    // from being credited as a referral in Stripe metadata.
    const rawClickId = jar.get(PARTNER_CLICK_COOKIE)?.value;
    const clickId = isValidClickId(rawClickId) ? rawClickId : undefined;

    const result = await createCheckoutSession({
      userEmail: hasCustomerEmail ? submittedEmail : undefined,
      userId,
      quizSessionId,
      successUrl: `${baseUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/${locale}/result`,
      clickId,
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
