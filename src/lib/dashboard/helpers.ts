import { getDb } from "@/lib/db";
import { plans, planDayLogs, quizSessions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

import type { DayPlan, WeeklyPlan, RoutineData, QuizSummary } from "@/lib/engine/plan-generator";
import type { TagProfile } from "@/lib/quiz/tags";

export type { DayPlan, WeeklyPlan, RoutineData, QuizSummary };
export { localizePlan } from "@/lib/engine/localize-plan";

export function getActivePlan(userId: string) {
  const db = getDb();
  return db.select().from(plans).where(and(eq(plans.user_id, userId), eq(plans.active, 1))).get();
}

export function getDayLogs(planId: string) {
  const db = getDb();
  return db.select().from(planDayLogs).where(eq(planDayLogs.plan_id, planId)).all();
}

export function getDayLog(planId: string, dayNumber: number) {
  const db = getDb();
  return db
    .select()
    .from(planDayLogs)
    .where(and(eq(planDayLogs.plan_id, planId), eq(planDayLogs.day_number, dayNumber)))
    .get();
}

export function getTodayDayNumber(planCreatedAt: number): number {
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - planCreatedAt;
  const day = Math.floor(elapsed / 86400) + 1;
  return Math.min(Math.max(day, 1), 7);
}

/**
 * Parse a stored plan's `plan_json` into a WeeklyPlan.
 *
 * A corrupt or malformed row must never 500 a dashboard page: callers treat a
 * `null` return as "no active plan" (the same empty-state they already render
 * when `getActivePlan` finds nothing). We log the offending plan id so the bad
 * row can be found and re-generated.
 */
export function parseWeeklyPlan(
  planJson: string,
  planId?: string,
): WeeklyPlan | null {
  try {
    const parsed = JSON.parse(planJson) as unknown;
    // Guard against valid-but-wrong JSON (e.g. `null`, an array, a primitive,
    // or an object missing the `days` array the dashboard iterates over).
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray((parsed as WeeklyPlan).days)
    ) {
      console.error(
        `[parseWeeklyPlan] plan ${planId ?? "(unknown id)"} is missing a valid \`days\` array; treating as no plan.`,
      );
      return null;
    }
    return parsed as WeeklyPlan;
  } catch (err) {
    console.error(
      `[parseWeeklyPlan] failed to parse plan_json for plan ${planId ?? "(unknown id)"}:`,
      err,
    );
    return null;
  }
}

/** Loads the quiz TagProfile behind a plan, used to personalise the daily toolkit. */
export function getQuizTagProfile(quizSessionId: string | null | undefined): TagProfile | null {
  if (!quizSessionId) return null;
  const db = getDb();
  const session = db.select().from(quizSessions).where(eq(quizSessions.id, quizSessionId)).get();
  if (!session?.tags_json) return null;
  try {
    return JSON.parse(session.tags_json) as TagProfile;
  } catch {
    return null;
  }
}
