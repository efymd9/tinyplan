import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/payments/stripe";
import { getCurrentUser } from "@/lib/auth/magic-link";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, answers } = body;

    const user = await getCurrentUser();
    const userId = user?.id || uuid();
    const userEmail = user?.email || email || "";

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const result = await createCheckoutSession({
      userEmail,
      userId,
      quizSessionId: answers ? "quiz_" + Date.now() : undefined,
      successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/result`,
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
