"use client";

import { useLocale } from "@/components/i18n/locale-provider";

type InsightLevel = "early" | "pattern" | "strong";

const LEVEL_CONFIG: Record<InsightLevel, { bg: string; dot: string }> = {
  early: {
    bg: "bg-accent-light border-accent/20",
    dot: "bg-accent",
  },
  pattern: {
    bg: "bg-secondary-light border-secondary/20",
    dot: "bg-secondary",
  },
  strong: {
    bg: "bg-primary-light border-primary/20",
    dot: "bg-primary",
  },
};

const LEVEL_LABELS: Record<"es" | "en", Record<InsightLevel, string>> = {
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

interface InsightCardProps {
  title: string;
  body: string;
  level?: InsightLevel;
  action?: string;
  onAction?: () => void;
}

export function InsightCard({
  title,
  body,
  level = "early",
  action,
  onAction,
}: InsightCardProps) {
  const locale = useLocale();
  const cfg = LEVEL_CONFIG[level];
  return (
    <div className={`rounded-2xl border px-4 py-3 ${cfg.bg}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {LEVEL_LABELS[locale][level]}
        </span>
      </div>
      <p className="text-sm font-semibold text-foreground mb-0.5">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 text-xs font-semibold text-primary underline underline-offset-2"
        >
          {action}
        </button>
      )}
    </div>
  );
}
