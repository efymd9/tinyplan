import { getCurrentUser } from "@/lib/auth/magic-link";
import {
  getActivePlan,
  getDayLogs,
  getTodayDayNumber,
  parseWeeklyPlan,
  getQuizTagProfile,
} from "@/lib/dashboard/helpers";
import { generateAdaptiveInsight, getEarlySignalLevel } from "@/lib/personalization/personalize";
import { buildDailyToolkit } from "@/lib/engine/daily-toolkit";
import type { ToolkitContext } from "@/lib/engine/daily-toolkit";
import { PARENT_SKILL_LABELS } from "@/data/parent-tools";
import { PARENT_GROWTH_PATH } from "@/data/parent-growth-path";
import { SpotIcon } from "@/components/illustrations/activity-illustrations";
import Image from "next/image";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TinyPlanMemory } from "@/components/dashboard/tinyplan-memory";
import { InsightCard } from "@/components/ui/insight-card";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Progress — TinyPlan" };

function tinyWinMoment(activityTitle: string, status: string): string {
  if (status === "done") return `You showed up for "${activityTitle}" — and it landed.`;
  if (status === "too_easy") return `"${activityTitle}" came easily. Ready for more.`;
  return `"${activityTitle}" — logged and learned from.`;
}

export default async function ProgressPage() {
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
        <h1 className="text-2xl font-bold mb-2">No progress yet</h1>
        <p className="text-muted-foreground mb-6">Start your plan to see how things are going here.</p>
        <Link href="/quiz"><Button size="lg">Start the Quiz</Button></Link>
      </div>
    );
  }

  const weeklyPlan = parseWeeklyPlan(plan.plan_json);
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
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

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
      childName: tagProfile.child_name,
      isLowEnergy: tagProfile.is_low_energy,
      needsScripts: tagProfile.needs_scripts,
      parentConstraints: tagProfile.parent_constraint,
      struggle: hasStruggle,
    };
    for (const day of weeklyPlan.days) {
      const toolkit = buildDailyToolkit(ctx, day.dayNumber);
      const skill = toolkit.parentSkill;
      const key = skill.skillType ?? skill.id;
      const label = skill.skillType
        ? (PARENT_SKILL_LABELS[skill.skillType] ?? skill.title)
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

  const fallbackParentSkills = Object.entries(PARENT_SKILL_LABELS).slice(0, 4).map(([key, label]) => ({
    key, label, practiced: 0, total: 1,
  }));
  const displayParentSkills = parentSkills.length > 0 ? parentSkills : fallbackParentSkills;
  const parentSkillsPracticed = displayParentSkills.filter((s) => s.practiced > 0).length;

  // Strongest skill (most practiced)
  const strongestSkill = displayParentSkills.reduce(
    (best, s) => s.practiced > best.practiced ? s : best,
    displayParentSkills[0]
  );
  const strongestGrowthSkill = PARENT_GROWTH_PATH.find((gs) =>
    gs.id.replace(/-/g, "_") === strongestSkill.key ||
    gs.title.toLowerCase() === strongestSkill.label.toLowerCase()
  );

  // Next recommended skill from growth path
  const nextDaySkill = PARENT_GROWTH_PATH.find((gs) => gs.dayNumber === Math.min(todayDayNumber + 1, 7));
  const recommendedSkill = hasStruggle
    ? PARENT_GROWTH_PATH.find((gs) => gs.id === "start-smaller") ?? nextDaySkill
    : nextDaySkill;

  // ── Plan adjustment copy ───────────────────────────────────────────────────
  const tooHardCount = feedbackCounts["too_hard"] ?? 0;
  const tooEasyCount = feedbackCounts["too_easy"] ?? 0;
  const skippedCount = feedbackCounts["skipped"] ?? 0;
  const doneCount = feedbackCounts["done"] ?? 0;

  let nextAdjustmentText: string;
  if (totalFeedback === 0) {
    nextAdjustmentText = "Log how today's activity goes and your next plan will start adjusting automatically.";
  } else if (tooHardCount > 1) {
    nextAdjustmentText = "Shorter, lower-prep activities next week — we heard you.";
  } else if (tooEasyCount > 0) {
    nextAdjustmentText = "Your child is ready for more. The next plan adds a layer of challenge.";
  } else if (skippedCount > 1) {
    nextAdjustmentText = "Simpler options for the moments that felt like too much.";
  } else if (doneCount >= 4) {
    nextAdjustmentText = `What's working (${weeklyPlan.planStyleDisplay}) stays in the plan.`;
  } else {
    nextAdjustmentText = "TinyPlan is learning what works. Keep logging to unlock stronger adjustments.";
  }

  // ── Tiny Wins (completed activities as real moments) ──────────────────────
  const tinyWins = dayLogs
    .filter((l) => l.status === "done" || l.status === "too_easy")
    .sort((a, b) => (b.day_number ?? 0) - (a.day_number ?? 0))
    .map((log) => {
      const day = weeklyPlan.days.find((d) => d.dayNumber === log.day_number);
      return {
        id: log.id,
        dayNumber: log.day_number,
        title: day?.activity.title ?? `Day ${log.day_number}`,
        status: log.status!,
        moment: tinyWinMoment(day?.activity.title ?? `Day ${log.day_number}`, log.status!),
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
    firstCheckInQ = "Was there a moment this week when your child seemed more settled or connected than usual?";
  } else if (completedCats.includes("physical") || completedCats.includes("outdoor")) {
    firstCheckInQ = "Did you notice any change in your child's energy or mood after active play?";
  } else if (completedActivities.length > 0) {
    firstCheckInQ = "Was there a moment this week when your child surprised you with how they played?";
  } else {
    firstCheckInQ = "What moment felt easiest with your child this week — even a small one?";
  }

  const checkInPrompts: string[] = [
    firstCheckInQ,
    "Which parent skill felt most natural to try this week?",
    "What felt most manageable for you as a parent?",
    "Was there a moment that didn't go to plan — and what did you do instead?",
    "If you could change one small thing about next week's routine, what would it be?",
  ];

  // ── Next Week ─────────────────────────────────────────────────────────────
  const nextPositive = doneCount + (feedbackCounts["loved_it"] ?? 0);
  const nextNegative = tooHardCount + skippedCount;
  let nextWeekHeadline = "Week 2 builds on Week 1";
  if (totalFeedback > 0) {
    if (nextPositive > nextNegative) nextWeekHeadline = "Week 2 builds on what's working";
    else if (nextNegative > nextPositive) nextWeekHeadline = "Week 2 takes a gentler approach";
    else nextWeekHeadline = "Week 2 adjusts to your family";
  }
  const nextWeekDetails: string[] = [];
  if (nextPositive > 0) nextWeekDetails.push("Activities that worked well stay in the mix");
  if (nextNegative > 0) nextWeekDetails.push("Shorter, lower-prep options for the moments that felt hard");
  nextWeekDetails.push(`Still focused on: ${weeklyPlan.goalDisplayText}`);
  if (nextWeekDetails.length < 2) nextWeekDetails.push("Log how today goes to shape tomorrow's activity");

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="rounded-2xl overflow-hidden mb-4 bg-gradient-to-b from-secondary-light/30 to-transparent">
          <Image
            src="/images/illustrations/tinyplan-progress-steps.png"
            alt="Parent and child building something together, step by step"
            width={1448}
            height={1086}
            className="w-full max-w-xs mx-auto h-auto"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Progress
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {completedCount === 0
            ? "The system is ready — your first activity unlocks everything."
            : completedCount < totalDays
            ? "Every check-in teaches TinyPlan more about what works for your family."
            : "Seven moments logged. The system now knows your family's rhythm."}
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
          <div className="text-[11px] text-muted-foreground mt-0.5">Moments logged</div>
        </div>
        <div className="premium-card rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-light to-secondary-light/50 flex items-center justify-center mx-auto mb-2 shadow-xs">
            <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-2xl font-extrabold text-secondary">{rhythmDays}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Rhythm streak</div>
        </div>
        <div className="premium-card rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-light to-accent-light/50 flex items-center justify-center mx-auto mb-2 shadow-xs">
            <svg className="w-5 h-5 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="text-2xl font-extrabold text-accent-dark">{parentSkillsPracticed}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Skills practiced</div>
        </div>
      </div>

      {/* ── Weekly tracker ──────────────────────────────────────────────────── */}
      <div className="hero-card p-6 mb-6">
        <h2 className="text-sm font-semibold mb-4">This Week</h2>
        <ProgressBar current={completedCount} total={totalDays} stageLabel={`${completedCount}/7 this week`} />
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
          <h2 className="text-sm font-semibold">Parent Skills Practiced This Week</h2>
          {parentSkillsPracticed > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary-light text-secondary">
              {parentSkillsPracticed} of {displayParentSkills.length}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {parentSkills.length > 0
            ? "Each activity pairs with a parent skill. These are the ones you've been building."
            : "Each activity in your plan comes with a paired parent skill. They unlock as you log check-ins."}
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
                  ? `${practiced}× practiced`
                  : parentSkills.length > 0 ? "upcoming" : "in your plan"}
              </span>
            </div>
          ))}
        </div>
        {completedCount === 0 && (
          <EmptyStateCard
            message="Complete your first activity to start tracking the skills you practice."
            subMessage="Parent skills grow quietly in the background — one moment at a time."
          />
        )}
      </div>

      {/* ── Strongest / Current Skill ──────────────────────────────────────── */}
      <div className="hero-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <SpotIcon type="insight" className="w-7 h-7" />
          <h2 className="text-lg font-bold">
            {parentSkillsPracticed > 0 ? "Your Strongest Skill This Week" : "Your Current Skill"}
          </h2>
        </div>

        {parentSkillsPracticed > 0 && strongestGrowthSkill ? (
          <div className="space-y-3">
            <InsightCard accent="secondary" label={strongestSkill.label} confidence={confidenceLevel}>
              {strongestGrowthSkill.whatYouPractice}
            </InsightCard>
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tiny win to repeat</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{strongestGrowthSkill.tinyWin}</p>
            </div>
          </div>
        ) : parentSkillsPracticed > 0 ? (
          <InsightCard accent="secondary" label={strongestSkill.label} confidence="early">
            You&apos;ve started building {strongestSkill.label.toLowerCase()}. Keep logging to see the pattern grow.
          </InsightCard>
        ) : (
          <EmptyStateCard
            message="Log your first activity to reveal which skill you're building."
            subMessage="TinyPlan tracks your parent skills quietly — you just play."
          />
        )}

        {/* Next recommended skill */}
        {recommendedSkill && (
          <div className="mt-4 border-t border-border-whisper pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Next recommended skill
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
          <h2 className="text-sm font-semibold">What Worked Best for Your Family</h2>
          {hasFeedback && (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
              confidenceLevel === "strong" ? "bg-secondary-light text-secondary" :
              confidenceLevel === "pattern" ? "bg-accent-light text-accent-dark" :
              "bg-muted text-muted-foreground"
            }`}>
              {confidenceLevel === "strong" ? "Strong pattern" :
               confidenceLevel === "pattern" ? "Pattern" : "Early signal"}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <InsightCard accent="primary" label="This week we noticed">
            {insights.noticed}
          </InsightCard>
          <InsightCard accent="secondary" label="What worked best">
            {insights.whatWorked}
          </InsightCard>
          {hasFeedback && (
            <InsightCard accent="accent" label="What felt hard">
              {insights.whatFeltHard}
            </InsightCard>
          )}
        </div>
      </div>

      {/* ── Family Patterns (data-gated) ─────────────────────────────────── */}
      <div className="premium-card rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold mb-1">Family Patterns</h2>
        <p className="text-xs text-muted-foreground mb-4">
          {hasEnoughForPatterns
            ? "Patterns TinyPlan has spotted from your check-ins this week."
            : "Patterns appear after a few check-ins — the system is listening."}
        </p>

        {hasEnoughForPatterns ? (
          <div className="space-y-3">
            {doneCount > 0 && (
              <InsightCard accent="secondary" confidence={confidenceLevel} label="What's clicking">
                {doneCount} {doneCount === 1 ? "activity" : "activities"} felt right — that&apos;s the rhythm we build on.
              </InsightCard>
            )}
            {tooHardCount > 0 && (
              <InsightCard accent="accent" confidence={confidenceLevel} label="Where to ease up">
                {tooHardCount} {tooHardCount === 1 ? "activity" : "activities"} felt like too much.
                Shorter, lower-prep options are on the way.
              </InsightCard>
            )}
            {skippedCount > 0 && (
              <InsightCard accent="muted" confidence="early" label="Skipped moments">
                {skippedCount} skipped — that&apos;s useful signal too.
                We&apos;ll swap those for something that fits your energy better.
              </InsightCard>
            )}
            {tooEasyCount > 0 && (
              <InsightCard accent="primary" confidence={confidenceLevel} label="Ready for more">
                {tooEasyCount} {tooEasyCount === 1 ? "activity" : "activities"} felt too easy — your child is ready for a bit more challenge.
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
              ? "No patterns yet — log today's activity to get started."
              : `${3 - totalFeedback} more check-in${3 - totalFeedback === 1 ? "" : "s"} to unlock family patterns.`}
            subMessage="Once we spot a real pattern, it shows up here — not before."
          />
        )}
      </div>

      {/* ── Next Plan Adjustment ──────────────────────────────────────────── */}
      <div className="premium-card rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold mb-1">Next Plan Adjustment</h2>
        <p className="text-xs text-muted-foreground mb-4">
          What changes in your next plan based on this week.
        </p>
        <InsightCard accent="primary">
          {nextAdjustmentText}
        </InsightCard>
        {totalFeedback > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Based on {totalFeedback} check-in{totalFeedback === 1 ? "" : "s"} — keep logging to refine further.
          </p>
        )}
      </div>

      {/* ── Tiny Wins ─────────────────────────────────────────────────────── */}
      <div className="premium-card rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold mb-1">Tiny Wins</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Real moments this week — logged and counted.
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
            message="No wins logged yet — and that's fine."
            subMessage="Your first completed activity becomes a tiny win worth remembering."
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
        <h2 className="text-lg font-bold mb-1">Weekly Check-In</h2>
        <p className="text-sm text-muted-foreground mb-5">
          5 questions that shape next week&apos;s plan. No right answers — just honest ones.
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
          Here&apos;s what to expect when the next plan starts.
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
        <p className="text-sm font-semibold text-center mb-4">The system learns through 3 things</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="premium-card rounded-xl p-3 text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-light to-primary-light/50 flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <p className="text-xs font-medium">Your quiz answers</p>
          </div>
          <div className="premium-card rounded-xl p-3 text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-light to-secondary-light/50 flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <p className="text-xs font-medium">Your daily feedback</p>
          </div>
          <div className="premium-card rounded-xl p-3 text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-light to-accent-light/50 flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-xs font-medium">Your SOS questions</p>
          </div>
        </div>
      </div>

    </div>
  );
}
