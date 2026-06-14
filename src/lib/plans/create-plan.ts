import { and, eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { getDb } from '@/lib/db';
import { activities, plans, users } from '@/lib/db/schema';
import { buildTagProfile } from '@/lib/quiz/tags';
import { generateWeeklyPlan } from '@/lib/engine/plan-generator';
import { FALLBACK_ACTIVITIES } from '@/lib/engine/fallback-activities';
import type { AuthUser } from '@/lib/auth/magic-link';

export type QuizAnswers = Record<string, string | string[]>;

export function normalizeQuizAnswers(value: unknown): QuizAnswers | null {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return normalizeQuizAnswers(parsed);
    } catch {
      return null;
    }
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    const out: QuizAnswers = {};
    for (const [key, raw] of Object.entries(value)) {
      if (typeof raw === 'string') {
        out[key] = raw;
      } else if (Array.isArray(raw)) {
        const strings = raw.filter((item): item is string => typeof item === 'string');
        if (strings.length > 0) out[key] = strings;
      }
    }
    return Object.keys(out).length > 0 ? out : null;
  }
  return null;
}

export function ensureLocalUser(params: {
  id: string;
  email: string;
  name?: string | null;
  subscriptionStatus?: AuthUser['subscriptionStatus'];
}) {
  const db = getDb();
  const existing = db.select().from(users).where(eq(users.id, params.id)).get();
  if (existing) return existing;

  const now = Math.floor(Date.now() / 1000);
  db.insert(users)
    .values({
      id: params.id,
      email: params.email,
      name: params.name ?? null,
      subscription_status: params.subscriptionStatus ?? 'free',
      created_at: now,
      updated_at: now,
    })
    .run();

  return db.select().from(users).where(eq(users.id, params.id)).get();
}

export function createPlanForUser(params: {
  userId: string | null;
  answers: QuizAnswers;
  quizSessionId?: string | null;
}): { planId: string; plan: ReturnType<typeof generateWeeklyPlan> } {
  const db = getDb();
  const tagProfile = buildTagProfile(params.answers);
  const allActivities = db.select().from(activities).all();
  const activityPool = allActivities.length > 0 ? allActivities : FALLBACK_ACTIVITIES;
  const weeklyPlan = generateWeeklyPlan(tagProfile, activityPool);

  if (params.userId) {
    db.update(plans)
      .set({ active: 0 })
      .where(and(eq(plans.user_id, params.userId), eq(plans.active, 1)))
      .run();
  } else if (params.quizSessionId) {
    db.update(plans)
      .set({ active: 0 })
      .where(and(eq(plans.quiz_session_id, params.quizSessionId), eq(plans.active, 1)))
      .run();
  }

  const planId = uuid();
  db.insert(plans)
    .values({
      id: planId,
      user_id: params.userId,
      quiz_session_id: params.quizSessionId || null,
      profile_name: weeklyPlan.profile,
      goal: weeklyPlan.goal,
      plan_json: JSON.stringify(weeklyPlan),
      week_number: 1,
      active: 1,
      created_at: Math.floor(Date.now() / 1000),
    })
    .run();

  return { planId, plan: weeklyPlan };
}
