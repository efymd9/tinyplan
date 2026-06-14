"use client";

import { useEffect, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import { localizeHref } from "@/lib/i18n/href";

const RESULT_STORAGE_KEY = "tinyplan_quiz_result";
const PENDING_PLAN_KEY = "tinyplan_pending_plan_id";

const COPY = {
  es: {
    buildingTitle: "Creando tu plan...",
    buildingSubtitle: "Estamos preparando tu cuenta para mostrar tu plan.",
  },
  en: {
    buildingTitle: "Building your plan...",
    buildingSubtitle: "Setting up your account so you can see your plan.",
  },
} as const;

function SuccessContent() {
  const router = useRouter();
  const locale = useLocale();
  const copy = COPY[locale];
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;

    // Plan generation now happens server-side from the paid Stripe checkout's
    // persisted quiz session. Clear the old browser-only handoff keys so a paid
    // buyer's access does not depend on this tab, this device, or localStorage.
    try {
      sessionStorage.removeItem(RESULT_STORAGE_KEY);
      localStorage.removeItem(PENDING_PLAN_KEY);
    } catch {
      // Storage may be unavailable in private mode; server-side checkout state
      // is still the source of truth.
    }

    router.replace(localizeHref("/dashboard/reveal", locale));
  }, [router, locale]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-8 relative">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{copy.buildingTitle}</h1>
        <p className="text-muted-foreground">
          {copy.buildingSubtitle}
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  const t = useT();
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">{t.common.loading}</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
