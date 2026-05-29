"use client";

import { useMemo, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  buildTagProfile,
  getProfileDisplayName,
  getGoalDisplayText,
  getMomentDisplayText,
  getPlanStyleDisplayText,
  getMainPainDisplayText,
  getSupportDisplayText,
} from "@/lib/quiz/tags";
import { deriveRoutine } from "@/lib/routines/routines";
import { getHardMomentDisplay } from "@/lib/personalization/personalize";
import { ProfileIllustration, SpotIcon } from "@/components/illustrations/activity-illustrations";
import { useAnalytics } from "@/lib/analytics/use-analytics";

const RESULT_STORAGE_KEY = "tinyplan_quiz_result";

const TIME_DISPLAY: Record<string, string> = {
  "3_5": "3–5 minutes",
  "7_10": "7–10 minutes",
  "10_15": "10–15 minutes",
  "15_plus": "15+ minutes",
  depends: "Flexible",
};

function ResultContent() {
  const { track } = useAnalytics();
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const data = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        tagProfile: buildTagProfile(parsed.answers),
        email: parsed.email || "",
        answers: parsed.answers,
      };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (data?.tagProfile) {
      track({
        event: "mini_result_viewed",
        properties: { profile: data.tagProfile.play_profile },
      });
    }
  }, [track, data]);

  if (!data?.tagProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card border border-border-whisper rounded-2xl p-8 text-center max-w-md shadow-card">
          <h2 className="text-xl font-bold mb-2">Your results aren&apos;t here yet</h2>
          <p className="text-muted-foreground mb-4">
            Take the 3-minute quiz to get your personalized plan.
          </p>
          <Link href="/quiz">
            <Button>Start the quiz</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { tagProfile, email, answers } = data;
  const profile = tagProfile.play_profile;
  const profileName = getProfileDisplayName(profile);
  const goalText = getGoalDisplayText(tagProfile.primary_goal);
  const momentText = getMomentDisplayText(tagProfile.routine_moment);
  const planStyleText = getPlanStyleDisplayText(tagProfile.plan_style);
  const hardMomentText = tagProfile.main_pain
    ? getHardMomentDisplay(tagProfile.main_pain)
    : null;
  const mainPainText = tagProfile.main_pain
    ? getMainPainDisplayText(tagProfile.main_pain)
    : null;
  const supportTexts = tagProfile.support_needed_all
    .map((s: string) => getSupportDisplayText(s))
    .filter(Boolean);
  const timeText = TIME_DISPLAY[tagProfile.parent_time] || tagProfile.parent_time;

  const routine = deriveRoutine({
    main_pain: tagProfile.main_pain,
    primary_goal: tagProfile.primary_goal,
    routine_moment: tagProfile.routine_moment,
    needs_screen_help: tagProfile.needs_screen_help,
  });

  const planPreview = [
    { days: "Day 1–2", focus: goalText },
    { days: "Day 3–4", focus: `${profileName}-style play` },
    { days: "Day 5–6", focus: "Variety & exploration" },
    { days: "Day 7", focus: "Calm connection routine" },
  ];

  const valueStack = [
    { icon: "activity", text: "7 daily toolkits — one play moment + one parent skill every day" },
    { icon: "chat", text: "Parent skill lessons with exact words to say when they refuse, melt down, or lose interest" },
    { icon: "sos", text: "SOS coach — 8 ready-to-use reset scripts for screen time, bedtime, and meltdowns" },
    { icon: "routine", text: "Daily routines with step-by-step guidance matched to your schedule" },
    { icon: "insight", text: "Adaptive insights — your plan evolves with your feedback each week" },
  ];

  const handleCheckout = async () => {
    setLoading(true);
    setCheckoutError(null);
    track({ event: "checkout_started" });

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          answers: JSON.stringify(answers),
        }),
      });
      const result = await res.json();
      if (result.error) {
        setCheckoutError(result.error);
        setLoading(false);
        return;
      }
      if (result.url) {
        window.location.href = result.url;
      } else {
        setCheckoutError("No checkout URL returned. Please try again.");
        setLoading(false);
      }
    } catch {
      setCheckoutError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen surface-warm-gradient pb-28">
      <header className="sticky top-0 z-40 glass-bar border-b border-border-whisper px-4 py-3 shadow-xs">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" aria-label="TinyPlan home">
            <BrandLogo width={130} priority />
          </Link>
          <span className="text-xs font-medium text-secondary bg-secondary-light px-3 py-1 rounded-full">
            Plan ready
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Plan ready hero illustration */}
        <div className="mb-6 animate-fade-up">
          <Image
            src="/images/illustrations/tinyplan-plan-ready.png"
            alt="Your personalised play plan is ready to unlock"
            width={1448}
            height={1086}
            className="w-full max-w-sm mx-auto h-auto rounded-2xl"
            priority
          />
        </div>

        {/* Profile hero */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-light to-primary/10 flex items-center justify-center shadow-elevated">
              <ProfileIllustration profile={profile} className="w-16 h-16" />
            </div>
          </div>
          <p className="text-xs font-semibold text-primary uppercase tracking-[0.15em] mb-2.5">
            Your play profile
          </p>
          <h1 className="text-3xl font-bold mb-3">
            <span className="gradient-text-primary">{profileName}</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
            We built a 7-day parent toolkit from your answers &mdash; unlock it
            to see everything we prepared for you.
          </p>
        </div>

        {/* Personalization receipt */}
        <div className="hero-card p-5 mb-5 shadow-hero rounded-[1.25rem]">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Built from your answers
          </p>
          <div className="space-y-3.5">
            {mainPainText && (
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-secondary-light to-secondary/5 flex items-center justify-center shadow-xs">
                  <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">Main challenge</p>
                  <p className="font-semibold capitalize text-[15px]">{mainPainText}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-primary-light to-primary/5 flex items-center justify-center shadow-xs">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Your child&apos;s style</p>
                <p className="font-semibold text-[15px]">{profileName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-accent-light to-accent/5 flex items-center justify-center shadow-xs">
                <svg className="w-4 h-4 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Best moment &amp; time</p>
                <p className="font-semibold capitalize text-[15px]">{momentText} &middot; {timeText}</p>
              </div>
            </div>
            {supportTexts.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-secondary-light to-secondary/5 flex items-center justify-center shadow-xs">
                  <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">Support you need</p>
                  <p className="font-semibold capitalize text-[15px]">{supportTexts.join(", ")}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-primary-light to-primary/5 flex items-center justify-center shadow-xs">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Plan style</p>
                <p className="font-semibold capitalize text-[15px]">{planStyleText}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Value stack */}
        <div className="bg-gradient-to-br from-secondary-light to-secondary-light/60 border border-secondary/10 rounded-2xl p-5 mb-5">
          <div className="mb-4">
            <Image
              src="/images/illustrations/tinyplan-checklist-result.png"
              alt="Your personalised weekly checklist with daily activities and parent scripts"
              width={1448}
              height={1086}
              className="w-full max-w-xs mx-auto h-auto rounded-xl"
            />
          </div>
          <h2 className="text-sm font-bold mb-4">
            What we built from your answers
          </h2>
          <div className="space-y-3.5">
            {valueStack.map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <SpotIcon type={item.icon} className="w-8 h-8 shrink-0" />
                <p className="text-sm font-medium leading-relaxed pt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Routine preview */}
        <div className="bg-card border border-primary/12 rounded-2xl p-5 mb-5 shadow-elevated">
          <div className="flex items-center gap-2.5 mb-3">
            <SpotIcon type="routine" className="w-8 h-8" />
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Your personalised routine
              </p>
              <p className="text-sm font-semibold">{routine.title}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3.5">{routine.whenToUse}</p>
          <ol className="space-y-2">
            {routine.steps.map((step: string, i: number) => (
              <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                <span className="shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5 shadow-xs">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Weekly plan preview */}
        <div className="bg-card border border-border-whisper rounded-2xl p-5 mb-5 shadow-card">
          <div className="flex items-center gap-2.5 mb-4">
            <SpotIcon type="week" className="w-8 h-8" />
            <h2 className="text-sm font-bold">This week&apos;s focus</h2>
          </div>
          <div className="space-y-2.5">
            {planPreview.map((item) => (
              <div key={item.days} className="flex items-center gap-3 text-sm">
                <span className="font-semibold text-foreground w-20 flex-shrink-0">{item.days}</span>
                <span className="text-muted-foreground">{item.focus}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Locked full plan */}
        <div className="relative mb-8 rounded-2xl overflow-hidden">
          <div className="opacity-40 blur-[4px] select-none pointer-events-none bg-card border border-border-whisper rounded-2xl p-5 space-y-3">
            <p className="font-semibold text-sm">Your 7-day parent toolkit</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground w-14">Day 1</span>
                <span>Toolkit · Play moment · Parent skill · Script</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground w-14">Day 2</span>
                <span>Toolkit · Routine guide · Refusal script</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground w-14">Day 3–7</span>
                <span>+ SOS coach · Adaptive insights · Progress check-ins</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-center justify-center">
            <div className="bg-card/95 backdrop-blur-sm border border-border-whisper rounded-2xl px-7 py-4 shadow-elevated flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-bold block">Unlock your toolkit</span>
                <span className="text-[11px] text-muted-foreground">7-day personalised parent plan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main CTA */}
        {checkoutError && (
          <p className="text-center text-sm text-destructive mb-3">{checkoutError}</p>
        )}

        <div className="rounded-[1.25rem] bg-gradient-to-br from-primary/10 via-primary-light/40 to-transparent p-[2px]">
          <Button
            size="lg"
            className="w-full text-lg rounded-[1.15rem]"
            onClick={handleCheckout}
            loading={loading}
          >
            Start my 7-day plan &mdash; $1
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-3.5 mb-6">
          Then $14.99/month. Cancel anytime. No commitment.
        </p>

        {hardMomentText && (
          <p className="text-center text-xs text-muted-foreground">
            Includes SOS help for: {hardMomentText}
          </p>
        )}
      </main>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass-bar border-t border-border-whisper px-4 py-3 shadow-sticky">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">Your plan is ready</p>
            <p className="text-xs text-muted-foreground">Then $14.99/mo. Cancel anytime.</p>
          </div>
          <Button
            onClick={handleCheckout}
            loading={loading}
            className="shrink-0 px-6"
          >
            Start for $1
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading results...</div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
