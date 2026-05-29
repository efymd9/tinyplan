"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getVisibleScreensForLocale, type QuizScreen } from "@/lib/quiz/questions";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import { localizeHref } from "@/lib/i18n/href";
import { getShellCopy, type ShellCopy } from "./quiz-shell-content";
import type { Dictionary } from "@/lib/i18n/en";

const STORAGE_KEY = "tinyplan_quiz";
const RESULT_STORAGE_KEY = "tinyplan_quiz_result";
const STATE_VERSION = 4;

interface QuizState {
  version: number;
  step: number;
  answers: Record<string, string | string[]>;
  email: string;
  childName: string;
}

function loadState(): QuizState {
  if (typeof window === "undefined") return freshState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.version === STATE_VERSION) return parsed;
    }
  } catch {}
  return freshState();
}

function freshState(): QuizState {
  return { version: STATE_VERSION, step: 0, answers: {}, email: "", childName: "" };
}

function saveState(state: QuizState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function QuizShell() {
  const router = useRouter();
  const locale = useLocale();
  const t = useT();
  const copy = getShellCopy(locale);
  const { track } = useAnalytics();
  const [state, setState] = useState<QuizState>(loadState);
  const [loadingStep, setLoadingStep] = useState(0);
  const [emailError, setEmailError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    track({ event: "quiz_started" });
    return () => clearTimeout(timer);
  }, [track]);

  const visibleScreens = useMemo(
    () => getVisibleScreensForLocale(state.answers, locale),
    [state.answers, locale]
  );

  const screen = visibleScreens[state.step] as QuizScreen | undefined;
  const total = visibleScreens.length;

  const persist = useCallback((next: QuizState) => {
    setState(next);
    saveState(next);
  }, []);

  const finishQuiz = useCallback(
    (answers: Record<string, string | string[]>, email: string) => {
      localStorage.removeItem(STORAGE_KEY);
      try {
        sessionStorage.setItem(
          RESULT_STORAGE_KEY,
          JSON.stringify({ answers, email })
        );
      } catch {}
      router.push(localizeHref("/result", locale));
    },
    [router, locale]
  );

  const goNext = useCallback(() => {
    const nextStep = state.step + 1;
    if (nextStep >= total) {
      finishQuiz(state.answers, state.email);
      return;
    }
    const next = { ...state, step: nextStep };
    persist(next);
    track({
      event: "quiz_step_viewed",
      properties: { step: nextStep, stage: visibleScreens[nextStep]?.id ?? "" },
    });
  }, [state, total, persist, finishQuiz, track, visibleScreens]);

  const goBack = useCallback(() => {
    if (state.step <= 0) return;
    persist({ ...state, step: state.step - 1 });
  }, [state, persist]);

  const selectSingle = useCallback(
    (optionId: string) => {
      if (!screen) return;
      const next = {
        ...state,
        answers: { ...state.answers, [screen.id]: optionId },
      };
      persist(next);
      track({
        event: "quiz_step_answered",
        properties: { step: state.step, answer: optionId },
      });
      setTimeout(() => {
        const newVisible = getVisibleScreensForLocale(next.answers, locale);
        const s = state.step + 1;
        if (s >= newVisible.length) {
          finishQuiz(next.answers, state.email);
          return;
        }
        persist({ ...next, step: s });
        track({
          event: "quiz_step_viewed",
          properties: { step: s, stage: newVisible[s]?.id ?? "" },
        });
      }, 250);
    },
    [state, screen, persist, finishQuiz, track, locale]
  );

  const toggleMultiple = useCallback(
    (optionId: string, max: number) => {
      if (!screen) return;
      const current = (state.answers[screen.id] as string[]) || [];
      let updated: string[];
      if (current.includes(optionId)) {
        updated = current.filter((id) => id !== optionId);
      } else if (current.length < max) {
        updated = [...current, optionId];
      } else {
        return;
      }
      persist({
        ...state,
        answers: { ...state.answers, [screen.id]: updated },
      });
    },
    [state, screen, persist]
  );

  const confirmMultiple = useCallback(
    (selected: string[]) => {
      if (!screen || selected.length === 0) return;
      const updatedAnswers = { ...state.answers, [screen.id]: selected };
      const next = { ...state, answers: updatedAnswers };
      persist(next);
      track({
        event: "quiz_step_answered",
        properties: { step: state.step, answer: selected },
      });
      const newVisible = getVisibleScreensForLocale(updatedAnswers, locale);
      const nextStep = state.step + 1;
      if (nextStep >= newVisible.length) {
        finishQuiz(updatedAnswers, state.email);
        return;
      }
      persist({ ...next, step: nextStep });
      track({
        event: "quiz_step_viewed",
        properties: { step: nextStep, stage: newVisible[nextStep]?.id ?? "" },
      });
    },
    [state, screen, track, persist, finishQuiz, locale]
  );

  const submitEmail = useCallback(() => {
    const email = state.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(copy.emailInvalid);
      return;
    }
    setEmailError("");
    track({
      event: "email_submitted",
      properties: { email_domain: email.split("@")[1] },
    });
    goNext();
  }, [state.email, track, goNext, copy.emailInvalid]);

  const submitName = useCallback(
    (skip: boolean) => {
      if (!screen) return;
      const next = {
        ...state,
        answers: {
          ...state.answers,
          [screen.id]: skip ? '' : state.childName.trim(),
        },
      };
      persist(next);
      track({
        event: "quiz_step_answered",
        properties: { step: state.step, answer: skip ? 'skipped' : 'provided' },
      });
      const newVisible = getVisibleScreensForLocale(next.answers, locale);
      const nextStep = state.step + 1;
      if (nextStep >= newVisible.length) {
        finishQuiz(next.answers, state.email);
        return;
      }
      persist({ ...next, step: nextStep });
    },
    [state, screen, persist, track, finishQuiz, locale]
  );

  // Loading screen auto-advance
  useEffect(() => {
    if (!screen || screen.type !== "loading") return;

    const texts = screen.dynamicLoadingTexts
      ? screen.dynamicLoadingTexts(state.answers)
      : JSON.parse(screen.text || '[]') as string[];

    let i = 0;
    const resetTimer = setTimeout(() => setLoadingStep(0), 0);
    const interval = setInterval(() => {
      i++;
      setLoadingStep(i);
      if (i >= texts.length) {
        clearInterval(interval);
        setTimeout(() => {
          track({ event: "quiz_completed" });
          goNext();
        }, 1500);
      }
    }, 2000);
    return () => {
      clearTimeout(resetTimer);
      clearInterval(interval);
    };
  }, [screen?.id, screen?.type, state.answers, track, goNext, screen]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center surface-warm-gradient">
        <div className="animate-pulse text-muted-foreground">{t.common.loading}</div>
      </div>
    );
  }

  if (!screen) return null;

  return (
    <div className="min-h-screen flex flex-col surface-warm-gradient">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-bar border-b border-border-whisper shadow-xs px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-2 sm:gap-3">
          {state.step > 0 && screen.type !== "loading" && (
            <button
              onClick={goBack}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-xl hover:bg-muted/60 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              aria-label={copy.goBack}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <BrandLogo width={96} priority className="shrink-0" />
          <div className="flex-1">
            <ProgressBar
              current={state.step}
              total={total - 1}
              stageLabel={screen.stageLabel}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium tabular-nums shrink-0">
            {state.step + 1}/{total}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {screen.type === "loading" ? (
            <LoadingScreen
              texts={
                screen.dynamicLoadingTexts
                  ? screen.dynamicLoadingTexts(state.answers)
                  : JSON.parse(screen.text || '[]') as string[]
              }
              currentStep={loadingStep}
            />
          ) : screen.type === "email" ? (
            <EmailScreen
              email={state.email}
              error={emailError}
              copy={copy}
              onChange={(e) => persist({ ...state, email: e })}
              onSubmit={submitEmail}
            />
          ) : screen.type === "name-input" ? (
            <NameInputScreen
              screen={screen}
              value={state.childName}
              copy={copy}
              t={t}
              onChange={(v) => persist({ ...state, childName: v })}
              onContinue={() => submitName(false)}
              onSkip={() => submitName(true)}
            />
          ) : screen.type === "preview" ? (
            <PreviewScreen
              screen={screen}
              answers={state.answers}
              copy={copy}
              onContinue={goNext}
            />
          ) : screen.type === "affirmation" || screen.type === "micro-insight" ? (
            <AffirmationScreen
              screen={screen}
              answers={state.answers}
              t={t}
              onContinue={goNext}
            />
          ) : screen.type === "single" ? (
            <SingleChoiceScreen
              screen={screen}
              selected={state.answers[screen.id] as string}
              onSelect={selectSingle}
            />
          ) : screen.type === "multiple" ? (
            <MultipleChoiceScreen
              screen={screen}
              selected={(state.answers[screen.id] as string[]) || []}
              copy={copy}
              t={t}
              onToggle={(id) =>
                toggleMultiple(id, screen.maxSelections || 2)
              }
              onConfirm={(sel) => confirmMultiple(sel)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SingleChoiceScreen({
  screen,
  selected,
  onSelect,
}: {
  screen: QuizScreen;
  selected?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-2xl font-bold mb-2 leading-tight">
        {screen.question}
      </h2>
      {screen.subtitle && (
        <p className="text-muted-foreground mb-6">{screen.subtitle}</p>
      )}
      <div className="flex flex-col gap-2.5 mt-6">
        {screen.options?.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className={`w-full text-left px-5 py-4 flex items-center gap-3.5 ${
                isSelected ? "quiz-option quiz-option-selected" : "quiz-option"
              }`}
            >
              <span
                className={`w-[22px] h-[22px] rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150 ${
                  isSelected
                    ? "border-primary bg-primary shadow-xs"
                    : "border-muted-foreground/30"
                }`}
              >
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-white animate-check-pop" />
                )}
              </span>
              <span className="text-base font-medium leading-snug">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultipleChoiceScreen({
  screen,
  selected,
  copy,
  t,
  onToggle,
  onConfirm,
}: {
  screen: QuizScreen;
  selected: string[];
  copy: ShellCopy;
  t: Dictionary;
  onToggle: (id: string) => void;
  onConfirm: (selected: string[]) => void;
}) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-2xl font-bold mb-2 leading-tight">
        {screen.question}
      </h2>
      {screen.instruction && (
        <p className="text-muted-foreground mb-6">{screen.instruction}</p>
      )}
      <div className="flex flex-col gap-2.5 mt-6">
        {screen.options?.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => onToggle(opt.id)}
              className={`w-full text-left px-5 py-4 flex items-center gap-3.5 ${
                isSelected ? "quiz-option quiz-option-selected" : "quiz-option"
              }`}
            >
              <span
                className={`w-[22px] h-[22px] rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-150 ${
                  isSelected
                    ? "bg-primary border-primary shadow-xs"
                    : "border-muted-foreground/30"
                }`}
              >
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="animate-check-pop">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span className="text-base font-medium leading-snug">{opt.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-8">
        <Button
          onClick={() => onConfirm(selected)}
          disabled={selected.length === 0}
          className="w-full"
          size="lg"
        >
          {t.common.continue}
        </Button>
        {screen.maxSelections && (
          <p className="text-xs text-center text-muted-foreground mt-2.5">
            {copy.selectUpTo(screen.maxSelections)}
          </p>
        )}
      </div>
    </div>
  );
}

function AffirmationScreen({
  screen,
  answers,
  t,
  onContinue,
}: {
  screen: QuizScreen;
  answers: Record<string, string | string[]>;
  t: Dictionary;
  onContinue: () => void;
}) {
  const text = screen.dynamicText
    ? screen.dynamicText(answers)
    : screen.text || "";

  return (
    <div className="text-center py-8 animate-slide-up">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-light to-primary/10 shadow-elevated flex items-center justify-center mx-auto mb-6 rotate-3">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          className="text-primary -rotate-3"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            fill="currentColor"
          />
        </svg>
      </div>
      <p className="text-xl font-semibold leading-relaxed mb-3 max-w-md mx-auto whitespace-pre-line">
        {text}
      </p>
      {screen.subtitle && (
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
          {screen.subtitle}
        </p>
      )}
      <Button onClick={onContinue} size="lg" className="w-full max-w-xs">
        {t.common.continue}
      </Button>
    </div>
  );
}

function NameInputScreen({
  screen,
  value,
  copy,
  t,
  onChange,
  onContinue,
  onSkip,
}: {
  screen: QuizScreen;
  value: string;
  copy: ShellCopy;
  t: Dictionary;
  onChange: (v: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="py-8 animate-slide-up">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-light to-accent/10 shadow-card flex items-center justify-center mb-5">
        <svg className="w-7 h-7 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2 leading-tight">
        {screen.question}
      </h2>
      {screen.subtitle && (
        <p className="text-muted-foreground mb-6">{screen.subtitle}</p>
      )}
      <div className="max-w-sm">
        <Input
          type="text"
          placeholder={copy.namePlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) onContinue();
          }}
        />
        <div className="flex gap-3 mt-6">
          <Button onClick={onContinue} disabled={!value.trim()} size="lg" className="flex-1">
            {t.common.continue}
          </Button>
          <Button onClick={onSkip} variant="outline" size="lg" className="flex-1">
            {t.common.skip}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PreviewScreen({
  screen,
  answers,
  copy,
  onContinue,
}: {
  screen: QuizScreen;
  answers: Record<string, string | string[]>;
  copy: ShellCopy;
  onContinue: () => void;
}) {
  const lines = screen.dynamicText
    ? screen.dynamicText(answers).split('\n')
    : [];

  return (
    <div className="py-8 animate-slide-up">
      <div className="text-center mb-6">
        <div className="mb-4">
          <Image
            src="/images/illustrations/tinyplan-quiz-discovery.png"
            alt={copy.previewImageAlt}
            width={1448}
            height={1086}
            className="w-full max-w-[240px] mx-auto h-auto rounded-xl"
          />
        </div>
        <h2 className="text-2xl font-bold mb-1">{screen.text}</h2>
        <p className="text-muted-foreground">{copy.previewSubtitle}</p>
      </div>
      <div className="hero-card p-6 mb-8">
        <ul className="space-y-3.5">
          {lines.map((line, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-secondary-light to-secondary/5 flex items-center justify-center mt-0.5 shadow-xs">
                <svg className="w-3.5 h-3.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="font-medium leading-relaxed">{line}</span>
            </li>
          ))}
        </ul>
      </div>
      <Button onClick={onContinue} size="lg" className="w-full">
        {copy.saveMyPlan}
      </Button>
    </div>
  );
}

function EmailScreen({
  email,
  error,
  copy,
  onChange,
  onSubmit,
}: {
  email: string;
  error: string;
  copy: ShellCopy;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const locale = useLocale();
  return (
    <div className="text-center py-10 animate-slide-up">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-light to-primary/10 shadow-elevated flex items-center justify-center mx-auto mb-6">
        <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-3">{copy.emailTitle}</h2>
      <p className="text-muted-foreground mb-8 leading-relaxed max-w-sm mx-auto">
        {copy.emailSubtitle}
      </p>
      <div className="max-w-sm mx-auto">
        <Input
          type="email"
          placeholder={copy.emailPlaceholder}
          value={email}
          error={error}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
        <Button onClick={onSubmit} size="lg" className="w-full mt-5">
          {copy.saveMyPlan}
        </Button>
        <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-muted-foreground">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <span>
            {copy.privacyNote}{" "}
            <Link href={localizeHref("/privacy", locale)} className="underline hover:text-foreground transition-colors">
              {copy.privacyLink}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({
  texts,
  currentStep,
}: {
  texts: string[];
  currentStep: number;
}) {
  return (
    <div className="text-center py-12 animate-slide-up">
      <div className="w-20 h-20 mx-auto mb-10 relative">
        <svg className="w-20 h-20" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--muted)" strokeWidth="5" />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="70 144"
            className="spinner-track"
          />
        </svg>
      </div>
      <div className="space-y-3.5 max-w-xs mx-auto">
        {texts.map((text, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 text-left transition-all duration-500 ${
              i <= currentStep
                ? "opacity-100"
                : "opacity-20"
            }`}
          >
            <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
              {i < currentStep ? (
                <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center animate-check-pop shadow-xs">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              ) : i === currentStep ? (
                <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </span>
              ) : (
                <span className="w-6 h-6 rounded-full bg-muted" />
              )}
            </span>
            <span className={`text-sm font-medium ${
              i < currentStep ? "text-foreground" : i === currentStep ? "text-foreground" : "text-muted-foreground"
            }`}>
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
