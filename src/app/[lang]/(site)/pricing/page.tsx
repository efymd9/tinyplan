"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";
import { buildTagProfile, getProfileDisplayName, getGoalDisplayText } from "@/lib/quiz/tags";
import { useAnalytics } from "@/lib/analytics/use-analytics";

const RESULT_STORAGE_KEY = "tinyplan_quiz_result";

function PricingContent() {
  const router = useRouter();
  const { track } = useAnalytics();
  const [loading, setLoading] = useState(false);

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
        event: "paywall_viewed",
        properties: {
          profile: data.tagProfile.play_profile,
          goal: data.tagProfile.primary_goal,
        },
      });
    }
  }, [track, data]);

  const handleCheckout = async () => {
    setLoading(true);
    track({ event: "checkout_started" });

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data?.email || "",
          answers: data?.answers ? JSON.stringify(data.answers) : "",
        }),
      });
      const result = await res.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        router.push("/checkout/success?session_id=mock");
      }
    } catch {
      router.push("/checkout/success?session_id=mock");
    }
  };

  const tagProfile = data?.tagProfile;
  const goalText = tagProfile ? getGoalDisplayText(tagProfile.primary_goal) : "Your personalized plan";
  const profileName = tagProfile ? getProfileDisplayName(tagProfile.play_profile) : "";

  const valueProps = [
    "7 daily parent toolkits — one play moment + one skill each day",
    "Parent skill lessons with exact words to say",
    "SOS coach — 8 reset scripts for bedtime, screens, and meltdowns",
    "Daily routines with step-by-step guidance",
    "Adaptive insights — your plan evolves each week",
    "Activity library access",
    "Progress check-ins",
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border-whisper shadow-xs px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" aria-label="TinyPlan home">
            <BrandLogo width={130} />
          </Link>
          <Link
            href="/result"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to results
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="mb-5">
            <Image
              src="/images/illustrations/tinyplan-plan-ready.png"
              alt="Your personalised play plan is ready to unlock"
              width={1448}
              height={1086}
              className="w-full max-w-xs mx-auto h-auto rounded-2xl"
            />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            Unlock your personalized
            <br />
            7-day parent toolkit
          </h1>
          <p className="text-muted-foreground">
            Daily toolkits, parent skill lessons, SOS coach, and routines &mdash;
            all built from your quiz answers.
          </p>
        </div>

        {tagProfile && (
          <div className="bg-gradient-to-r from-primary-light to-primary-light/50 rounded-2xl p-4 mb-6 text-center shadow-xs border border-primary/10">
            <p className="text-sm text-primary font-semibold">
              {profileName} · {goalText}
            </p>
          </div>
        )}

        <Card className="mb-6 shadow-card">
          <p className="font-semibold mb-3">Your plan includes:</p>
          <ul className="space-y-2.5">
            {valueProps.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-success flex-shrink-0 mt-0.5"
                >
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="mb-6 border-primary/30 border-[1.5px] shadow-hero">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Start with 7-day access
            </p>
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-4xl font-bold gradient-text-primary">$1</span>
              <span className="text-muted-foreground">for 7 days</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Then $14.99/month · Cancel anytime
            </p>
          </div>
        </Card>

        <Button
          size="lg"
          className="w-full text-lg mb-4"
          onClick={handleCheckout}
          loading={loading}
        >
          Start for $1
        </Button>

        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            $1 for 7 days, then $14.99/month. Cancel anytime.
          </p>
          <p className="text-xs text-muted-foreground">
            No extra screen time for your child — just simple activities for real life.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link href="/privacy" className="text-xs text-muted-foreground underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground underline">
              Terms
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
