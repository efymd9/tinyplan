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
  { text: string; className: string }
> = {
  early: { text: "Early signal", className: "bg-muted text-muted-foreground" },
  pattern: { text: "Pattern", className: "bg-accent-light text-accent-dark" },
  strong: { text: "Strong pattern", className: "bg-secondary-light text-secondary" },
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
              {CONFIDENCE_BADGE[confidence].text}
            </span>
          )}
        </div>
      )}
      {title && <p className="text-sm font-medium mb-1">{title}</p>}
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}
