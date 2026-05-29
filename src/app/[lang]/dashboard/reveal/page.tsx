import { getCurrentUser } from "@/lib/auth/magic-link";
import { getActivePlan, parseWeeklyPlan } from "@/lib/dashboard/helpers";
import { deriveRoutine } from "@/lib/routines/routines";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfileIllustration, SpotIcon } from "@/components/illustrations/activity-illustrations";

export const metadata = { title: "Your TinyPlan is Ready" };

function deriveFallbackYouToldUs(plan: {
  goalDisplayText?: string;
  bestMomentDisplay?: string;
  planStyleDisplay?: string;
  hardMomentDisplay?: string;
}): string[] {
  const items: string[] = [];
  if (plan.goalDisplayText) items.push(plan.goalDisplayText.charAt(0).toLowerCase() + plan.goalDisplayText.slice(1) + " is your priority");
  if (plan.bestMomentDisplay) items.push(plan.bestMomentDisplay + " is your best time");
  if (plan.planStyleDisplay) items.push("you prefer " + plan.planStyleDisplay);
  if (plan.hardMomentDisplay) items.push(plan.hardMomentDisplay.charAt(0).toLowerCase() + plan.hardMomentDisplay.slice(1) + " is your hardest moment");
  return items.slice(0, 4);
}

function deriveFallbackSoWeCreated(plan: {
  goalDisplayText?: string;
  bestMomentDisplay?: string;
  planStyleDisplay?: string;
  hardMomentDisplay?: string;
}): string[] {
  const items: string[] = [];
  if (plan.goalDisplayText) items.push("activities focused on " + plan.goalDisplayText.charAt(0).toLowerCase() + plan.goalDisplayText.slice(1));
  if (plan.bestMomentDisplay) items.push("play designed for " + plan.bestMomentDisplay);
  if (plan.hardMomentDisplay) items.push("help for " + plan.hardMomentDisplay.charAt(0).toLowerCase() + plan.hardMomentDisplay.slice(1));
  items.push("ready-to-use parent scripts");
  return items.slice(0, 4);
}

export default async function PlanRevealPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const plan = getActivePlan(user.id);
  if (!plan) redirect("/quiz");

  const weeklyPlan = parseWeeklyPlan(plan.plan_json);
  const activityCount = weeklyPlan.days.length;
  const routine = weeklyPlan.routine ?? deriveRoutine({
    main_pain: weeklyPlan.hardMoment ?? "",
    primary_goal: weeklyPlan.goal ?? "",
    routine_moment: weeklyPlan.bestMoment ?? "",
    needs_screen_help: weeklyPlan.goal === "fewer_screens" || weeklyPlan.hardMoment === "screen_time",
  });

  const youToldUs = weeklyPlan.quizSummary?.youToldUs ?? deriveFallbackYouToldUs(weeklyPlan);
  const soWeCreated = weeklyPlan.quizSummary?.soWeCreated ?? deriveFallbackSoWeCreated(weeklyPlan);

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
            <p className="text-xs font-semibold text-primary uppercase tracking-[0.15em] mb-2">Your plan is ready</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              <span className="gradient-text-primary">{weeklyPlan.profileDisplayName}</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Built around your answers &mdash; {activityCount} days of play that fits your family.
            </p>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Your TinyPlan was built from your answers
              </h2>

              {youToldUs.length > 0 && (
                <div className="bg-gradient-to-br from-primary-light/60 to-primary-light/30 rounded-xl p-4 mb-3">
                  <p className="text-sm font-semibold mb-2">You told us:</p>
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
                  <p className="text-sm font-semibold mb-2">So this week we created:</p>
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
                This week includes
              </h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <SpotIcon type="activity" className="w-6 h-6 shrink-0" />
                  <span>{activityCount} activities with parent scripts</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <SpotIcon type="routine" className="w-6 h-6 shrink-0" />
                  <span>A personalised routine for your hardest moment</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <SpotIcon type="sos" className="w-6 h-6 shrink-0" />
                  <span>SOS scripts for meltdowns and tough moments</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <SpotIcon type="chat" className="w-6 h-6 shrink-0" />
                  <span>Ask TinyPlan when you are stuck</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <SpotIcon type="insight" className="w-6 h-6 shrink-0" />
                  <span>A weekly insight report</span>
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
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Your Routine This Week</p>
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
            <Link href="/dashboard/today" className="block">
              <Button size="lg" className="w-full text-lg rounded-[1.15rem]">
                Start Day 1
              </Button>
            </Link>
          </div>
          <Link
            href="/dashboard/week"
            className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2.5 font-medium"
          >
            View full week
          </Link>
        </div>
      </div>
    </div>
  );
}
