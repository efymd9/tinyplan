import { getCurrentUser } from "@/lib/auth/magic-link";
import {
  getActivePlan,
  getDayLog,
  getDayLogs,
  getTodayDayNumber,
  parseWeeklyPlan,
  getQuizTagProfile,
} from "@/lib/dashboard/helpers";
import type { ToolkitContext } from "@/lib/engine/daily-toolkit";
import type { PlanActivity } from "@/lib/engine/plan-generator";
import { getSkillByDay, PARENT_GROWTH_PATH } from "@/data/parent-growth-path";
import type { ParentSkill } from "@/data/parent-growth-path";
import {
  DailyHeroCard,
  ToolkitAccordionCard,
  SkillLessonContent,
} from "@/components/dashboard/toolkit";
import { ActivityActions } from "@/components/dashboard/activity-actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Today — TinyPlan" };

// ── Personalisation ───────────────────────────────────────────────────────────

const PAIN_PHRASES: Record<string, string> = {
  screen_time: "screen-time endings feel hard",
  transitions: "transitions feel hard",
  no_ideas: "finding new activities",
  boredom: "your child gets bored quickly",
  independent_play: "solo play is hard to start",
  bedtime: "bedtime feels chaotic",
  connection: "you want more time together",
};

const GOAL_LABELS: Record<string, string> = {
  easier_bedtime: "easier bedtime",
  fewer_screens: "fewer screens",
  calmer_transitions: "calmer transitions",
  connection: "more connection",
  independent_play: "confident solo play",
  focus: "focus",
  speech: "speech & stories",
};

function buildSkillFitHint(ctx: ToolkitContext, skill: ParentSkill): string {
  const pains = ctx.mainPainAll ?? (ctx.mainPain ? [ctx.mainPain] : []);
  const painPhrase = PAIN_PHRASES[pains[0] ?? ""];
  const goalLabel = GOAL_LABELS[ctx.primaryGoal ?? ""];

  const opening =
    painPhrase && goalLabel
      ? `You said ${painPhrase} and you want ${goalLabel}.`
      : painPhrase
        ? `You said ${painPhrase}.`
        : goalLabel
          ? `You want ${goalLabel}.`
          : "Built from your quiz answers.";

  return `${opening} ${skill.whenToUse}`;
}

// ── Sub-components (server-rendered, passed as children to accordion) ─────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}
      </p>
      {children}
    </div>
  );
}

function PlayMomentContent({
  activity,
  steps,
  materials,
  timeMinutes,
}: {
  activity: PlanActivity;
  steps: string[];
  materials: string[];
  timeMinutes: number;
}) {
  return (
    <div className="pt-4 space-y-4">
      {/* Meta row */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs bg-muted/80 px-2.5 py-1 rounded-full font-medium">
          {timeMinutes} min
        </span>
        {activity.energy_level && (
          <span className="text-xs bg-muted/80 px-2.5 py-1 rounded-full font-medium capitalize">
            {activity.energy_level} energy
          </span>
        )}
        {activity.category && (
          <span className="text-xs bg-muted/80 px-2.5 py-1 rounded-full font-medium">
            {activity.category}
          </span>
        )}
        {activity.age_min != null && activity.age_max != null && (
          <span className="text-xs bg-muted/80 px-2.5 py-1 rounded-full font-medium">
            Ages {activity.age_min}–{activity.age_max}
          </span>
        )}
      </div>

      {activity.why_it_works && (
        <Field label="Goal">
          <p className="text-sm leading-relaxed">{activity.why_it_works}</p>
        </Field>
      )}

      {materials.length > 0 && (
        <Field label="You&apos;ll need">
          <ul className="space-y-1">
            {materials.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1.5 shrink-0">&#8226;</span>
                {m}
              </li>
            ))}
          </ul>
        </Field>
      )}

      {activity.easier_version && (
        <Field label="Quick version">
          <p className="text-sm leading-relaxed">{activity.easier_version}</p>
        </Field>
      )}

      {steps.length > 0 && (
        <Field label="Full steps">
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </Field>
      )}

      {activity.parent_script && (
        <div className="bg-secondary-light/50 border border-secondary/15 rounded-xl p-3">
          <p className="text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">
            Parent script
          </p>
          <p className="text-sm italic leading-relaxed">
            &ldquo;{activity.parent_script}&rdquo;
          </p>
        </div>
      )}

      {activity.fallback_if_refuses && (
        <div className="bg-accent-light/50 border border-accent/15 rounded-xl p-3">
          <p className="text-xs font-semibold text-accent-dark mb-1">If they lose interest</p>
          <p className="text-sm leading-relaxed">{activity.fallback_if_refuses}</p>
        </div>
      )}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function PracticeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function TodayPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const plan = getActivePlan(user.id);

  if (!plan) {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">No plan yet</h1>
        <p className="text-muted-foreground mb-2">
          Complete the quiz so we can build your first weekly plan.
        </p>
        <p className="text-sm text-muted-foreground mb-6">It takes about 3 minutes.</p>
        <Link href="/quiz">
          <Button size="lg">Start the Quiz</Button>
        </Link>
      </div>
    );
  }

  const weeklyPlan = parseWeeklyPlan(plan.plan_json);
  const dayNumber = getTodayDayNumber(plan.created_at!);
  const todayPlan = weeklyPlan.days.find((d) => d.dayNumber === dayNumber);
  const tomorrowPlan = weeklyPlan.days.find((d) => d.dayNumber === dayNumber + 1);
  const dayLogs = getDayLogs(plan.id);
  const dayLog = getDayLog(plan.id, dayNumber);
  const logMap = new Map(dayLogs.map((l) => [l.day_number, l.status]));
  const completedCount = dayLogs.filter((l) => l.status === "done").length;

  if (!todayPlan) {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-secondary-light flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Week complete!</h1>
        <p className="text-muted-foreground mb-2">
          {completedCount} meaningful moments this week. That&apos;s something to be proud of.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/dashboard/progress">
            <Button>View Progress</Button>
          </Link>
          <Link href="/dashboard/library">
            <Button variant="outline">Browse Library</Button>
          </Link>
        </div>
      </div>
    );
  }

  const activity = todayPlan.activity;
  const steps: string[] = activity.steps_json ? JSON.parse(activity.steps_json) : [];
  const materials = activity.materials
    ? activity.materials.split(",").map((m: string) => m.trim()).filter(Boolean)
    : [];

  const tagProfile = getQuizTagProfile(plan.quiz_session_id);
  const recentStruggle = dayLogs.some(
    (l) => (l.day_number ?? 0) >= dayNumber - 2 && (l.status === "too_hard" || l.status === "skipped"),
  );

  const toolkitCtx: ToolkitContext = tagProfile
    ? {
        primaryGoal: tagProfile.primary_goal,
        mainPain: tagProfile.main_pain,
        mainPainAll: tagProfile.main_pain_all,
        routineMoment: tagProfile.routine_moment,
        ageRange: tagProfile.age_range,
        needsScripts: tagProfile.needs_scripts,
        struggle: recentStruggle,
      }
    : {
        primaryGoal: "",
        mainPain: weeklyPlan.hardMoment ?? "",
        routineMoment: weeklyPlan.bestMoment,
        struggle: recentStruggle,
      };

  const skill = getSkillByDay(dayNumber) ?? PARENT_GROWTH_PATH[0];
  const whyThisFits = buildSkillFitHint(toolkitCtx, skill);

  return (
    <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 max-w-5xl mx-auto">
      {/* Main column */}
      <div className="min-w-0">
        {/* Hero */}
        <div className="mb-5">
          <DailyHeroCard
            skill={skill}
            whyThisFits={whyThisFits}
            chips={["Play", "Parent Skill", "Practice", "Backup", "Check-in"]}
          />
          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mt-3 px-1">
            {weeklyPlan.days.map((d) => (
              <div
                key={d.dayNumber}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  logMap.get(d.dayNumber) === "done"
                    ? "bg-secondary shadow-xs"
                    : d.dayNumber === dayNumber
                      ? "bg-primary shadow-xs"
                      : "bg-border"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground font-medium ml-1.5">
              {completedCount}/7 done
            </span>
          </div>
        </div>

        {/* Accordion cards */}
        <div className="space-y-3 mb-8">
          {/* 1. Play Moment */}
          <ToolkitAccordionCard
            label="Play Moment"
            title={activity.title}
            summary={activity.description ?? `${todayPlan.timeMinutes} min · tap to see steps`}
            accent="play"
            icon={<PlayIcon />}
            defaultOpen
          >
            <PlayMomentContent
              activity={activity}
              steps={steps}
              materials={materials}
              timeMinutes={todayPlan.timeMinutes}
            />
          </ToolkitAccordionCard>

          {/* 2. Parent Skill Lesson */}
          <ToolkitAccordionCard
            label="Parent Skill Lesson"
            title={skill.title}
            summary={skill.whatYouPractice}
            accent="skill"
            icon={<BookIcon />}
          >
            <SkillLessonContent skill={skill} />
          </ToolkitAccordionCard>

          {/* 3. Real-Life Practice */}
          <ToolkitAccordionCard
            label="Real-Life Practice"
            title="Try it once today"
            summary={skill.realLifePractice}
            accent="sage"
            icon={<PracticeIcon />}
          >
            <div className="pt-4">
              <p className="text-sm leading-relaxed text-foreground">{skill.realLifePractice}</p>
            </div>
          </ToolkitAccordionCard>

          {/* 4. If It Gets Hard */}
          <ToolkitAccordionCard
            label="If It Gets Hard"
            title="Backup move"
            summary={skill.backup}
            accent="sos"
            icon={<ShieldIcon />}
          >
            <div className="pt-4">
              <div className="rounded-xl bg-muted/60 px-4 py-3">
                <p className="text-sm leading-relaxed text-foreground italic">
                  &ldquo;{skill.backup}&rdquo;
                </p>
              </div>
            </div>
          </ToolkitAccordionCard>

          {/* 5. Tiny Check-in */}
          <ToolkitAccordionCard
            label="Tiny Check-in"
            title="How did today go?"
            summary="Your answer shapes tomorrow's toolkit."
            accent="neutral"
            icon={<CheckCircleIcon />}
          >
            <div className="pt-4">
              <ActivityActions
                planId={plan.id}
                dayNumber={dayNumber}
                activityId={activity.id}
                currentStatus={dayLog?.status}
              />
            </div>
          </ToolkitAccordionCard>
        </div>

        {/* Mobile: tomorrow preview */}
        {tomorrowPlan && (
          <Link
            href="/dashboard/week"
            className="lg:hidden flex items-center justify-between bg-muted/50 border border-border-whisper rounded-xl p-4 mb-5 hover:bg-muted transition-colors"
          >
            <div className="min-w-0">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Up next &middot; Day {tomorrowPlan.dayNumber}
              </span>
              <p className="text-sm font-semibold truncate">{tomorrowPlan.activity.title}</p>
            </div>
            <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Mobile: SOS preview */}
        <div className="lg:hidden premium-card rounded-2xl p-4 mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Need help right now?
          </p>
          <div className="flex gap-2 overflow-x-auto">
            {[
              { label: "Screen time", href: "/dashboard/sos" },
              { label: "Big feelings", href: "/dashboard/sos" },
              { label: "Bedtime", href: "/dashboard/sos" },
              { label: "Ask TinyPlan", href: "/dashboard/sos#ask" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="shrink-0 text-xs font-medium px-3.5 py-2 rounded-full bg-muted/80 shadow-xs hover:bg-border transition-colors min-h-[44px] flex items-center"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col gap-4 pt-0">
        {tomorrowPlan && (
          <div className="premium-card rounded-2xl p-5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Up next tomorrow
            </p>
            <p className="font-semibold mb-1">{tomorrowPlan.activity.title}</p>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>{tomorrowPlan.timeMinutes} min</span>
              <span>&middot;</span>
              <span>{tomorrowPlan.routineMoment}</span>
            </div>
          </div>
        )}

        <div className="premium-card rounded-2xl p-5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            This Week
          </p>
          <div className="flex gap-1.5 mb-3">
            {weeklyPlan.days.map((d) => {
              const s = logMap.get(d.dayNumber);
              return (
                <div
                  key={d.dayNumber}
                  className={`flex-1 h-2 rounded-full ${
                    s === "done"
                      ? "bg-secondary"
                      : d.dayNumber === dayNumber
                        ? "bg-primary"
                        : "bg-muted"
                  }`}
                />
              );
            })}
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{completedCount}/7 meaningful moments</span>
            <Link href="/dashboard/week" className="text-primary font-medium hover:underline">
              View all
            </Link>
          </div>
        </div>

        <div className="premium-card rounded-2xl p-5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Need help right now?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Screen time", href: "/dashboard/sos" },
              { label: "Big feelings", href: "/dashboard/sos" },
              { label: "Bedtime", href: "/dashboard/sos" },
              { label: "Ask TinyPlan", href: "/dashboard/sos#ask" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs font-medium px-3 py-2.5 rounded-full bg-muted/80 shadow-xs hover:bg-border transition-colors text-center"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
