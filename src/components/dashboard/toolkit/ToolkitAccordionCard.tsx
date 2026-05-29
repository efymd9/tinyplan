"use client";

import { useState } from "react";

export type AccordionAccent = "play" | "skill" | "sage" | "yellow" | "lavender" | "sos" | "neutral";

const ACCENT: Record<AccordionAccent, string> = {
  play: "tk-accent-play",
  skill: "tk-accent-skill",
  sage: "tk-accent-sage",
  yellow: "tk-accent-yellow",
  sos: "tk-accent-sos",
  lavender: "tk-accent-skill",
  neutral: "tk-accent-neutral",
};

interface ToolkitAccordionCardProps {
  label: string;
  title: string;
  summary: string;
  accent?: AccordionAccent;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function ToolkitAccordionCard({
  label,
  title,
  summary,
  accent = "neutral",
  icon,
  defaultOpen = false,
  children,
}: ToolkitAccordionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="toolkit-card">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3 p-5 text-left"
      >
        {/* Icon badge */}
        <span
          className={`mt-0.5 shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${ACCENT[accent]}`}
        >
          {icon ?? <DefaultDotIcon />}
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
            {label}
          </p>
          <p className="font-semibold text-foreground leading-snug">{title}</p>
          {!open && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">
              {summary}
            </p>
          )}
        </div>

        {/* Chevron */}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="toolkit-body px-5 pb-5 border-t border-border-whisper animate-fade-up">
          {children}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 mt-1 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M4.5 6.75 9 11.25l4.5-4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DefaultDotIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
      <circle cx="4" cy="4" r="4" />
    </svg>
  );
}
