import { getCurrentUser } from "@/lib/auth/magic-link";
import {
  getActivePlan,
  getDayLogs,
  getTodayDayNumber,
  parseWeeklyPlan,
  getQuizTagProfile,
  localizePlan,
} from "@/lib/dashboard/helpers";
import { buildDailyToolkit } from "@/lib/engine/daily-toolkit";
import type { ToolkitContext } from "@/lib/engine/daily-toolkit";
import { getGrowthPath, getSkillByDay } from "@/data/parent-growth-path";
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
  return {
    title:
      locale === "es"
        ? "Tu camino de 7 días — TinyPlan"
        : "Your 7-Day Parent Growth Path — TinyPlan",
  };
}

const DAY_NAMES: Record<Locale, string[]> = {
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  es: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
};

const COPY = {
  es: {
    noPlanTitle: "Aún no tienes un plan",
    noPlanDesc: "Completa el test para obtener tu plan personalizado de 7 días.",
    startQuiz: "Empezar el test",
    heroTitle: "Tu camino de crecimiento de 7 días",
    heroSubtitle:
      "Siete días, siete habilidades para madres y padres — cada una pensada para un momento que tu familia vive de verdad.",
    builtFor: "Creado para",
    age: "Edad",
    thisWeekPractice: "Esta semana practicarás",
    moreSuffix: "más",
    daysPractised: (n: number) => `${n}/7 días practicados`,
    buildingSomething: " — estás construyendo algo real",
    youDidIt: " — lo lograste",
    dayByDay: "Día por día",
    day: "Día",
    today: "Hoy",
    done: "Listo",
    go: "Ir",
    playMomentLabel: "Momento de juego",
    energy: "energía",
    backupLabel: "Plan B",
    tinyWinLabel: "Pequeña victoria",
    whyThisWeek: "Por qué la semana está armada así",
    youToldUs: "Nos contaste",
    upcomingFocus: "Próximo enfoque",
    // buildWhyThisWeek
    pieceHard: (pain: string) => `Nos contaste que ${pain} puede ser difícil`,
    pieceGoal: (goal: string) => `tu objetivo es ${goal}`,
    fallbackOpening: "Tus respuestas del test dieron forma a este plan",
    whyBody: (painLower: string | null) =>
      `Por eso los primeros dos días construyen previsibilidad — el sistema nervioso de tu peque necesita saber qué viene antes de que la cooperación se vuelva más fácil. ` +
      `Los días 3 y 4 suman el momento de juego práctico para anclar la rutina a algo positivo. ` +
      `Los días 5 y 6 te dan herramientas para los momentos difíciles: qué decir, qué hacer cuando ${painLower ?? "las cosas se ponen difíciles"}, y un plan B si tu primer intento no funciona. ` +
      `El día 7 es tuyo — nota qué funcionó, repara lo que se sintió desordenado y lleva una cosa contigo.`,
    whyClosing: (moment: string, styleLower: string) =>
      ` Las actividades están adaptadas a ${moment} y a un ${styleLower} — porque eso es lo que dijiste que funciona para tu familia.`,
  },
  en: {
    noPlanTitle: "No plan yet",
    noPlanDesc: "Complete the quiz to get your personalised 7-day plan.",
    startQuiz: "Start the Quiz",
    heroTitle: "Your 7-Day Parent Growth Path",
    heroSubtitle:
      "Seven days, seven parent skills — each one built for a moment your family actually lives in.",
    builtFor: "Built for",
    age: "Age",
    thisWeekPractice: "This week you'll practice",
    moreSuffix: "more",
    daysPractised: (n: number) => `${n}/7 days practised`,
    buildingSomething: " — you're building something real",
    youDidIt: " — you did it",
    dayByDay: "Day by day",
    day: "Day",
    today: "Today",
    done: "Done",
    go: "Go",
    playMomentLabel: "Play moment",
    energy: "energy",
    backupLabel: "Backup",
    tinyWinLabel: "Tiny win",
    whyThisWeek: "Why this week is built this way",
    youToldUs: "You told us",
    upcomingFocus: "Upcoming focus",
    pieceHard: (pain: string) => `You told us ${pain} can be hard`,
    pieceGoal: (goal: string) => `your goal is ${goal}`,
    fallbackOpening: "Your quiz answers shaped this plan",
    whyBody: (painLower: string | null) =>
      `That's why the first two days build predictability — your child's nervous system needs to know what's coming before cooperation gets easier. ` +
      `Days 3–4 add the hands-on play moment so there's something positive to anchor the routine to. ` +
      `Days 5–6 give you tools for the hard bits: what to say, what to do when ${painLower ?? "things get hard"}, and a backup if your first move doesn't land. ` +
      `Day 7 is yours — notice what worked, repair anything that felt messy, and carry one thing forward.`,
    whyClosing: (moment: string, styleLower: string) =>
      ` Activities are matched to ${moment} and a ${styleLower} — because that's what you said works for your family.`,
  },
} as const;

type WeekCopy = (typeof COPY)[Locale];

const ACCENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  play: { bg: "bg-primary-light", text: "text-primary", border: "border-primary/20" },
  skill: { bg: "bg-secondary-light", text: "text-secondary", border: "border-secondary/20" },
  sage: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  yellow: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  lavender: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
};

function BuiltForChips({
  weeklyPlan,
  ageRange,
  copy,
}: {
  weeklyPlan: {
    profileDisplayName: string;
    goalDisplayText: string;
    hardMomentDisplay?: string | null;
    bestMomentDisplay: string;
    planStyleDisplay: string;
  };
  ageRange?: string | null;
  copy: WeekCopy;
}) {
  const chips: { label: string; icon: string }[] = [];

  if (ageRange) {
    const num = parseInt(ageRange, 10);
    if (!Number.isNaN(num)) chips.push({ label: `${copy.age} ${num}`, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" });
  }
  if (weeklyPlan.profileDisplayName) chips.push({ label: weeklyPlan.profileDisplayName, icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" });
  if (weeklyPlan.hardMomentDisplay) chips.push({ label: weeklyPlan.hardMomentDisplay, icon: "M13 10V3L4 14h7v7l9-11h-7z" });
  if (weeklyPlan.goalDisplayText) chips.push({ label: weeklyPlan.goalDisplayText, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" });
  if (weeklyPlan.bestMomentDisplay) chips.push({ label: weeklyPlan.bestMomentDisplay, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" });
  if (weeklyPlan.planStyleDisplay) chips.push({ label: weeklyPlan.planStyleDisplay, icon: "M4 6h16M4 10h16M4 14h16M4 18h16" });

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full"
        >
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={chip.icon} />
          </svg>
          {chip.label}
        </span>
      ))}
    </div>
  );
}

function WeekSkillChips({ locale, copy }: { locale: Locale; copy: WeekCopy }) {
  const growthPath = getGrowthPath(locale);
  const weekSkills = growthPath.slice(0, 4);
  return (
    <div className="flex flex-wrap gap-2">
      {weekSkills.map((skill) => {
        const colors = ACCENT_COLORS[skill.accent] ?? ACCENT_COLORS.play;
        return (
          <span
            key={skill.id}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}
          >
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            {skill.title}
          </span>
        );
      })}
      {growthPath.length > 4 && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
          +{growthPath.length - 4} {copy.moreSuffix}
        </span>
      )}
    </div>
  );
}

function DayProgressDot({ status, isToday }: { status?: string | null; isToday: boolean }) {
  if (status === "done") {
    return (
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-xs shrink-0">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (isToday) {
    return (
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-xs shrink-0 ring-2 ring-primary/20">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
      <div className="w-2 h-2 rounded-full bg-border" />
    </div>
  );
}

function buildWhyThisWeek(
  weeklyPlan: {
    goalDisplayText: string;
    hardMomentDisplay?: string | null;
    bestMomentDisplay: string;
    planStyleDisplay: string;
    profileDisplayName: string;
  },
  copy: WeekCopy,
): string {
  const goal = weeklyPlan.goalDisplayText;
  const pain = weeklyPlan.hardMomentDisplay;
  const moment = weeklyPlan.bestMomentDisplay;
  const style = weeklyPlan.planStyleDisplay;

  const parts: string[] = [];
  if (pain) parts.push(copy.pieceHard(pain.toLowerCase()));
  if (goal) parts.push(copy.pieceGoal(goal.toLowerCase()));
  if (!parts.length) parts.push(copy.fallbackOpening);

  const opening = parts.join(", ") + ". ";

  const body = copy.whyBody(pain ? pain.toLowerCase() : null);

  const closing = moment && style
    ? copy.whyClosing(moment, style.toLowerCase())
    : "";

  return opening + body + closing;
}

export default async function WeekPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const copy = COPY[locale];
  const dayNames = DAY_NAMES[locale];
  const user = await getCurrentUser();
  if (!user) return null;

  const plan = getActivePlan(user.id);

  if (!plan) {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-light to-primary-light/50 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">{copy.noPlanTitle}</h1>
        <p className="text-muted-foreground mb-6">{copy.noPlanDesc}</p>
        <Link href={localizeHref("/quiz", locale)}>
          <Button size="lg">{copy.startQuiz}</Button>
        </Link>
      </div>
    );
  }

  const weeklyPlan = localizePlan(parseWeeklyPlan(plan.plan_json), locale);
  const dayLogs = getDayLogs(plan.id);
  const todayDayNumber = getTodayDayNumber(plan.created_at!);
  const logMap = new Map(dayLogs.map((l) => [l.day_number, l.status]));
  const completedCount = dayLogs.filter((l) => l.status === "done").length;

  const tagProfile = getQuizTagProfile(plan.quiz_session_id);
  const toolkitCtx: ToolkitContext = tagProfile
    ? {
        primaryGoal: tagProfile.primary_goal,
        mainPain: tagProfile.main_pain,
        mainPainAll: tagProfile.main_pain_all,
        routineMoment: tagProfile.routine_moment,
        ageRange: tagProfile.age_range,
        needsScripts: tagProfile.needs_scripts,
      }
    : {
        primaryGoal: "",
        mainPain: weeklyPlan.hardMoment ?? "",
        routineMoment: weeklyPlan.bestMoment,
      };

  const dayToolkits = new Map(
    weeklyPlan.days.map((d) => [d.dayNumber, buildDailyToolkit(toolkitCtx, d.dayNumber)]),
  );

  const ageRange = tagProfile?.age_range ?? null;
  const whyThisWeek = buildWhyThisWeek(weeklyPlan, copy);

  const tomorrowDay = weeklyPlan.days.find((d) => d.dayNumber === todayDayNumber + 1);
  const tomorrowSkill = tomorrowDay ? getSkillByDay(tomorrowDay.dayNumber, locale) : null;

  return (
    <div className="max-w-2xl mx-auto animate-fade-up space-y-6 pb-8">

      {/* ── Hero ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {copy.heroTitle}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {copy.heroSubtitle}
        </p>

        {/* Built-for chips */}
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {copy.builtFor}
          </p>
          <BuiltForChips weeklyPlan={weeklyPlan} ageRange={ageRange} copy={copy} />
        </div>

        {/* This week you'll practice */}
        <div className="hero-card p-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
            {copy.thisWeekPractice}
          </p>
          <WeekSkillChips locale={locale} copy={copy} />
        </div>
      </div>

      {/* ── Progress strip ── */}
      <div className="premium-card rounded-xl p-4">
        <div className="flex gap-1.5 mb-2">
          {weeklyPlan.days.map((d) => {
            const status = logMap.get(d.dayNumber);
            return (
              <div
                key={d.dayNumber}
                className={`flex-1 h-2 rounded-full ${
                  status === "done"
                    ? "bg-gradient-to-r from-secondary to-secondary/80"
                    : d.dayNumber === todayDayNumber
                      ? "bg-gradient-to-r from-primary to-primary/80"
                      : status
                        ? "bg-border"
                        : "bg-muted"
                }`}
              />
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {copy.daysPractised(completedCount)}
          {completedCount > 0 && completedCount < 7 && copy.buildingSomething}
          {completedCount === 7 && copy.youDidIt}
        </p>
      </div>

      {/* ── Timeline ── */}
      <div>
        <h2 className="text-base font-bold mb-4">{copy.dayByDay}</h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" aria-hidden="true" />

          <div className="space-y-0">
            {weeklyPlan.days.map((day, index) => {
              const isToday = day.dayNumber === todayDayNumber;
              const isPast = day.dayNumber < todayDayNumber;
              const isFuture = day.dayNumber > todayDayNumber;
              const status = logMap.get(day.dayNumber);
              const toolkit = dayToolkits.get(day.dayNumber);
              const growthSkill = getSkillByDay(day.dayNumber, locale);
              const colors = growthSkill ? (ACCENT_COLORS[growthSkill.accent] ?? ACCENT_COLORS.play) : ACCENT_COLORS.play;
              const activityDiffersFromPlayMoment =
                growthSkill &&
                day.activity.title.toLowerCase() !== growthSkill.playMomentTitle.toLowerCase();

              return (
                <div key={day.dayNumber} className={`relative pl-14 pb-6 ${index === weeklyPlan.days.length - 1 ? "pb-0" : ""}`}>
                  {/* Dot */}
                  <div className="absolute left-0 top-0">
                    <DayProgressDot status={status} isToday={isToday} />
                  </div>

                  {/* Card */}
                  <div
                    className={`rounded-2xl p-4 transition-all ${
                      isToday
                        ? "hero-card border-primary/20 shadow-hero"
                        : status === "done"
                          ? "premium-card opacity-75"
                          : isFuture
                            ? "premium-card"
                            : "premium-card"
                    }`}
                  >
                    {/* Day header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {copy.day} {day.dayNumber}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {dayNames[(day.dayNumber - 1) % 7]}
                          </span>
                          {isToday && (
                            <span className="text-[10px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full shadow-xs">
                              {copy.today}
                            </span>
                          )}
                          {status === "done" && (
                            <span className="text-[10px] font-semibold text-secondary bg-secondary-light px-2 py-0.5 rounded-full shadow-xs">
                              {copy.done}
                            </span>
                          )}
                        </div>

                        {/* Parent skill title */}
                        {growthSkill && (
                          <h3 className={`text-sm font-bold ${colors.text} mb-0.5`}>
                            {growthSkill.title}
                          </h3>
                        )}
                      </div>

                      {isToday && (
                        <Link href={localizeHref("/dashboard/today", locale)} className="shrink-0">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-full shadow-xs">
                            {copy.go}
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </Link>
                      )}
                    </div>

                    {/* Play moment title */}
                    {growthSkill && (
                      <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg mb-3 ${colors.bg} ${colors.text}`}>
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {copy.playMomentLabel}: {growthSkill.playMomentTitle}
                      </div>
                    )}

                    {/* Activity title if different */}
                    {activityDiffersFromPlayMoment && (
                      <p className="text-sm font-medium text-foreground mb-2">
                        {day.activity.title}
                      </p>
                    )}

                    {/* What parent practices */}
                    {growthSkill && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {growthSkill.whatYouPractice}
                      </p>
                    )}

                    {/* When to use */}
                    {growthSkill && (
                      <p className="text-xs text-muted-foreground italic mb-3 border-l-2 border-border pl-2.5">
                        {growthSkill.whenToUse}
                      </p>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span>{day.timeMinutes} min</span>
                      <span>&middot;</span>
                      <span>{day.routineMoment}</span>
                      {day.activity.energy_level && (
                        <>
                          <span>&middot;</span>
                          <span>{day.activity.energy_level} {copy.energy}</span>
                        </>
                      )}
                    </div>

                    {/* Toolkit chips */}
                    {toolkit && (
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border-whisper">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full shadow-xs">
                          <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {toolkit.parentSkill.title}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-secondary bg-secondary-light px-2 py-0.5 rounded-full shadow-xs">
                          <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {toolkit.emotionalTool.title}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full shadow-xs">
                          <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          {copy.backupLabel}: {toolkit.backup.title}
                        </span>
                      </div>
                    )}

                    {/* Tiny win for past/today days */}
                    {growthSkill && (isToday || isPast) && (
                      <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                        <svg className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>{copy.tinyWinLabel}: {growthSkill.tinyWin}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Why this week is built this way ── */}
      <div className="premium-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold">{copy.whyThisWeek}</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {whyThisWeek}
        </p>
        {weeklyPlan.quizSummary && weeklyPlan.quizSummary.youToldUs.length > 0 && (
          <div className="mt-4 space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {copy.youToldUs}
            </p>
            {weeklyPlan.quizSummary.youToldUs.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <svg className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Upcoming focus (tomorrow) ── */}
      {tomorrowDay && tomorrowSkill && (
        <div className="bg-gradient-to-br from-primary-light/80 to-primary-light/30 border border-primary/10 rounded-2xl p-5 shadow-card">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-3">
            {copy.upcomingFocus} — {copy.day} {tomorrowDay.dayNumber}
          </p>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-primary mb-0.5">{tomorrowSkill.title}</p>
              <p className="text-xs text-primary/70 mb-2">{copy.playMomentLabel}: {tomorrowSkill.playMomentTitle}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{tomorrowSkill.whenToUse}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
