import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/magic-link";
import { getDb } from "@/lib/db";
import { activities, planDayLogs, plans } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";

const VALID_STATUSES = ["done", "too_hard", "too_easy", "child_refused", "no_time", "skipped"];

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId, dayNumber, activityId, status } = await req.json();
    if (!planId || !dayNumber || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const db = getDb();

    const plan = db
      .select()
      .from(plans)
      .where(and(eq(plans.id, planId), eq(plans.user_id, user.id)))
      .get();

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    let resolvedActivityId: string | null = null;
    if (activityId) {
      const activityRow = db.select({ id: activities.id }).from(activities).where(eq(activities.id, activityId)).get();
      if (activityRow) {
        resolvedActivityId = activityId;
      }
    }

    const now = Math.floor(Date.now() / 1000);

    const existing = db
      .select()
      .from(planDayLogs)
      .where(and(eq(planDayLogs.plan_id, planId), eq(planDayLogs.day_number, dayNumber)))
      .get();

    if (existing) {
      db.update(planDayLogs)
        .set({ status, activity_id: resolvedActivityId, completed_at: now })
        .where(eq(planDayLogs.id, existing.id))
        .run();
    } else {
      db.insert(planDayLogs)
        .values({
          id: uuid(),
          plan_id: planId,
          day_number: dayNumber,
          activity_id: resolvedActivityId,
          status,
          completed_at: now,
        })
        .run();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Dashboard log error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
