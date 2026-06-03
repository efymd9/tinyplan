import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/magic-link";
import { getDb } from "@/lib/db";
import { plans, users } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

// A plan may be reclaimed only while it is still "fresh" — long enough to cover
// a sign-in round-trip, short enough that a stale anonymous plan can't be
// silently adopted later.
const RECLAIM_WINDOW_SECONDS = 24 * 60 * 60;

/**
 * Adopt an anonymous, recently-generated plan for the signed-in user.
 *
 * The checkout funnel generates the plan anonymously (no Clerk session yet) and
 * stashes its id in the browser as `tinyplan_pending_plan_id`. After the user
 * signs in, the dashboard-mounted reclaimer POSTs that id here to attach it.
 *
 * Adopts the plan ONLY if it exists, its user_id IS NULL, and it was created
 * within the last 24h; then sets user_id=current user, active=1, and
 * deactivates the user's other active plans.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();
    if (!planId || typeof planId !== "string") {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    const db = getDb();

    // Provision the local users row if missing (mirror /api/plan/generate's
    // user-provisioning) so the foreign key is satisfiable.
    const existingUser = db.select().from(users).where(eq(users.id, user.id)).get();
    if (!existingUser) {
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

    const plan = db.select().from(plans).where(eq(plans.id, planId)).get();

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Already owned by this user — idempotent success (re-fire is harmless).
    if (plan.user_id === user.id) {
      db.update(plans)
        .set({ active: 0 })
        .where(and(eq(plans.user_id, user.id), eq(plans.active, 1)))
        .run();
      db.update(plans).set({ active: 1 }).where(eq(plans.id, planId)).run();
      return NextResponse.json({ ok: true, planId });
    }

    // Owned by someone else — refuse.
    if (plan.user_id) {
      return NextResponse.json({ error: "Plan already claimed" }, { status: 403 });
    }

    // Unowned but stale (older than the reclaim window) — treat as expired.
    const now = Math.floor(Date.now() / 1000);
    if (plan.created_at != null && now - plan.created_at > RECLAIM_WINDOW_SECONDS) {
      return NextResponse.json({ error: "Plan expired" }, { status: 404 });
    }

    // Adopt: deactivate the user's other active plans, then attach + activate
    // this one. Guard the adoption update on user_id IS NULL so two concurrent
    // reclaims can't both believe they won.
    db.update(plans)
      .set({ active: 0 })
      .where(and(eq(plans.user_id, user.id), eq(plans.active, 1)))
      .run();

    db.update(plans)
      .set({ user_id: user.id, active: 1 })
      .where(and(eq(plans.id, planId), isNull(plans.user_id)))
      .run();

    return NextResponse.json({ ok: true, planId });
  } catch (err) {
    console.error("Plan reclaim error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
