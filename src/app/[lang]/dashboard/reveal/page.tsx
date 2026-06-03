import { getCurrentUser, clerkEnabled } from "@/lib/auth/magic-link";
import { getActivePlan, parseWeeklyPlan, localizePlan } from "@/lib/dashboard/helpers";
import { deriveRoutine, localizeRoutine } from "@/lib/routines/routines";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PendingPlanGate } from "@/components/dashboard/plan-reclaimer";
import { Button } from "@/components/ui/button";
import { ProfileIllustration, SpotIcon } from "@/components/illustrations/activity-illustrations";
import { localizeHref } from "@/lib/i18n/href";
import { resolveLocale, type Locale } from "@/lib/i18n/config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  return {
    title: locale === "es" ? "Tu TinyPlan está listo" : "Your TinyPlan is Ready",
  };
}

const COPY = {
  es: {
    yourPlanReady: "Tu plan está listo",
    builtAround: (n: number) =>
      `Creado a partir de tus respuestas — ${n} días de juego que se adaptan a tu familia.`,
    builtFromAnswers: "Tu TinyPlan se creó a partir de tus respuestas",
    youToldUs: "Nos contaste:",
    soWeCreated: "Así que esta semana creamos:",
    thisWeekIncludes: "Esta semana incluye",
    activitiesWithScripts: (n: number) => `${n} actividades con qué decir`,
    personalisedRoutine: "Una rutina personalizada para tu momento más difícil",
    sosScripts: "Guiones SOS para berrinches y momentos difíciles",
    askTinyPlan: "Pregúntale a TinyPlan cuando te atasques",
    weeklyInsight: "Un informe semanal con ideas",
    yourRoutine: "Tu rutina esta semana",
    startDay1: "Empezar el Día 1",
    viewFullWeek: "Ver la semana completa",
    settingUp: "Preparando tu plan…",
    // fallback summary builders
    youToldUsPriority: (g: string) => `${g} es tu prioridad`,
    youToldUsBestTime: (m: string) => `${m} es tu mejor momento`,
    youToldUsPrefer: (s: string) => `prefieres ${s}`,
    youToldUsHardest: (p: string) => `${p} es tu momento más difícil`,
    soWeCreatedFocus: (g: string) => `actividades centradas en ${g}`,
    soWeCreatedPlay: (m: string) => `juego diseñado para ${m}`,
    soWeCreatedHelp: (p: string) => `ayuda para ${p}`,
    soWeCreatedScripts: "qué decir, listo para usar",
  },
  en: {
    yourPlanReady: "Your plan is ready",
    builtAround: (n: number) =>
      `Built around your answers — ${n} days of play that fits your family.`,
    builtFromAnswers: "Your TinyPlan was built from your answers",
    youToldUs: "You told us:",
    soWeCreated: "So this week we created:",
    thisWeekIncludes: "This week includes",
    activitiesWithScripts: (n: number) => `${n} activities with parent scripts`,
    personalisedRoutine: "A personalised routine for your hardest moment",
    sosScripts: "SOS scripts for meltdowns and tough moments",
    askTinyPlan: "Ask TinyPlan when you are stuck",
    weeklyInsight: "A weekly insight report",
    yourRoutine: "Your Routine This Week",
    startDay1: "Start Day 1",
    viewFullWeek: "View full week",
    settingUp: "Setting up your plan…",
    youToldUsPriority: (g: string) => `${g} is your priority`,
    youToldUsBestTime: (m: string) => `${m} is your best time`,
    youToldUsPrefer: (s: string) => `you prefer ${s}`,
    youToldUsHardest: (p: string) => `${p} is your hardest moment`,
    soWeCreatedFocus: (g: string) => `activities focused on ${g}`,
    soWeCreatedPlay: (m: string) => `play designed for ${m}`,
    soWeCreatedHelp: (p: string) => `help for ${p}`,
    soWeCreatedScripts: "ready-to-use parent scripts",
  },
} as const;

type RevealCopy = (typeof COPY)[Locale];

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function deriveFallbackYouToldUs(
  plan: {
    goalDisplayText?: string;
    bestMomentDisplay?: string;
    planStyleDisplay?: string;
    hardMomentDisplay?: string;
  },
  copy: RevealCopy,
): string[] {
  const items: string[] = [];
  if (plan.goalDisplayText) items.push(copy.youToldUsPriority(lowerFirst(plan.goalDisplayText)));
  if (plan.bestMomentDisplay) items.push(copy.youToldUsBestTime(plan.bestMomentDisplay));
  if (plan.planStyleDisplay) items.push(copy.youToldUsPrefer(plan.planStyleDisplay));
  if (plan.hardMomentDisplay) items.push(copy.youToldUsHardest(lowerFirst(plan.hardMomentDisplay)));
  return items.slice(0, 4);
}

function deriveFallbackSoWeCreated(
  plan: {
    goalDisplayText?: string;
    bestMomentDisplay?: string;
    planStyleDisplay?: string;
    hardMomentDisplay?: string;
  },
  copy: RevealCopy,
): string[] {
  const items: string[] = [];
  if (plan.goalDisplayText) items.push(copy.soWeCreatedFocus(lowerFirst(plan.goalDisplayText)));
  if (plan.bestMomentDisplay) items.push(copy.soWeCreatedPlay(plan.bestMomentDisplay));
  if (plan.hardMomentDisplay) items.push(copy.soWeCreatedHelp(lowerFirst(plan.hardMomentDisplay)));
  items.push(copy.soWeCreatedScripts);
  return items.slice(0, 4);
}

export default async function PlanRevealPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const copy = COPY[locale];
  const user = await getCurrentUser();
  if (!user) redirect(clerkEnabled ? "/sign-in" : localizeHref("/auth/login", locale));

  const plan = getActivePlan(user.id);
  if (!plan) {
    // A just-checked-out user can land here before the dashboard-mounted
    // <PlanReclaimer> has adopted their anonymous plan. Don't hard-bounce to the
    // quiz: if a pending plan id exists in the browser, show a brief spinner and
    // wait for the reclaimer's refresh to bring the adopted plan into view.
    // Only when there is genuinely nothing pending does the gate send them to
    // the quiz. (The redirect happens client-side inside the gate.)
    return (
      <PendingPlanGate
        settingUpLabel={copy.settingUp}
        quizHref={localizeHref("/quiz", locale)}
      />
    );
  }

  const weeklyPlan = localizePlan(parseWeeklyPlan(plan.plan_json), locale);
  const activityCount = weeklyPlan.days.length;
  const routine = weeklyPlan.routine ?? localizeRoutine(deriveRoutine({
    main_pain: weeklyPlan.hardMoment ?? "",
    primary_goal: weeklyPlan.goal ?? "",
    routine_moment: weeklyPlan.bestMoment ?? "",
    needs_screen_help: weeklyPlan.goal === "fewer_screens" || weeklyPlan.hardMoment === "screen_time",
  }), locale);

  const youToldUs = weeklyPlan.quizSummary?.youToldUs ?? deriveFallbackYouToldUs(weeklyPlan, copy);
  const soWeCreated = weeklyPlan.quizSummary?.soWeCreated ?? deriveFallbackSoWeCreated(weeklyPlan, copy);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-slide-up">
      <div className="max-w-lg w-full">
        <div className="hero-card shadow-hero rounded-[1.25rem] overflow-hidden mb-6">
          <div className="surface-hero px-5 pt-8 pb-5 flex flex-col items-center text-center">
            <div className="relative mb-5">
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/10 blur-xl" />
              <ProfileIllustration
                profile={weeklyPlan.profile}
                className="w-20 h-20 relative"
              />
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-[0.15em] mb-2">{copy.yourPlanReady}</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              <span className="gradient-text-primary">{weeklyPlan.profileDisplayName}</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              {copy.builtAround(activityCount)}
            </p>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {copy.builtFromAnswers}
              </h2>

              {youToldUs.length > 0 && (
                <div className="bg-gradient-to-br from-primary-light/60 to-primary-light/30 rounded-xl p-4 mb-3">
                  <p className="text-sm font-semibold mb-2">{copy.youToldUs}</p>
                  <ul className="space-y-1.5">
                    {youToldUs.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {soWeCreated.length > 0 && (
                <div className="bg-gradient-to-br from-secondary-light/70 to-secondary-light/30 rounded-xl p-4">
                  <p className="text-sm font-semibold mb-2">{copy.soWeCreated}</p>
                  <ul className="space-y-1.5">
                    {soWeCreated.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-secondary/50 mt-1.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {copy.thisWeekIncludes}
              </h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <SpotIcon type="activity" className="w-6 h-6 shrink-0" />
                  <span>{copy.activitiesWithScripts(activityCount)}</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <SpotIcon type="routine" className="w-6 h-6 shrink-0" />
                  <span>{copy.personalisedRoutine}</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <SpotIcon type="sos" className="w-6 h-6 shrink-0" />
                  <span>{copy.sosScripts}</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <SpotIcon type="chat" className="w-6 h-6 shrink-0" />
                  <span>{copy.askTinyPlan}</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <SpotIcon type="insight" className="w-6 h-6 shrink-0" />
                  <span>{copy.weeklyInsight}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {routine && (
          <div className="premium-card border-primary/15 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{copy.yourRoutine}</p>
                <p className="text-sm font-semibold">{routine.title}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{routine.whenToUse}</p>
            <ol className="space-y-1.5">
              {routine.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5 shadow-xs">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="space-y-3">
          <div className="rounded-[1.25rem] bg-gradient-to-br from-primary/10 via-primary-light/40 to-transparent p-[2px]">
            <Link href={localizeHref("/dashboard/today", locale)} className="block">
              <Button size="lg" className="w-full text-lg rounded-[1.15rem]">
                {copy.startDay1}
              </Button>
            </Link>
          </div>
          <Link
            href={localizeHref("/dashboard/week", locale)}
            className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2.5 font-medium"
          >
            {copy.viewFullWeek}
          </Link>
        </div>
      </div>
    </div>
  );
}
