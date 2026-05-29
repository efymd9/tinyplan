"use client";

import { useLocale } from "@/components/i18n/locale-provider";

interface InsightCardProps {
  label?: string;
  confidence?: "early" | "pattern" | "strong";
  title?: string;
  children: React.ReactNode;
  accent?: "primary" | "secondary" | "accent" | "muted";
  className?: string;
}

const CONFIDENCE_BADGE: Record<
  "early" | "pattern" | "strong",
  { className: string }
> = {
  early: { className: "bg-muted text-muted-foreground" },
  pattern: { className: "bg-accent-light text-accent-dark" },
  strong: { className: "bg-secondary-light text-secondary" },
};

const CONFIDENCE_TEXT: Record<"es" | "en", Record<"early" | "pattern" | "strong", string>> = {
  es: {
    early: "Señal temprana",
    pattern: "Patrón",
    strong: "Patrón claro",
  },
  en: {
    early: "Early signal",
    pattern: "Pattern",
    strong: "Strong pattern",
  },
};

const ACCENT_BG: Record<string, string> = {
  primary: "bg-gradient-to-br from-primary-light/60 to-primary-light/30",
  secondary: "bg-gradient-to-br from-secondary-light/60 to-secondary-light/30",
  accent: "bg-gradient-to-br from-accent-light/60 to-accent-light/30",
  muted: "bg-gradient-to-br from-muted/60 to-muted/30",
};

export function InsightCard({
  label,
  confidence,
  title,
  children,
  accent = "muted",
  className = "",
}: InsightCardProps) {
  const locale = useLocale();
  return (
    <div className={`${ACCENT_BG[accent]} rounded-xl p-4 ${className}`}>
      {(label || confidence) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <p className={`text-xs font-semibold uppercase tracking-wider ${
              accent === "primary" ? "text-primary" :
              accent === "secondary" ? "text-secondary" :
              accent === "accent" ? "text-accent-dark" :
              "text-foreground"
            }`}>
              {label}
            </p>
          )}
          {confidence && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ml-auto ${CONFIDENCE_BADGE[confidence].className}`}>
              {CONFIDENCE_TEXT[locale][confidence]}
            </span>
          )}
        </div>
      )}
      {title && <p className="text-sm font-medium mb-1">{title}</p>}
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}
