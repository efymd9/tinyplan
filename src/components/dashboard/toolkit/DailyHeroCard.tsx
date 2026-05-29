import type { ParentSkill } from "@/data/parent-growth-path";

const ACCENT_CLASSES: Record<string, { bg: string; text: string; badge: string }> = {
  play: {
    bg: "from-primary-light to-white",
    text: "text-primary",
    badge: "bg-primary/10 text-primary",
  },
  skill: {
    bg: "from-lavender-light to-white",
    text: "text-lavender",
    badge: "bg-lavender/10 text-lavender",
  },
  sage: {
    bg: "from-secondary-light to-white",
    text: "text-secondary",
    badge: "bg-secondary/10 text-secondary",
  },
  yellow: {
    bg: "from-accent-light to-white",
    text: "text-accent-dark",
    badge: "bg-accent/10 text-accent-dark",
  },
  lavender: {
    bg: "from-lavender-light to-white",
    text: "text-lavender",
    badge: "bg-lavender/10 text-lavender",
  },
};

interface DailyHeroCardProps {
  skill: ParentSkill;
  totalDays?: number;
  /** Personalisation hint derived from quiz answers */
  whyThisFits?: string;
  /** Override the default "what's included" chip labels */
  chips?: string[];
}

const DEFAULT_CHIPS = ["1 play moment", "1 parent lesson", "3+ scripts", "1 backup", "check-in"];

export function DailyHeroCard({
  skill,
  totalDays = 7,
  whyThisFits,
  chips,
}: DailyHeroCardProps) {
  const ac = ACCENT_CLASSES[skill.accent] ?? ACCENT_CLASSES.play;

  return (
    <div className={`hero-card bg-gradient-to-b ${ac.bg} p-6 animate-fade-up`}>
      {/* Day pill */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${ac.badge}`}
        >
          <DayIcon />
          Day {skill.dayNumber} of {totalDays}
        </span>
        <span className="text-xs text-muted-foreground font-medium">
          Parent skill
        </span>
      </div>

      {/* Title */}
      <h2 className={`text-2xl font-bold tracking-tight mb-1 ${ac.text}`}>
        {skill.title}
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {skill.whatYouPractice}
      </p>

      {/* Personalisation hint */}
      {whyThisFits && (
        <div className="flex items-start gap-2 rounded-xl bg-muted/60 px-3 py-2 mb-4">
          <SparkleIcon className="mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {whyThisFits}
          </p>
        </div>
      )}

      {/* What's included */}
      <div className="flex flex-wrap gap-2 mt-2">
        {(chips ?? DEFAULT_CHIPS).map((item) => (
          <span
            key={item}
            className="text-xs bg-white/70 border border-border-whisper rounded-full px-3 py-0.5 text-foreground/70 font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function DayIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 3v3l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SparkleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M7 1l1.5 3.5L12 6l-3.5 1.5L7 11l-1.5-3.5L2 6l3.5-1.5L7 1z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
