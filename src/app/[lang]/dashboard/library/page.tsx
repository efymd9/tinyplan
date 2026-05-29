import { getCurrentUser } from "@/lib/auth/magic-link";
import { getActivePlan, getDayLogs, parseWeeklyPlan, localizePlan } from "@/lib/dashboard/helpers";
import { getDb } from "@/lib/db";
import { activities } from "@/lib/db/schema";
import { LibraryClient } from "./library-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFallbackActivities } from "@/lib/engine/fallback-activities";
import type { Activity } from "@/lib/engine/plan-generator";
import { deriveBestFor } from "@/lib/engine/plan-generator";
import { localizeHref } from "@/lib/i18n/href";
import { resolveLocale, type Locale } from "@/lib/i18n/config";
import type { Metadata } from "next";

import type { PlanActivity } from "@/lib/engine/plan-generator";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  return {
    title: locale === "es" ? "Biblioteca de actividades — TinyPlan" : "Activity Library — TinyPlan",
  };
}

const COPY = {
  es: {
    noActivitiesTitle: "Aún no hay actividades",
    noActivitiesDesc:
      "Haz el test rápido para obtener un plan semanal personalizado para tu peque.",
    startQuiz: "Empezar el test",
  },
  en: {
    noActivitiesTitle: "No activities yet",
    noActivitiesDesc:
      "Take the quick quiz to get a personalised weekly plan for your child.",
    startQuiz: "Start the Quiz",
  },
} as const;

function planActivityToLibraryItem(pa: PlanActivity, dayNumber: number) {
  return {
    id: pa.id,
    title: pa.title,
    description: pa.description ?? null,
    time_minutes: pa.time_minutes ?? null,
    energy_level: pa.energy_level ?? null,
    category: pa.category ?? null,
    materials: pa.materials ?? null,
    parent_script: pa.parent_script ?? null,
    steps_json: pa.steps_json ?? null,
    why_it_works: pa.why_it_works ?? null,
    easier_version: pa.easier_version ?? null,
    bestFor: pa.bestFor ?? null,
    age_min: pa.age_min ?? null,
    age_max: pa.age_max ?? null,
    dayNumber,
  };
}

/**
 * Maps a DB activity row to a library item, re-localizing its text fields from
 * the locale-aware activity catalog (keyed by stable `id`). Falls back to the
 * stored English row text when an id has no localized counterpart.
 */
function dbActivityToLibraryItem(
  row: typeof activities.$inferSelect,
  catalog: Map<string, Activity>,
  locale: Locale,
) {
  const loc = catalog.get(row.id);
  return {
    id: row.id,
    title: loc?.title ?? row.title,
    description: loc?.description ?? row.description ?? null,
    time_minutes: row.time_minutes ?? null,
    energy_level: row.energy_level ?? null,
    category: row.category ?? null,
    materials: loc?.materials ?? row.materials ?? null,
    parent_script: loc?.parent_script ?? row.parent_script ?? null,
    steps_json: loc?.steps_json ?? row.steps_json ?? null,
    why_it_works: loc?.why_it_works ?? row.why_it_works ?? null,
    easier_version: loc?.easier_version ?? row.easier_version ?? null,
    bestFor: loc ? deriveBestFor(loc, locale) : null,
    age_min: row.age_min ?? null,
    age_max: row.age_max ?? null,
    dayNumber: null,
  };
}

function fallbackToLibraryItem(fb: Activity, locale: Locale) {
  return {
    id: fb.id,
    title: fb.title,
    description: fb.description ?? null,
    time_minutes: fb.time_minutes ?? null,
    energy_level: fb.energy_level ?? null,
    category: fb.category ?? null,
    materials: fb.materials ?? null,
    parent_script: fb.parent_script ?? null,
    steps_json: fb.steps_json ?? null,
    why_it_works: fb.why_it_works ?? null,
    easier_version: fb.easier_version ?? null,
    bestFor: deriveBestFor(fb, locale),
    age_min: fb.age_min ?? null,
    age_max: fb.age_max ?? null,
    dayNumber: null,
  };
}

function getCurrentUnixSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export default async function LibraryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const copy = COPY[locale];

  // Locale-aware activity catalog keyed by stable `id`, used to re-localize
  // DB rows ("More Ideas") and fallbacks at render time. DB stays English.
  const localizedCatalog = new Map<string, Activity>(
    getFallbackActivities(locale).map((a) => [a.id, a]),
  );

  const user = await getCurrentUser();
  if (!user) return null;

  const plan = getActivePlan(user.id);

  let planItems: ReturnType<typeof planActivityToLibraryItem>[] = [];
  let todayActivityId: string | null = null;
  const completedIds = new Set<string>();

  if (plan) {
    const weeklyPlan = localizePlan(parseWeeklyPlan(plan.plan_json), locale);
    planItems = weeklyPlan.days.map((d) =>
      planActivityToLibraryItem(d.activity, d.dayNumber),
    );

    const dayLogs = getDayLogs(plan.id);
    for (const log of dayLogs) {
      if (log.status === "done" && log.activity_id) {
        completedIds.add(log.activity_id);
      }
    }

    const now = getCurrentUnixSeconds();
    const elapsed = now - (plan.created_at ?? now);
    const todayDayNum = Math.min(Math.max(Math.floor(elapsed / 86400) + 1, 1), 7);
    const todayDay = weeklyPlan.days.find((d) => d.dayNumber === todayDayNum);
    if (todayDay) todayActivityId = todayDay.activity.id;
  }

  const db = getDb();
  const allDbRows = db.select().from(activities).all();

  const planIds = new Set(planItems.map((p) => p.id));
  const moreIdeas = allDbRows
    .filter((row) => !planIds.has(row.id))
    .map((row) => dbActivityToLibraryItem(row, localizedCatalog, locale));

  const noPrep = [
    ...planItems.filter((a) =>
      !a.materials || a.materials.trim() === "" || a.materials === "none"
    ),
    ...moreIdeas.filter((a) =>
      !a.materials || a.materials.trim() === "" || a.materials === "none"
    ),
  ];
  type LibraryItem = ReturnType<typeof planActivityToLibraryItem> | ReturnType<typeof dbActivityToLibraryItem>;
  let recommended: LibraryItem[];
  if (noPrep.length >= 3) {
    recommended = noPrep.slice(0, 6);
  } else {
    const seen = new Set(noPrep.map((a) => a.id));
    const extra = ([...planItems, ...moreIdeas] as LibraryItem[]).filter((a) => !seen.has(a.id));
    recommended = [...noPrep, ...extra].slice(0, 6);
  }

  // If there are no activities at all, use fallbacks so library is never empty
  const allIds = new Set([...planIds, ...moreIdeas.map((m) => m.id)]);
  let fallbackItems: ReturnType<typeof fallbackToLibraryItem>[] = [];
  if (planItems.length === 0 && moreIdeas.length === 0) {
    fallbackItems = getFallbackActivities(locale)
      .filter((fb) => !allIds.has(fb.id))
      .map((fb) => fallbackToLibraryItem(fb, locale));
  }

  if (planItems.length === 0 && moreIdeas.length === 0 && fallbackItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">{copy.noActivitiesTitle}</h1>
        <p className="text-muted-foreground mb-6">{copy.noActivitiesDesc}</p>
        <Link href={localizeHref("/quiz", locale)}>
          <Button size="lg">{copy.startQuiz}</Button>
        </Link>
      </div>
    );
  }

  return (
    <LibraryClient
      planActivities={planItems}
      moreActivities={moreIdeas.length > 0 ? moreIdeas : fallbackItems}
      recommendedActivities={recommended}
      todayActivityId={todayActivityId}
      completedIds={Array.from(completedIds)}
    />
  );
}
