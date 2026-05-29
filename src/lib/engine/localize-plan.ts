// ── Render-time plan re-localization ────────────────────────────────────────
//
// Stored plans (`plan_json`) are ALWAYS English in the DB. We never localize at
// write time. Instead, `localizePlan` re-derives every human-readable string at
// render time from the plan's stable keys (activity `id`s, tag keys, routine
// `id`, and the persisted `tagProfile`). Structural / non-text fields
// (timeMinutes, routineMoment, dayNumber, ids, ages, energy_level, category)
// are left untouched.
//
// Lookups fall back gracefully to the stored (English) text when a localized
// counterpart is missing, so a plan can never render blank.

import type { Locale } from "@/lib/i18n/config";
import type { WeeklyPlan, Activity } from "./plan-generator";
import { buildQuizSummary, deriveBestFor } from "./plan-generator";
import { getFallbackActivities } from "./fallback-activities";
import { localizeRoutine } from "@/lib/routines/routines";
import type { PlayProfile } from "@/lib/quiz/tags";
import {
  getProfileDisplayName,
  getGoalDisplayText,
  getPlanStyleDisplayText,
  getMomentDisplayText,
} from "@/lib/quiz/tags";
import { getHardMomentDisplay } from "@/lib/personalization/personalize";

/**
 * Re-localize a stored (English) weekly plan for the active locale.
 *
 * For `'en'` the plan is returned unchanged (the stored content is already
 * English). For `'es'` every text field is re-derived from the plan's stable
 * keys, with graceful fallback to the stored English text when a key has no
 * localized counterpart.
 */
export function localizePlan(plan: WeeklyPlan, locale: Locale): WeeklyPlan {
  if (locale === "en") return plan;

  // Localized activity catalog keyed by the stable activity `id`.
  const catalog = new Map<string, Activity>(
    getFallbackActivities(locale).map((a) => [a.id, a]),
  );

  const days = plan.days.map((day) => {
    const loc = catalog.get(day.activity.id);
    // Graceful fallback: unknown id keeps the stored English text intact.
    if (!loc) return day;

    return {
      ...day,
      // Re-localize the day's parent script from the localized activity.
      parentScript: loc.parent_script ?? day.parentScript,
      activity: {
        ...day.activity,
        title: loc.title ?? day.activity.title,
        description: loc.description ?? day.activity.description,
        materials: loc.materials ?? day.activity.materials,
        steps_json: loc.steps_json ?? day.activity.steps_json,
        parent_script: loc.parent_script ?? day.activity.parent_script,
        fallback_if_refuses:
          loc.fallback_if_refuses ?? day.activity.fallback_if_refuses,
        why_it_works: loc.why_it_works ?? day.activity.why_it_works,
        easier_version: loc.easier_version ?? day.activity.easier_version,
        bestFor: deriveBestFor(loc, locale),
        // Structural fields (time_minutes, category, energy_level, age_*, id)
        // are preserved via the spread of `day.activity`.
      },
    };
  });

  return {
    ...plan,
    profileDisplayName: getProfileDisplayName(
      plan.profile as PlayProfile,
      locale,
    ),
    goalDisplayText: getGoalDisplayText(plan.goal, locale),
    planStyleDisplay: getPlanStyleDisplayText(plan.plan_style, locale),
    bestMomentDisplay: getMomentDisplayText(plan.bestMoment, locale),
    hardMomentDisplay: plan.hardMoment
      ? getHardMomentDisplay(plan.hardMoment, locale)
      : plan.hardMomentDisplay,
    routine: plan.routine ? localizeRoutine(plan.routine, locale) : plan.routine,
    // Guard: only re-derive the quiz summary when the stable tagProfile exists.
    // Older plans persisted before Task 21 have no tagProfile — keep their
    // stored (English) summary rather than dropping it.
    quizSummary: plan.tagProfile
      ? buildQuizSummary(plan.tagProfile, locale)
      : plan.quizSummary,
    days,
  };
}
