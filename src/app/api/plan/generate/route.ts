import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { activities, plans, users } from "@/lib/db/schema";
import { buildTagProfile } from "@/lib/quiz/tags";
import { generateWeeklyPlan } from "@/lib/engine/plan-generator";
import { FALLBACK_ACTIVITIES } from "@/lib/engine/fallback-activities";
import { getCurrentUser } from "@/lib/auth/magic-link";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { answers, quizSessionId } = await req.json();

    const tagProfile = buildTagProfile(answers);
    const db = getDb();

    const allActivities = db.select().from(activities).all();

    const activityPool = allActivities.length > 0 ? allActivities : FALLBACK_ACTIVITIES;

    const weeklyPlan = generateWeeklyPlan(tagProfile, activityPool);
    const user = await getCurrentUser();

    if (user) {
      const existing = db.select().from(users).where(eq(users.id, user.id)).get();
      if (!existing) {
        const now = Math.floor(Date.now() / 1000);
        db.insert(users)
          .values({
            id: user.id,
            email: user.email,
            subscription_status: user.subscriptionStatus,
            created_at: now,
            updated_at: now,
          })
          .run();
      }
    }

    if (user) {
      db.update(plans)
        .set({ active: 0 })
        .where(and(eq(plans.user_id, user.id), eq(plans.active, 1)))
        .run();
    } else if (quizSessionId) {
      db.update(plans)
        .set({ active: 0 })
        .where(and(eq(plans.quiz_session_id, quizSessionId), eq(plans.active, 1)))
        .run();
    }

    const planId = uuid();
    db.insert(plans)
      .values({
        id: planId,
        user_id: user?.id || null,
        quiz_session_id: quizSessionId || null,
        profile_name: weeklyPlan.profile,
        goal: weeklyPlan.goal,
        plan_json: JSON.stringify(weeklyPlan),
        week_number: 1,
        active: 1,
        created_at: Math.floor(Date.now() / 1000),
      })
      .run();

    return NextResponse.json({
      planId,
      plan: weeklyPlan,
    });
  } catch (err) {
    console.error("Plan generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}
