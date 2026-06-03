// ── Quiz Screen Types, Helpers & Locale Registry (v4 — Smart Plan Builder) ──
//
// This module owns the SHARED types and condition helpers used by every locale
// variant of the quiz, and exposes locale-aware getters. The actual screen data
// lives in ./questions.en.ts and ./questions.es.ts (identical structure; only
// human-readable text differs).
//
// Back-compat: every name the original `questions.ts` exported is re-exported
// here pointing at the ENGLISH variant, so existing importers keep compiling
// unchanged. New consumers should prefer the locale-aware getters.

import type { Locale } from '@/lib/i18n/config';

// ── Types ───────────────────────────────────────────────────────────────────

export type ScreenType =
  | 'single'
  | 'multiple'
  | 'email'
  | 'loading'
  | 'affirmation'
  | 'micro-insight'
  | 'preview';

export interface QuizOption {
  id: string;
  label: string;
  tags?: Record<string, string | string[]>;
}

export interface QuizScreen {
  id: string;
  type: ScreenType;
  stage: string;
  stageLabel: string;
  question?: string;
  subtitle?: string;
  instruction?: string;
  text?: string;
  dynamicText?: (answers: Record<string, string | string[]>) => string;
  dynamicLoadingTexts?: (answers: Record<string, string | string[]>) => string[];
  options?: QuizOption[];
  maxSelections?: number;
  condition?: (answers: Record<string, string | string[]>) => boolean;
}

// ── Helpers for conditions & display (shared across locales) ─────────────────

export function answerIncludes(answers: Record<string, string | string[]>, screenId: string, value: string): boolean {
  const val = answers[screenId];
  if (!val) return false;
  return Array.isArray(val) ? val.includes(value) : val === value;
}

export function answerIs(answers: Record<string, string | string[]>, screenId: string, value: string): boolean {
  const val = answers[screenId];
  if (!val) return false;
  return Array.isArray(val) ? val[0] === value : val === value;
}

export function getFirst(answers: Record<string, string | string[]>, screenId: string): string {
  const val = answers[screenId];
  if (!val) return '';
  return Array.isArray(val) ? val[0] ?? '' : val;
}

// ── Locale data imports ──────────────────────────────────────────────────────

import {
  QUIZ_QUESTIONS_EN,
  PAIN_DISPLAY_EN,
  MOMENT_DISPLAY_EN,
  AGE_DISPLAY_EN,
  CHILD_STYLE_TO_PROFILE_EN,
  TIME_DISPLAY_EN,
} from './questions.en';
import {
  QUIZ_QUESTIONS_ES,
  PAIN_DISPLAY_ES,
  MOMENT_DISPLAY_ES,
  AGE_DISPLAY_ES,
  CHILD_STYLE_TO_PROFILE_ES,
  TIME_DISPLAY_ES,
} from './questions.es';

// ── Locale-aware getters ─────────────────────────────────────────────────────

export function getQuestions(locale: Locale): QuizScreen[] {
  return locale === 'es' ? QUIZ_QUESTIONS_ES : QUIZ_QUESTIONS_EN;
}

export function getPainDisplay(locale: Locale): Record<string, string> {
  return locale === 'es' ? PAIN_DISPLAY_ES : PAIN_DISPLAY_EN;
}

export function getMomentDisplay(locale: Locale): Record<string, string> {
  return locale === 'es' ? MOMENT_DISPLAY_ES : MOMENT_DISPLAY_EN;
}

export function getAgeDisplay(locale: Locale): Record<string, string> {
  return locale === 'es' ? AGE_DISPLAY_ES : AGE_DISPLAY_EN;
}

export function getChildStyleToProfile(locale: Locale): Record<string, { name: string; desc: string }> {
  return locale === 'es' ? CHILD_STYLE_TO_PROFILE_ES : CHILD_STYLE_TO_PROFILE_EN;
}

export function getTimeDisplay(locale: Locale): Record<string, string> {
  return locale === 'es' ? TIME_DISPLAY_ES : TIME_DISPLAY_EN;
}

/** Locale-aware visible-screen filter (preferred over the back-compat default). */
export function getVisibleScreensForLocale(
  answers: Record<string, string | string[]>,
  locale: Locale,
): QuizScreen[] {
  return getQuestions(locale).filter((s) => !s.condition || s.condition(answers));
}

// ── Back-compat: original export names (point at the ENGLISH variant) ────────

/** @deprecated Prefer `getQuestions(locale)`. Kept for existing importers. */
export const quizScreens: QuizScreen[] = QUIZ_QUESTIONS_EN;

/**
 * Computes which screens are visible for the given answers (English).
 * @deprecated Prefer `getVisibleScreensForLocale(answers, locale)`.
 */
export function getVisibleScreens(answers: Record<string, string | string[]>): QuizScreen[] {
  return getVisibleScreensForLocale(answers, 'en');
}
