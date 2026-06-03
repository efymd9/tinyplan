import { getCurrentUser } from "@/lib/auth/magic-link";
import {
  getActivePlan,
  getDayLogs,
  getTodayDayNumber,
  parseWeeklyPlan,
  getQuizTagProfile,
  localizePlan,
} from "@/lib/dashboard/helpers";
import { generateAdaptiveInsight, getEarlySignalLevel } from "@/lib/personalization/personalize";
import { buildDailyToolkit } from "@/lib/engine/daily-toolkit";
import type { ToolkitContext } from "@/lib/engine/daily-toolkit";
import { PARENT_SKILL_LABELS, getParentSkillLabel } from "@/data/parent-tools";
import { getGrowthPath } from "@/data/parent-growth-path";
import { SpotIcon } from "@/components/illustrations/activity-illustrations";
import Image from "next/image";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TinyPlanMemory } from "@/components/dashboard/tinyplan-memory";
import { InsightCard } from "@/components/ui/insight-card";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  return { title: locale === "es" ? "Progreso — TinyPlan" : "Progress — TinyPlan" };
}

const COPY = {
  es: {
    noProgressTitle: "Aún no hay progreso",
    noProgressDesc: "Empieza tu plan para ver cómo van las cosas aquí.",
    startQuiz: "Empezar el test",
    heroTitle: "Progreso",
    heroEmpty: "El sistema está listo — tu primera actividad lo desbloquea todo.",
    heroMid: "Cada check-in le enseña a TinyPlan más sobre lo que funciona para tu familia.",
    heroDone: "Siete momentos registrados. Ahora el sistema conoce el ritmo de tu familia.",
    momentsLogged: "Momentos registrados",
    rhythmStreak: "Racha de ritmo",
    skillsPracticed: "Habilidades practicadas",
    thisWeek: "Esta semana",
    thisWeekShort: (n: number) => `${n}/7 esta semana`,
    parentSkillsTitle: "Habilidades practicadas esta semana",
    ofLabel: (a: number, b: number) => `${a} de ${b}`,
    parentSkillsIntroHas:
      "Cada actividad va con una habilidad de crianza. Estas son las que has estado desarrollando.",
    parentSkillsIntroNone:
      "Cada actividad de tu plan viene con una habilidad de crianza. Se desbloquean a medida que registras tus check-ins.",
    timesPracticed: (n: number) => `${n}× practicada`,
    upcoming: "próxima",
    inYourPlan: "en tu plan",
    skillsEmptyMsg: "Completa tu primera actividad para empezar a registrar las habilidades que practicas.",
    skillsEmptySub: "Las habilidades de crianza crecen en silencio, un momento a la vez.",
    strongestTitle: "Tu habilidad más fuerte esta semana",
    currentSkillTitle: "Tu habilidad actual",
    tinyWinRepeat: "Pequeña victoria para repetir",
    startedBuilding: (s: string) =>
      `Empezaste a desarrollar ${s}. Sigue registrando para ver crecer el patrón.`,
    revealSkillMsg: "Registra tu primera actividad para descubrir qué habilidad estás desarrollando.",
    revealSkillSub: "TinyPlan registra tus habilidades de crianza en silencio — tú solo juega.",
    nextRecommended: "Siguiente habilidad recomendada",
    whatWorkedTitle: "Lo que mejor funcionó para tu familia",
    strongPattern: "Patrón fuerte",
    pattern: "Patrón",
    earlySignal: "Señal temprana",
    weNoticed: "Esta semana notamos",
    whatWorkedBest: "Lo que mejor funcionó",
    whatFeltHard: "Lo que se sintió difícil",
    familyPatternsTitle: "Patrones de tu familia",
    familyPatternsHas: "Patrones que TinyPlan detectó en tus check-ins esta semana.",
    familyPatternsNone: "Los patrones aparecen después de unos pocos check-ins — el sistema está escuchando.",
    whatsClicking: "Lo que está funcionando",
    whatsClickingBody: (n: number) =>
      n === 1
        ? `1 actividad se sintió bien — ese es el ritmo sobre el que construimos.`
        : `${n} actividades se sintieron bien — ese es el ritmo sobre el que construimos.`,
    whereToEase: "Dónde aliviar",
    whereToEaseBody: (n: number) =>
      n === 1
        ? `1 actividad se sintió como demasiado. Opciones más cortas y de menos preparación están en camino.`
        : `${n} actividades se sintieron como demasiado. Opciones más cortas y de menos preparación están en camino.`,
    skippedMoments: "Momentos saltados",
    skippedBody: (n: number) =>
      `${n} saltados — eso también es una señal útil. Los cambiaremos por algo que se ajuste mejor a tu energía.`,
    readyForMore: "Listo para más",
    readyForMoreBody: (n: number) =>
      n === 1
        ? `1 actividad se sintió demasiado fácil — tu peque está listo para un poco más de desafío.`
        : `${n} actividades se sintieron demasiado fáciles — tu peque está listo para un poco más de desafío.`,
    patternsEmptyZero: "Aún no hay patrones — registra la actividad de hoy para empezar.",
    patternsEmptyMore: (n: number, plural: boolean) =>
      `${n} check-in${plural ? "s" : ""} más para desbloquear los patrones de tu familia.`,
    patternsEmptySub: "Cuando detectamos un patrón real, aparece aquí — no antes.",
    nextAdjustTitle: "Próximo ajuste del plan",
    nextAdjustDesc: "Qué cambia en tu próximo plan según esta semana.",
    basedOn: (n: number, plural: boolean) =>
      `Basado en ${n} check-in${plural ? "s" : ""} — sigue registrando para afinarlo más.`,
    tinyWinsTitle: "Pequeñas victorias",
    tinyWinsDesc: "Momentos reales de esta semana — registrados y contados.",
    tinyWinsEmpty: "Aún no hay victorias registradas — y está bien.",
    tinyWinsEmptySub: "Tu primera actividad completada se convierte en una pequeña victoria que vale la pena recordar.",
    weeklyCheckin: "Check-in semanal",
    weeklyCheckinDesc: "5 preguntas que dan forma al plan de la próxima semana. No hay respuestas correctas, solo honestas.",
    nextWeekDesc: "Esto es lo que puedes esperar cuando empiece el próximo plan.",
    learns3: "El sistema aprende a través de 3 cosas",
    yourQuizAnswers: "Tus respuestas del test",
    yourDailyFeedback: "Tus comentarios diarios",
    yourSosQuestions: "Tus preguntas SOS",
    heroAlt: "Madre o padre y peque construyendo algo juntos, paso a paso",
    dayWord: "Día",
    // tiny win moment
    twDone: (t: string) => `Te presentaste para "${t}" — y funcionó.`,
    twEasy: (t: string) => `"${t}" salió fácil. Listo para más.`,
    twOther: (t: string) => `"${t}" — registrado y aprendido.`,
    // next adjustment
    adjNone: "Registra cómo va la actividad de hoy y tu próximo plan empezará a ajustarse automáticamente.",
    adjTooHard: "La próxima semana: actividades más cortas y con menos preparación — te escuchamos.",
    adjTooEasy: "Tu peque está listo para más. El próximo plan suma una capa de desafío.",
    adjSkipped: "Opciones más simples para los momentos que se sintieron como demasiado.",
    adjDone: (style: string) => `Lo que funciona (${style}) se queda en el plan.`,
    adjLearning: "TinyPlan está aprendiendo qué funciona. Sigue registrando para desbloquear ajustes más fuertes.",
    // check-in prompts
    ciBonding: "¿Hubo un momento esta semana en que tu peque pareció más tranquilo o conectado de lo habitual?",
    ciPhysical: "¿Notaste algún cambio en la energía o el ánimo de tu peque después del juego activo?",
    ciAny: "¿Hubo un momento esta semana en que tu peque te sorprendió con su forma de jugar?",
    ciNone: "¿Qué momento se sintió más fácil con tu peque esta semana — aunque fuera pequeño?",
    ciPrompt2: "¿Qué habilidad de crianza se sintió más natural de probar esta semana?",
    ciPrompt3: "¿Qué se sintió más manejable para ti como madre o padre?",
    ciPrompt4: "¿Hubo un momento que no salió según el plan — y qué hiciste en su lugar?",
    ciPrompt5: "Si pudieras cambiar una cosa pequeña de la rutina de la próxima semana, ¿qué sería?",
    // next week
    nwBuilds: "La semana 2 se basa en la semana 1",
    nwWorking: "La semana 2 se basa en lo que funciona",
    nwGentler: "La semana 2 toma un enfoque más suave",
    nwAdjusts: "La semana 2 se ajusta a tu familia",
    nwWorked: "Las actividades que funcionaron bien se quedan en la mezcla",
    nwShorter: "Opciones más cortas y de menos preparación para los momentos que se sintieron difíciles",
    nwFocused: (g: string) => `Sigue centrado en: ${g}`,
    nwLog: "Registra cómo va el día de hoy para dar forma a la actividad de mañana",
  },
  en: {
    noProgressTitle: "No progress yet",
    noProgressDesc: "Start your plan to see how things are going here.",
    startQuiz: "Start the Quiz",
    heroTitle: "Progress",
    heroEmpty: "The system is ready — your first activity unlocks everything.",
    heroMid: "Every check-in teaches TinyPlan more about what works for your family.",
    heroDone: "Seven moments logged. The system now knows your family's rhythm.",
    momentsLogged: "Moments logged",
    rhythmStreak: "Rhythm streak",
    skillsPracticed: "Skills practiced",
    thisWeek: "This Week",
    thisWeekShort: (n: number) => `${n}/7 this week`,
    parentSkillsTitle: "Parent Skills Practiced This Week",
    ofLabel: (a: number, b: number) => `${a} of ${b}`,
    parentSkillsIntroHas:
      "Each activity pairs with a parent skill. These are the ones you've been building.",
    parentSkillsIntroNone:
      "Each activity in your plan comes with a paired parent skill. They unlock as you log check-ins.",
    timesPracticed: (n: number) => `${n}× practiced`,
    upcoming: "upcoming",
    inYourPlan: "in your plan",
    skillsEmptyMsg: "Complete your first activity to start tracking the skills you practice.",
    skillsEmptySub: "Parent skills grow quietly in the background — one moment at a time.",
    strongestTitle: "Your Strongest Skill This Week",
    currentSkillTitle: "Your Current Skill",
    tinyWinRepeat: "Tiny win to repeat",
    startedBuilding: (s: string) =>
      `You've started building ${s}. Keep logging to see the pattern grow.`,
    revealSkillMsg: "Log your first activity to reveal which skill you're building.",
    revealSkillSub: "TinyPlan tracks your parent skills quietly — you just play.",
    nextRecommended: "Next recommended skill",
    whatWorkedTitle: "What Worked Best for Your Family",
    strongPattern: "Strong pattern",
    pattern: "Pattern",
    earlySignal: "Early signal",
    weNoticed: "This week we noticed",
    whatWorkedBest: "What worked best",
    whatFeltHard: "What felt hard",
    familyPatternsTitle: "Family Patterns",
    familyPatternsHas: "Patterns TinyPlan has spotted from your check-ins this week.",
    familyPatternsNone: "Patterns appear after a few check-ins — the system is listening.",
    whatsClicking: "What's clicking",
    whatsClickingBody: (n: number) =>
      `${n} ${n === 1 ? "activity" : "activities"} felt right — that's the rhythm we build on.`,
    whereToEase: "Where to ease up",
    whereToEaseBody: (n: number) =>
      `${n} ${n === 1 ? "activity" : "activities"} felt like too much. Shorter, lower-prep options are on the way.`,
    skippedMoments: "Skipped moments",
    skippedBody: (n: number) =>
      `${n} skipped — that's useful signal too. We'll swap those for something that fits your energy better.`,
    readyForMore: "Ready for more",
    readyForMoreBody: (n: number) =>
      `${n} ${n === 1 ? "activity" : "activities"} felt too easy — your child is ready for a bit more challenge.`,
    patternsEmptyZero: "No patterns yet — log today's activity to get started.",
    patternsEmptyMore: (n: number, plural: boolean) =>
      `${n} more check-in${plural ? "s" : ""} to unlock family patterns.`,
    patternsEmptySub: "Once we spot a real pattern, it shows up here — not before.",
    nextAdjustTitle: "Next Plan Adjustment",
    nextAdjustDesc: "What changes in your next plan based on this week.",
    basedOn: (n: number, plural: boolean) =>
      `Based on ${n} check-in${plural ? "s" : ""} — keep logging to refine further.`,
    tinyWinsTitle: "Tiny Wins",
    tinyWinsDesc: "Real moments this week — logged and counted.",
    tinyWinsEmpty: "No wins logged yet — and that's fine.",
    tinyWinsEmptySub: "Your first completed activity becomes a tiny win worth remembering.",
    weeklyCheckin: "Weekly Check-In",
    weeklyCheckinDesc: "5 questions that shape next week's plan. No right answers — just honest ones.",
    nextWeekDesc: "Here's what to expect when the next plan starts.",
    learns3: "The system learns through 3 things",
    yourQuizAnswers: "Your quiz answers",
    yourDailyFeedback: "Your daily feedback",
    yourSosQuestions: "Your SOS questions",
    heroAlt: "Parent and child building something together, step by step",
    dayWord: "Day",
    twDone: (t: string) => `You showed up for "${t}" — and it landed.`,
    twEasy: (t: string) => `"${t}" came easily. Ready for more.`,
    twOther: (t: string) => `"${t}" — logged and learned from.`,
    adjNone: "Log how today's activity goes and your next plan will start adjusting automatically.",
    adjTooHard: "Shorter, lower-prep activities next week — we heard you.",
    adjTooEasy: "Your child is ready for more. The next plan adds a layer of challenge.",
    adjSkipped: "Simpler options for the moments that felt like too much.",
    adjDone: (style: string) => `What's working (${style}) stays in the plan.`,
    adjLearning: "TinyPlan is learning what works. Keep logging to unlock stronger adjustments.",
    ciBonding: "Was there a moment this week when your child seemed more settled or connected than usual?",
    ciPhysical: "Did you notice any change in your child's energy or mood after active play?",
    ciAny: "Was there a moment this week when your child surprised you with how they played?",
    ciNone: "What moment felt easiest with your child this week — even a small one?",
    ciPrompt2: "Which parent skill felt most natural to try this week?",
    ciPrompt3: "What felt most manageable for you as a parent?",
    ciPrompt4: "Was there a moment that didn't go to plan — and what did you do instead?",
    ciPrompt5: "If you could change one small thing about next week's routine, what would it be?",
    nwBuilds: "Week 2 builds on Week 1",
    nwWorking: "Week 2 builds on what's working",
    nwGentler: "Week 2 takes a gentler approach",
    nwAdjusts: "Week 2 adjusts to your family",
    nwWorked: "Activities that worked well stay in the mix",
    nwShorter: "Shorter, lower-prep options for the moments that felt hard",
    nwFocused: (g: string) => `Still focused on: ${g}`,
    nwLog: "Log how today goes to shape tomorrow's activity",
  },
} as const;

type ProgressCopy = (typeof COPY)[Locale];

function tinyWinMoment(activityTitle: string, status: string, copy: ProgressCopy): string {
  if (status === "done") return copy.twDone(activityTitle);
  if (status === "too_easy") return copy.twEasy(activityTitle);
  return copy.twOther(activityTitle);
}

export default async function ProgressPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const copy = COPY[locale];
  const user = await getCurrentUser();
  if (!user) return null;

  const plan = getActivePlan(user.id);

  if (!plan) {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-light to-primary-light/50 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">{copy.noProgressTitle}</h1>
        <p className="text-muted-foreground mb-6">{copy.noProgressDesc}</p>
        <Link href={localizeHref("/quiz", locale)}><Button size="lg">{copy.startQuiz}</Button></Link>
      </div>
    );
  }

  const weeklyPlan = localizePlan(parseWeeklyPlan(plan.plan_json), locale);
  const dayLogs = getDayLogs(plan.id);
  const todayDayNumber = getTodayDayNumber(plan.created_at!);

  const completedCount = dayLogs.filter((l) => l.status === "done").length;
  const totalDays = weeklyPlan.days.length;

  // Gentle rhythm streak
  let rhythmDays = 0;
  for (let d = todayDayNumber; d >= 1; d--) {
    const log = dayLogs.find((l) => l.day_number === d);
    if (log?.status === "done") rhythmDays++;
    else break;
  }

  const logMap = new Map(dayLogs.map((l) => [l.day_number, l.status]));
  const dayLabels = locale === "es"
    ? ["L", "M", "M", "J", "V", "S", "D"]
    : ["M", "T", "W", "T", "F", "S", "S"];
  const growthPath = getGrowthPath(locale);

  // Feedback counts
  const feedbackCounts: Record<string, number> = {};
  for (const log of dayLogs) {
    if (log.status && log.status !== "pending") {
      feedbackCounts[log.status] = (feedbackCounts[log.status] ?? 0) + 1;
    }
  }
  const hasFeedback = Object.keys(feedbackCounts).length > 0;
  const totalFeedback = Object.values(feedbackCounts).reduce((s, n) => s + n, 0);
  const signalLevel = getEarlySignalLevel(totalFeedback);

  // Confidence label mapping
  const confidenceLevel: "early" | "pattern" | "strong" =
    signalLevel === "confident" ? "strong" :
    signalLevel === "forming" ? "pattern" : "early";

  const insights = generateAdaptiveInsight(
    feedbackCounts,
    weeklyPlan.goalDisplayText,
    weeklyPlan.bestMomentDisplay,
    locale,
  );

  // ── Parent Skills ──────────────────────────────────────────────────────────
  const tagProfile = getQuizTagProfile(plan.quiz_session_id);
  const hasStruggle = (feedbackCounts["too_hard"] ?? 0) > 0 || (feedbackCounts["refused"] ?? 0) > 0;

  const parentSkillsMap = new Map<string, { label: string; practiced: number; total: number; growthSkillId?: string }>();
  if (tagProfile) {
    const ctx: ToolkitContext = {
      primaryGoal: tagProfile.primary_goal,
      mainPain: tagProfile.main_pain,
      mainPainAll: tagProfile.main_pain_all,
      routineMoment: tagProfile.routine_moment,
      ageRange: tagProfile.age_range,
      isLowEnergy: tagProfile.is_low_energy,
      needsScripts: tagProfile.needs_scripts,
      parentConstraints: tagProfile.parent_constraint,
      struggle: hasStruggle,
    };
    for (const day of weeklyPlan.days) {
      const toolkit = buildDailyToolkit(ctx, day.dayNumber, locale);
      const skill = toolkit.parentSkill;
      const key = skill.skillType ?? skill.id;
      const label = skill.skillType
        ? getParentSkillLabel(skill.skillType, locale)
        : skill.title;
      const wasDone = logMap.get(day.dayNumber) === "done";
      if (!parentSkillsMap.has(key)) {
        parentSkillsMap.set(key, { label, practiced: 0, total: 0 });
      }
      const entry = parentSkillsMap.get(key)!;
      entry.total++;
      if (wasDone) entry.practiced++;
    }
  }
  const parentSkills = Array.from(parentSkillsMap.entries()).map(([key, val]) => ({ key, ...val }));

  const fallbackParentSkills = Object.keys(PARENT_SKILL_LABELS).slice(0, 4).map((key) => ({
    key, label: getParentSkillLabel(key, locale), practiced: 0, total: 1,
  }));
  const displayParentSkills = parentSkills.length > 0 ? parentSkills : fallbackParentSkills;
  const parentSkillsPracticed = displayParentSkills.filter((s) => s.practiced > 0).length;

  // Strongest skill (most practiced)
  const strongestSkill = displayParentSkills.reduce(
    (best, s) => s.practiced > best.practiced ? s : best,
    displayParentSkills[0]
  );
  const strongestGrowthSkill = growthPath.find((gs) =>
    gs.id.replace(/-/g, "_") === strongestSkill.key ||
    gs.title.toLowerCase() === strongestSkill.label.toLowerCase()
  );

  // Next recommended skill from growth path
  const nextDaySkill = growthPath.find((gs) => gs.dayNumber === Math.min(todayDayNumber + 1, 7));
  const recommendedSkill = hasStruggle
    ? growthPath.find((gs) => gs.id === "start-smaller") ?? nextDaySkill
    : nextDaySkill;

  // ── Plan adjustment copy ───────────────────────────────────────────────────
  const tooHardCount = feedbackCounts["too_hard"] ?? 0;
  const tooEasyCount = feedbackCounts["too_easy"] ?? 0;
  const skippedCount = feedbackCounts["skipped"] ?? 0;
  const doneCount = feedbackCounts["done"] ?? 0;

  let nextAdjustmentText: string;
  if (totalFeedback === 0) {
    nextAdjustmentText = copy.adjNone;
  } else if (tooHardCount > 1) {
    nextAdjustmentText = copy.adjTooHard;
  } else if (tooEasyCount > 0) {
    nextAdjustmentText = copy.adjTooEasy;
  } else if (skippedCount > 1) {
    nextAdjustmentText = copy.adjSkipped;
  } else if (doneCount >= 4) {
    nextAdjustmentText = copy.adjDone(weeklyPlan.planStyleDisplay);
  } else {
    nextAdjustmentText = copy.adjLearning;
  }

  // ── Tiny Wins (completed activities as real moments) ──────────────────────
  const tinyWins = dayLogs
    .filter((l) => l.status === "done" || l.status === "too_easy")
    .sort((a, b) => (b.day_number ?? 0) - (a.day_number ?? 0))
    .map((log) => {
      const day = weeklyPlan.days.find((d) => d.dayNumber === log.day_number);
      const titleFallback = day?.activity.title ?? `${copy.dayWord} ${log.day_number}`;
      return {
        id: log.id,
        dayNumber: log.day_number,
        title: titleFallback,
        status: log.status!,
        moment: tinyWinMoment(titleFallback, log.status!, copy),
      };
    });

  // ── Family patterns (only when ≥3 logs) ──────────────────────────────────
  const hasEnoughForPatterns = totalFeedback >= 3;

  // ── Weekly check-in prompts ────────────────────────────────────────────────
  const completedActivities = weeklyPlan.days
    .filter((d) => logMap.get(d.dayNumber) === "done")
    .map((d) => d.activity);
  const completedCats = [...new Set(completedActivities.map((a) => a.category).filter(Boolean))] as string[];

  let firstCheckInQ: string;
  if (completedCats.includes("bonding") || completedCats.includes("emotional")) {
    firstCheckInQ = copy.ciBonding;
  } else if (completedCats.includes("physical") || completedCats.includes("outdoor")) {
    firstCheckInQ = copy.ciPhysical;
  } else if (completedActivities.length > 0) {
    firstCheckInQ = copy.ciAny;
  } else {
    firstCheckInQ = copy.ciNone;
  }

  const checkInPrompts: string[] = [
    firstCheckInQ,
    copy.ciPrompt2,
    copy.ciPrompt3,
    copy.ciPrompt4,
    copy.ciPrompt5,
  ];

  // ── Next Week ─────────────────────────────────────────────────────────────
  const nextPositive = doneCount + (feedbackCounts["loved_it"] ?? 0);
  const nextNegative = tooHardCount + skippedCount;
  let nextWeekHeadline: string = copy.nwBuilds;
  if (totalFeedback > 0) {
    if (nextPositive > nextNegative) nextWeekHeadline = copy.nwWorking;
    else if (nextNegative > nextPositive) nextWeekHeadline = copy.nwGentler;
    else nextWeekHeadline = copy.nwAdjusts;
  }
  const nextWeekDetails: string[] = [];
  if (nextPositive > 0) nextWeekDetails.push(copy.nwWorked);
  if (nextNegative > 0) nextWeekDetails.push(copy.nwShorter);
  nextWeekDetails.push(copy.nwFocused(weeklyPlan.goalDisplayText));
  if (nextWeekDetails.length < 2) nextWeekDetails.push(copy.nwLog);

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="rounded-2xl overflow-hidden mb-4 bg-gradient-to-b from-secondary-light/30 to-transparent">
          <Image
            src="/images/illustrations/tinyplan-progress-steps.png"
            alt={copy.heroAlt}
            width={1448}
            height={1086}
            className="w-full max-w-xs mx-auto h-auto"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          {copy.heroTitle}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {completedCount === 0
            ? copy.heroEmpty
            : completedCount < totalDays
            ? copy.heroMid
            : copy.heroDone}
        </p>
      </div>

      {/* ── Stats grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="premium-card rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-light to-primary-light/50 flex items-center justify-center mx-auto mb-2 shadow-xs">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-2xl font-extrabold text-primary">{completedCount}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{copy.momentsLogged}</div>
        </div>
        <div className="premium-card rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-light to-secondary-light/50 flex items-center justify-center mx-auto mb-2 shadow-xs">
            <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-2xl font-extrabold text-secondary">{rhythmDays}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{copy.rhythmStreak}</div>
        </div>
        <div className="premium-card rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-light to-accent-light/50 flex items-center justify-center mx-auto mb-2 shadow-xs">
            <svg className="w-5 h-5 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="text-2xl font-extrabold text-accent-dark">{parentSkillsPracticed}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{copy.skillsPracticed}</div>
        </div>
      </div>

      {/* ── Weekly tracker ──────────────────────────────────────────────────── */}
      <div className="hero-card p-6 mb-6">
        <h2 className="text-sm font-semibold mb-4">{copy.thisWeek}</h2>
        <ProgressBar current={completedCount} total={totalDays} stageLabel={copy.thisWeekShort(completedCount)} />
        <div className="flex justify-between mt-6">
          {weeklyPlan.days.map((day) => {
            const status = logMap.get(day.dayNumber);
            const isToday = day.dayNumber === todayDayNumber;
            const isFuture = day.dayNumber > todayDayNumber;
            let ringClass = "bg-muted text-muted-foreground";
            if (status === "done") ringClass = "bg-secondary text-white shadow-xs";
            else if (status === "too_hard" || status === "too_easy" || status === "skipped")
              ringClass = "bg-border text-muted-foreground";
            else if (isToday) ringClass = "bg-primary text-white shadow-xs";
            else if (isFuture) ringClass = "bg-muted/50 text-muted-foreground/50";
            return (
              <div key={day.dayNumber} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {dayLabels[(day.dayNumber - 1) % 7]}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${ringClass}`}>
                  {status === "done" ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    day.dayNumber
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Parent Skills Practiced This Week ──────────────────────────────── */}
      <div className="premium-card rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold">{copy.parentSkillsTitle}</h2>
          {parentSkillsPracticed > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary-light text-secondary">
              {copy.ofLabel(parentSkillsPracticed, displayParentSkills.length)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {parentSkills.length > 0
            ? copy.parentSkillsIntroHas
            : copy.parentSkillsIntroNone}
        </p>
        <div className="space-y-3 mb-4">
          {displayParentSkills.map(({ key, label, practiced }) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${practiced > 0 ? "bg-secondary" : "bg-muted-foreground/30"}`} />
                <span className={`truncate ${practiced > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
              </div>
              <span className="text-xs font-medium ml-3 shrink-0 text-muted-foreground">
                {practiced > 0
                  ? copy.timesPracticed(practiced)
                  : parentSkills.length > 0 ? copy.upcoming : copy.inYourPlan}
              </span>
            </div>
          ))}
        </div>
        {completedCount === 0 && (
          <EmptyStateCard
            message={copy.skillsEmptyMsg}
            subMessage={copy.skillsEmptySub}
          />
        )}
      </div>

      {/* ── Strongest / Current Skill ──────────────────────────────────────── */}
      <div className="hero-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <SpotIcon type="insight" className="w-7 h-7" />
          <h2 className="text-lg font-bold">
            {parentSkillsPracticed > 0 ? copy.strongestTitle : copy.currentSkillTitle}
          </h2>
        </div>

        {parentSkillsPracticed > 0 && strongestGrowthSkill ? (
          <div className="space-y-3">
            <InsightCard accent="secondary" label={strongestSkill.label} confidence={confidenceLevel}>
              {strongestGrowthSkill.whatYouPractice}
            </InsightCard>
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{copy.tinyWinRepeat}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{strongestGrowthSkill.tinyWin}</p>
            </div>
          </div>
        ) : parentSkillsPracticed > 0 ? (
          <InsightCard accent="secondary" label={strongestSkill.label} confidence="early">
            {copy.startedBuilding(strongestSkill.label.toLowerCase())}
          </InsightCard>
        ) : (
          <EmptyStateCard
            message={copy.revealSkillMsg}
            subMessage={copy.revealSkillSub}
          />
        )}

        {/* Next recommended skill */}
        {recommendedSkill && (
          <div className="mt-4 border-t border-border-whisper pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {copy.nextRecommended}
            </p>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-light to-primary-light/50 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">{recommendedSkill.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{recommendedSkill.whenToUse}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── What Worked Best for Your Family ──────────────────────────────── */}
      <div className="premium-card rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">{copy.whatWorkedTitle}</h2>
          {hasFeedback && (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
              confidenceLevel === "strong" ? "bg-secondary-light text-secondary" :
              confidenceLevel === "pattern" ? "bg-accent-light text-accent-dark" :
              "bg-muted text-muted-foreground"
            }`}>
              {confidenceLevel === "strong" ? copy.strongPattern :
               confidenceLevel === "pattern" ? copy.pattern : copy.earlySignal}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <InsightCard accent="primary" label={copy.weNoticed}>
            {insights.noticed}
          </InsightCard>
          <InsightCard accent="secondary" label={copy.whatWorkedBest}>
            {insights.whatWorked}
          </InsightCard>
          {hasFeedback && (
            <InsightCard accent="accent" label={copy.whatFeltHard}>
              {insights.whatFeltHard}
            </InsightCard>
          )}
        </div>
      </div>

      {/* ── Family Patterns (data-gated) ─────────────────────────────────── */}
      <div className="premium-card rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold mb-1">{copy.familyPatternsTitle}</h2>
        <p className="text-xs text-muted-foreground mb-4">
          {hasEnoughForPatterns
            ? copy.familyPatternsHas
            : copy.familyPatternsNone}
        </p>

        {hasEnoughForPatterns ? (
          <div className="space-y-3">
            {doneCount > 0 && (
              <InsightCard accent="secondary" confidence={confidenceLevel} label={copy.whatsClicking}>
                {copy.whatsClickingBody(doneCount)}
              </InsightCard>
            )}
            {tooHardCount > 0 && (
              <InsightCard accent="accent" confidence={confidenceLevel} label={copy.whereToEase}>
                {copy.whereToEaseBody(tooHardCount)}
              </InsightCard>
            )}
            {skippedCount > 0 && (
              <InsightCard accent="muted" confidence="early" label={copy.skippedMoments}>
                {copy.skippedBody(skippedCount)}
              </InsightCard>
            )}
            {tooEasyCount > 0 && (
              <InsightCard accent="primary" confidence={confidenceLevel} label={copy.readyForMore}>
                {copy.readyForMoreBody(tooEasyCount)}
              </InsightCard>
            )}
          </div>
        ) : (
          <EmptyStateCard
            icon={
              <svg className="w-8 h-8 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            }
            message={totalFeedback === 0
              ? copy.patternsEmptyZero
              : copy.patternsEmptyMore(3 - totalFeedback, 3 - totalFeedback !== 1)}
            subMessage={copy.patternsEmptySub}
          />
        )}
      </div>

      {/* ── Next Plan Adjustment ──────────────────────────────────────────── */}
      <div className="premium-card rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold mb-1">{copy.nextAdjustTitle}</h2>
        <p className="text-xs text-muted-foreground mb-4">
          {copy.nextAdjustDesc}
        </p>
        <InsightCard accent="primary">
          {nextAdjustmentText}
        </InsightCard>
        {totalFeedback > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            {copy.basedOn(totalFeedback, totalFeedback !== 1)}
          </p>
        )}
      </div>

      {/* ── Tiny Wins ─────────────────────────────────────────────────────── */}
      <div className="premium-card rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold mb-1">{copy.tinyWinsTitle}</h2>
        <p className="text-xs text-muted-foreground mb-4">
          {copy.tinyWinsDesc}
        </p>

        {tinyWins.length > 0 ? (
          <div className="space-y-2.5">
            {tinyWins.map((win) => (
              <div key={win.id} className="flex items-start gap-3 bg-gradient-to-br from-secondary-light/40 to-secondary-light/20 rounded-xl p-3.5">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-secondary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {win.dayNumber}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">{win.moment}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyStateCard
            message={copy.tinyWinsEmpty}
            subMessage={copy.tinyWinsEmptySub}
          />
        )}
      </div>

      {/* ── TinyPlan Memory ───────────────────────────────────────────────── */}
      <div className="mb-6">
        <TinyPlanMemory
          goalDisplayText={weeklyPlan.goalDisplayText}
          bestMomentDisplay={weeklyPlan.bestMomentDisplay}
          planStyleDisplay={weeklyPlan.planStyleDisplay}
          profileDisplayName={weeklyPlan.profileDisplayName}
          hardMomentDisplay={weeklyPlan.hardMomentDisplay}
          feedbackCounts={feedbackCounts}
        />
      </div>

      {/* ── Weekly Check-In Prompts ────────────────────────────────────────── */}
      <div className="hero-card p-6 mb-6">
        <h2 className="text-lg font-bold mb-1">{copy.weeklyCheckin}</h2>
        <p className="text-sm text-muted-foreground mb-5">
          {copy.weeklyCheckinDesc}
        </p>
        <div className="space-y-3">
          {checkInPrompts.map((prompt, i) => (
            <div key={i} className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">{prompt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Next Week Preview ─────────────────────────────────────────────── */}
      <div className="hero-card p-6 mb-6">
        <h2 className="text-lg font-bold mb-1">{nextWeekHeadline}</h2>
        <p className="text-xs text-muted-foreground mb-4">
          {copy.nextWeekDesc}
        </p>
        <ul className="space-y-2.5">
          {nextWeekDetails.map((detail, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
              <span className="text-muted-foreground leading-relaxed">{detail}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── How TinyPlan adapts ───────────────────────────────────────────── */}
      <div className="surface-sunken border border-border-whisper rounded-2xl p-5">
        <p className="text-sm font-semibold text-center mb-4">{copy.learns3}</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="premium-card rounded-xl p-3 text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-light to-primary-light/50 flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <p className="text-xs font-medium">{copy.yourQuizAnswers}</p>
          </div>
          <div className="premium-card rounded-xl p-3 text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-light to-secondary-light/50 flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <p className="text-xs font-medium">{copy.yourDailyFeedback}</p>
          </div>
          <div className="premium-card rounded-xl p-3 text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-light to-accent-light/50 flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-xs font-medium">{copy.yourSosQuestions}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
