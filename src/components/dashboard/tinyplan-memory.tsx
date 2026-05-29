"use client";

import { useLocale } from "@/components/i18n/locale-provider";

interface TinyPlanMemoryProps {
  goalDisplayText: string;
  bestMomentDisplay: string;
  planStyleDisplay: string;
  profileDisplayName: string;
  hardMomentDisplay?: string;
  feedbackCounts: Record<string, number>;
}

const COPY = {
  es: {
    heading: "Memoria de TinyPlan",
    soFar: "Hasta ahora sabemos:",
    mainGoal: (goal: string) => `Tu objetivo principal es ${goal}`,
    easiestMoment: (m: string) => `${m} es tu momento más fácil`,
    fitsFamily: (s: string) => `${s} encaja con tu familia`,
    playStyle: (p: string) => `Tu estilo de juego es ${p}`,
    hardestMoment: (m: string) => `${m} es el momento que se siente más difícil`,
    feltRight: "Las actividades que “salieron bien” mantienen la misma energía",
    tooHard: "Algunas actividades fueron muy difíciles — las vamos a ajustar",
    morePatterns: (n: number) =>
      `Completa ${n} ${n === 1 ? "actividad" : "actividades"} más y empezaremos a notar patrones más claros.`,
  },
  en: {
    heading: "TinyPlan Memory",
    soFar: "So far we know:",
    mainGoal: (goal: string) => `Your main goal is ${goal}`,
    easiestMoment: (m: string) => `${m} is your easiest moment`,
    fitsFamily: (s: string) => `${s} fits your family`,
    playStyle: (p: string) => `Your play style is ${p}`,
    hardestMoment: (m: string) => `${m} is the moment that feels hardest`,
    feltRight: "Activities that 'felt right' keep the same energy",
    tooHard: "Some activities felt too hard -- we'll adjust",
    morePatterns: (n: number) =>
      `Complete ${n} more ${n === 1 ? "activity" : "activities"} and we'll start spotting stronger patterns.`,
  },
} as const;

export function TinyPlanMemory({
  goalDisplayText,
  bestMomentDisplay,
  planStyleDisplay,
  profileDisplayName,
  hardMomentDisplay,
  feedbackCounts,
}: TinyPlanMemoryProps) {
  const locale = useLocale();
  const copy = COPY[locale];
  const done = feedbackCounts["done"] ?? 0;
  const tooHard = feedbackCounts["too_hard"] ?? 0;
  const total = Object.values(feedbackCounts).reduce((s, n) => s + n, 0);
  const remaining = Math.max(3 - total, 0);

  const bullets: string[] = [];

  if (goalDisplayText) {
    bullets.push(
      copy.mainGoal(goalDisplayText.charAt(0).toLowerCase() + goalDisplayText.slice(1))
    );
  }

  if (bestMomentDisplay) {
    bullets.push(copy.easiestMoment(bestMomentDisplay));
  }

  if (planStyleDisplay) {
    bullets.push(copy.fitsFamily(planStyleDisplay));
  }

  if (profileDisplayName) {
    bullets.push(copy.playStyle(profileDisplayName));
  }

  if (hardMomentDisplay) {
    bullets.push(copy.hardestMoment(hardMomentDisplay));
  }

  if (done > 0) {
    bullets.push(copy.feltRight);
  }

  if (tooHard > 0) {
    bullets.push(copy.tooHard);
  }

  return (
    <div className="bg-card border border-border-whisper rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-light to-secondary/5 shadow-xs flex items-center justify-center shrink-0">
          <svg
            className="w-4.5 h-4.5 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold">{copy.heading}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4 ml-[42px]">
        {copy.soFar}
      </p>

      <ul className="space-y-2.5 mb-4">
        {bullets.map((text, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <span className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
            <span className="text-muted-foreground leading-relaxed">{text}</span>
          </li>
        ))}
      </ul>

      {remaining > 0 && (
        <p className="text-xs text-muted-foreground/80 bg-muted/50 rounded-xl px-4 py-3">
          {copy.morePatterns(remaining)}
        </p>
      )}
    </div>
  );
}
