import type { Locale } from "@/lib/i18n/config";
import { defaultLocale } from "@/lib/i18n/config";
import { GROWTH_PATH_EN } from "./parent-growth-path.en";
import { GROWTH_PATH_ES } from "./parent-growth-path.es";

export type SkillAccent = "play" | "skill" | "sage" | "yellow" | "lavender";

export interface ParentSkill {
  id: string;
  dayNumber: number;
  title: string;
  playMomentTitle: string;
  whenToUse: string;
  whatYouPractice: string;
  steps: [string, string, string];
  scripts: string[];
  examples: string[];
  avoid: string;
  tinyWin: string;
  realLifePractice: string;
  backup: string;
  tags: string[];
  accent: SkillAccent;
}

const GROWTH_PATHS: Record<Locale, ParentSkill[]> = {
  es: GROWTH_PATH_ES,
  en: GROWTH_PATH_EN,
};

/**
 * Returns the 7-skill parent growth path for the given locale.
 * Falls back to the default locale's path for unknown locales.
 */
export function getGrowthPath(locale: Locale): ParentSkill[] {
  return GROWTH_PATHS[locale] ?? GROWTH_PATHS[defaultLocale];
}

/**
 * Back-compat: original export, bound to English.
 * New code should prefer locale-aware `getGrowthPath(locale)`.
 */
export const PARENT_GROWTH_PATH: ParentSkill[] = GROWTH_PATH_EN;

export function getSkillByDay(
  dayNumber: number,
  locale: Locale = "en",
): ParentSkill | undefined {
  return getGrowthPath(locale).find((s) => s.dayNumber === dayNumber);
}

export function getSkillById(
  id: string,
  locale: Locale = "en",
): ParentSkill | undefined {
  return getGrowthPath(locale).find((s) => s.id === id);
}
