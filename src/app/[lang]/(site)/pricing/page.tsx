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
import { useLocale, useT } from "@/components/i18n/locale-provider";
import { localizeHref } from "@/lib/i18n/href";

const RESULT_STORAGE_KEY = "tinyplan_quiz_result";

const COPY = {
  es: {
    brandHome: "Inicio de TinyPlan",
    planReadyAlt: "Tu plan de juego personalizado está listo para desbloquear",
    backToResults: "Volver a los resultados",
    headlineLine1: "Desbloquea tu kit de herramientas",
    headlineLine2: "para padres de 7 días",
    subheadline:
      "Kits diarios, lecciones para padres, coach SOS y rutinas, todo creado a partir de tus respuestas del test.",
    fallbackGoal: "Tu plan personalizado",
    planIncludes: "Tu plan incluye:",
    valueProps: [
      "7 kits diarios para padres: un momento de juego y una habilidad cada día",
      "Lecciones de habilidades para padres con las palabras exactas que decir",
      "Coach SOS: 8 guiones de calma para la hora de dormir, las pantallas y las rabietas",
      "Rutinas diarias con guía paso a paso",
      "Ideas que se adaptan: tu plan evoluciona cada semana",
      "Acceso a la biblioteca de actividades",
      "Seguimiento de tu progreso",
    ],
    startWith: "Empieza con acceso de 7 días",
    forDays: "por 7 días",
    thenMonth: "Luego $14.99/mes · Cancela cuando quieras",
    cta: "Empieza por $1",
    finePrice: "$1 por 7 días, luego $14.99/mes. Cancela cuando quieras.",
    fineScreen:
      "Sin más tiempo de pantalla para tu peque, solo actividades simples para la vida real.",
    privacy: "Política de privacidad",
    terms: "Términos",
  },
  en: {
    brandHome: "TinyPlan home",
    planReadyAlt: "Your personalised play plan is ready to unlock",
    backToResults: "Back to results",
    headlineLine1: "Unlock your personalized",
    headlineLine2: "7-day parent toolkit",
    subheadline:
      "Daily toolkits, parent skill lessons, SOS coach, and routines — all built from your quiz answers.",
    fallbackGoal: "Your personalized plan",
    planIncludes: "Your plan includes:",
    valueProps: [
      "7 daily parent toolkits — one play moment + one skill each day",
      "Parent skill lessons with exact words to say",
      "SOS coach — 8 reset scripts for bedtime, screens, and meltdowns",
      "Daily routines with step-by-step guidance",
      "Adaptive insights — your plan evolves each week",
      "Activity library access",
      "Progress check-ins",
    ],
    startWith: "Start with 7-day access",
    forDays: "for 7 days",
    thenMonth: "Then $14.99/month · Cancel anytime",
    cta: "Start for $1",
    finePrice: "$1 for 7 days, then $14.99/month. Cancel anytime.",
    fineScreen:
      "No extra screen time for your child — just simple activities for real life.",
    privacy: "Privacy Policy",
    terms: "Terms",
  },
} as const;

function PricingContent() {
  const router = useRouter();
  const locale = useLocale();
  const c = COPY[locale];
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
        router.push(localizeHref("/checkout/success", locale) + "?session_id=mock");
      }
    } catch {
      router.push(localizeHref("/checkout/success", locale) + "?session_id=mock");
    }
  };

  const tagProfile = data?.tagProfile;
  const goalText = tagProfile
    ? getGoalDisplayText(tagProfile.primary_goal, locale)
    : c.fallbackGoal;
  const profileName = tagProfile
    ? getProfileDisplayName(tagProfile.play_profile, locale)
    : "";

  const valueProps = c.valueProps;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border-whisper shadow-xs px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href={localizeHref("/", locale)} aria-label={c.brandHome}>
            <BrandLogo width={130} />
          </Link>
          <Link
            href={localizeHref("/result", locale)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {c.backToResults}
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="mb-5">
            <Image
              src="/images/illustrations/tinyplan-plan-ready.png"
              alt={c.planReadyAlt}
              width={1448}
              height={1086}
              className="w-full max-w-xs mx-auto h-auto rounded-2xl"
            />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {c.headlineLine1}
            <br />
            {c.headlineLine2}
          </h1>
          <p className="text-muted-foreground">{c.subheadline}</p>
        </div>

        {tagProfile && (
          <div className="bg-gradient-to-r from-primary-light to-primary-light/50 rounded-2xl p-4 mb-6 text-center shadow-xs border border-primary/10">
            <p className="text-sm text-primary font-semibold">
              {profileName} · {goalText}
            </p>
          </div>
        )}

        <Card className="mb-6 shadow-card">
          <p className="font-semibold mb-3">{c.planIncludes}</p>
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
            <p className="text-sm text-muted-foreground mb-1">{c.startWith}</p>
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-4xl font-bold gradient-text-primary">$1</span>
              <span className="text-muted-foreground">{c.forDays}</span>
            </div>
            <p className="text-sm text-muted-foreground">{c.thenMonth}</p>
          </div>
        </Card>

        <Button
          size="lg"
          className="w-full text-lg mb-4"
          onClick={handleCheckout}
          loading={loading}
        >
          {c.cta}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">{c.finePrice}</p>
          <p className="text-xs text-muted-foreground">{c.fineScreen}</p>
          <div className="flex justify-center gap-4 pt-2">
            <Link href={localizeHref("/privacy", locale)} className="text-xs text-muted-foreground underline">
              {c.privacy}
            </Link>
            <Link href={localizeHref("/terms", locale)} className="text-xs text-muted-foreground underline">
              {c.terms}
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
          <SuspenseFallback />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}

function SuspenseFallback() {
  const t = useT();
  return <div className="animate-pulse text-muted-foreground">{t.common.loading}</div>;
}
