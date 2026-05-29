"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Two positive buttons ("Felt right" and "Loved it") both store as "done" so they
// count as a meaningful moment everywhere; the negative/neutral ones keep their own
// status so the next day's toolkit can lean gentler. No schema change needed —
// these statuses are already accepted by /api/dashboard/log.
const CHOICES: { label: string; status: string; positive: boolean }[] = [
  { label: "Felt right", status: "done", positive: true },
  { label: "Too hard", status: "too_hard", positive: false },
  { label: "Child refused", status: "child_refused", positive: false },
  { label: "We skipped", status: "skipped", positive: false },
  { label: "Loved it", status: "done", positive: true },
];

export function TinyCheckin({
  planId,
  dayNumber,
  activityId,
  currentStatus,
}: {
  planId: string;
  dayNumber: number;
  activityId: string;
  currentStatus?: string | null;
}) {
  const router = useRouter();
  const alreadyLogged = Boolean(currentStatus && currentStatus !== "pending");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyLogged);
  const [open, setOpen] = useState(!alreadyLogged);

  async function submit(status: string) {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, dayNumber, activityId, status }),
      });
      if (res.ok) {
        setSubmitted(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="toolkit-card premium-card rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <span className="shrink-0 w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center shadow-xs">
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h3m-9 1.5V6.75A2.25 2.25 0 016.25 4.5h11.5A2.25 2.25 0 0120 6.75v6.5a2.25 2.25 0 01-2.25 2.25H9l-4.5 3.75z" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Tiny check-in
            </span>
            <span className="text-[10px] font-medium text-muted-foreground bg-muted/80 shadow-xs px-2 py-0.5 rounded-full">
              30 sec
            </span>
          </div>
          <p className="font-semibold leading-snug truncate">
            {submitted ? "Noted. Tomorrow will adjust." : "How did today feel?"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {submitted
              ? "Thanks — your answer quietly shapes tomorrow."
              : "Tap one. It quietly tunes tomorrow's toolkit."}
          </p>
        </div>
        <svg
          className="toolkit-chevron w-4 h-4 text-muted-foreground shrink-0"
          data-open={open ? "true" : "false"}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-border-whisper">
          {submitted ? (
            <div className="flex items-center gap-3 pt-4">
              <div className="w-9 h-9 rounded-full bg-secondary shadow-xs flex items-center justify-center shrink-0">
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-secondary">Noted. Tomorrow will adjust.</p>
                <p className="text-xs text-muted-foreground">One meaningful check-in today.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 pt-4">
                {CHOICES.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => submit(c.status)}
                    disabled={saving}
                    className={`text-sm px-4 py-2.5 rounded-full font-medium min-h-[44px] transition-all disabled:opacity-50 active:scale-[0.97] ${
                      c.positive
                        ? "bg-primary text-white hover:bg-primary-hover shadow-button"
                        : "border border-border-whisper bg-card hover:bg-muted shadow-xs hover:shadow-card"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                No wrong answer — even a skip helps us tune the next day.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
