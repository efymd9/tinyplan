"use client";

import { useEffect, useState, useMemo, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { useLocale } from "@/components/i18n/locale-provider";
import { localizeHref } from "@/lib/i18n/href";

const RESULT_STORAGE_KEY = "tinyplan_quiz_result";

function SuccessContent() {
  const { track } = useAnalytics();
  const router = useRouter();
  const locale = useLocale();

  const parsedAnswers = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.answers as Record<string, unknown>;
    } catch {
      return null;
    }
  }, []);

  const [error, setError] = useState("");
  const generatingRef = useRef(false);

  useEffect(() => {
    track({ event: "purchase_completed", properties: { amount: 100 } });

    if (!parsedAnswers) {
      router.replace(localizeHref("/dashboard/reveal", locale));
      return;
    }

    if (generatingRef.current) return;
    generatingRef.current = true;

    fetch("/api/plan/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: parsedAnswers }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Plan generation failed");
        return res.json();
      })
      .then(() => {
        sessionStorage.removeItem(RESULT_STORAGE_KEY);
        router.replace(localizeHref("/dashboard/reveal", locale));
      })
      .catch((err) => {
        console.error("Plan generation error:", err);
        setError("Failed to generate your plan. Please try again.");
        generatingRef.current = false;
      });
  }, [track, parsedAnswers, router, locale]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-destructive/10 to-destructive/5 shadow-elevated flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-destructive">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href={localizeHref("/quiz", locale)}>
            <Button size="lg" className="w-full">Retake Quiz</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-8 relative">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Building your plan...</h1>
        <p className="text-muted-foreground">
          Setting up your personalized 7-day activity plan.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
