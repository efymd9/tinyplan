import type { ParentSkill } from "@/data/parent-growth-path";

interface SkillLessonContentProps {
  skill: ParentSkill;
}

export function SkillLessonContent({ skill }: SkillLessonContentProps) {
  return (
    <div className="space-y-5 pt-4">
      {/* When to use */}
      <Section label="When to use it" icon={<ClockIcon />} tint="tk-tint-skill">
        <p className="text-sm leading-relaxed text-foreground">{skill.whenToUse}</p>
      </Section>

      {/* What parent practices */}
      <Section label="What you practice" icon={<StarIcon />} tint="tk-tint-sage">
        <p className="text-sm leading-relaxed text-foreground">{skill.whatYouPractice}</p>
      </Section>

      {/* 3-step move */}
      <Section label="3-step move" icon={<StepsIcon />} tint="tk-tint-yellow">
        <ol className="space-y-2">
          {skill.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-accent-dark/10 text-accent-dark text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* Scripts */}
      <Section label="Say it like this" icon={<SpeechIcon />} tint="tk-tint-skill">
        <ul className="space-y-2">
          {skill.scripts.map((script, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-xl bg-lavender/5 border border-lavender/10 px-3 py-2"
            >
              <QuoteIcon className="shrink-0 mt-0.5 text-lavender" />
              <span className="text-sm italic text-foreground leading-relaxed">
                &ldquo;{script}&rdquo;
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Examples */}
      <Section label="Real examples" icon={<ExamplesIcon />} tint="tk-tint-sage">
        <ul className="space-y-2">
          {skill.examples.map((ex, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-secondary mt-2" />
              {ex}
            </li>
          ))}
        </ul>
      </Section>

      {/* Avoid */}
      <Section label="Avoid this" icon={<AvoidIcon />} tint="">
        <div className="flex items-start gap-2 rounded-xl bg-destructive/5 border border-destructive/10 px-3 py-2">
          <span className="text-destructive text-xs font-bold mt-0.5">✕</span>
          <p className="text-sm text-foreground leading-relaxed">{skill.avoid}</p>
        </div>
      </Section>

      {/* Tiny win */}
      <Section label="Tiny win" icon={<WinIcon />} tint="tk-tint-yellow">
        <div className="flex items-start gap-2">
          <span className="text-accent-dark text-base">★</span>
          <p className="text-sm text-foreground leading-relaxed">{skill.tinyWin}</p>
        </div>
      </Section>
    </div>
  );
}

function Section({
  label,
  icon,
  tint,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </h4>
      </div>
      <div className={tint ? `rounded-xl p-3 ${tint}` : ""}>{children}</div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 4v3l2 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1l1.4 3.2L12 5l-2.9 2.6.8 3.9L7 9.5l-2.9 2 .8-3.9L2 5l3.6-.8L7 1z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="10" width="4" height="3" rx="0.8" fill="currentColor" />
      <rect x="5" y="6" width="4" height="7" rx="0.8" fill="currentColor" opacity="0.7" />
      <rect x="9" y="2" width="4" height="11" rx="0.8" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function SpeechIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2 2h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5l-3 2V3a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QuoteIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M1 1h4v5H3a2 2 0 0 1-2-2V1zm6 0h4v5H9a2 2 0 0 1-2-2V1z" />
    </svg>
  );
}

function ExamplesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="3" cy="3" r="1.5" fill="currentColor" />
      <circle cx="3" cy="7" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="3" cy="11" r="1.5" fill="currentColor" opacity="0.5" />
      <rect x="6" y="2" width="7" height="2" rx="1" fill="currentColor" />
      <rect x="6" y="6" width="7" height="2" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="6" y="10" width="7" height="2" rx="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function AvoidIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.5 10.5 10.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function WinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1l1.5 3.3 3.5.5-2.5 2.4.6 3.5L7 9 3.9 10.7l.6-3.5L2 4.8l3.5-.5L7 1z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}
