import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/magic-link";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  createPlanForUser,
  ensureLocalUser,
  normalizeQuizAnswers,
} from "@/lib/plans/create-plan";

export async function POST(req: NextRequest) {
  try {
    const limited = checkRateLimit(req, {
      namespace: "plan-generate",
      limit: 10,
      windowSeconds: 60,
    });
    if (limited) return limited;

    const { answers, quizSessionId } = await req.json();
    const parsedAnswers = normalizeQuizAnswers(answers);
    if (!parsedAnswers) {
      return NextResponse.json({ error: "Answers required" }, { status: 400 });
    }

    const user = await getCurrentUser();

    if (user) {
      ensureLocalUser({
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
      });
    }

    const { planId, plan } = createPlanForUser({
      userId: user?.id || null,
      answers: parsedAnswers,
      quizSessionId,
    });

    return NextResponse.json({
      planId,
      plan,
    });
  } catch (err) {
    console.error("Plan generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}
