type InsightLevel = "early" | "pattern" | "strong";

const LEVEL_CONFIG: Record<InsightLevel, { label: string; bg: string; dot: string }> = {
  early: {
    label: "Early signal",
    bg: "bg-accent-light border-accent/20",
    dot: "bg-accent",
  },
  pattern: {
    label: "Pattern",
    bg: "bg-secondary-light border-secondary/20",
    dot: "bg-secondary",
  },
  strong: {
    label: "Strong pattern",
    bg: "bg-primary-light border-primary/20",
    dot: "bg-primary",
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
  const cfg = LEVEL_CONFIG[level];
  return (
    <div className={`rounded-2xl border px-4 py-3 ${cfg.bg}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {cfg.label}
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
