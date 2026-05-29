"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { localizeHref } from "@/lib/i18n/href";

const COPY = {
  es: { buildPlan: "Crear mi plan gratis" },
  en: { buildPlan: "Build my free plan" },
} as const;

export function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  const locale = useLocale();
  const copy = COPY[locale];

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-50 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] glass-bar shadow-sticky border-t border-border-whisper transition-all duration-300 ${
        show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <Link
        href={localizeHref("/quiz", locale)}
        className="flex h-[52px] w-full items-center justify-center rounded-full bg-primary text-[17px] font-semibold text-white cta-glow active:scale-[0.98]"
      >
        {copy.buildPlan}
      </Link>
    </div>
  );
}
