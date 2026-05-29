"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FeedbackStatus = "done" | "too_hard" | "child_refused" | "skipped" | "loved_it";

const feedbackOptions: { status: FeedbackStatus; label: string }[] = [
  { status: "done", label: "Felt right" },
  { status: "too_hard", label: "Too hard" },
  { status: "child_refused", label: "Child refused" },
  { status: "skipped", label: "We skipped" },
  { status: "loved_it", label: "Loved it" },
];

export function ActivityActions({
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
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(currentStatus ?? null);

  async function logStatus(newStatus: FeedbackStatus) {
    setSaving(true);
    try {
      const mappedStatus =
        newStatus === "loved_it" ? "done" :
        newStatus === "child_refused" ? "skipped" :
        newStatus;
      const res = await fetch("/api/dashboard/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, dayNumber, activityId, status: mappedStatus }),
      });
      if (res.ok) {
        setStatus(mappedStatus);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  if (status && status !== "pending") {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="w-8 h-8 rounded-full bg-secondary shadow-xs flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">Noted. Tomorrow will adjust.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold text-center mb-1">How did today go?</p>
      <p className="text-xs text-muted-foreground text-center mb-3">Your answer shapes tomorrow.</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {feedbackOptions.map((opt) => (
          <button
            key={opt.status}
            onClick={() => logStatus(opt.status)}
            disabled={saving}
            className={`text-sm px-4 py-2.5 rounded-full font-medium disabled:opacity-50 min-h-[44px] transition-all ${
              opt.status === "done" || opt.status === "loved_it"
                ? "bg-primary text-white hover:bg-primary-hover shadow-button active:scale-[0.97]"
                : "border border-border-whisper bg-card hover:bg-muted shadow-xs hover:shadow-card active:scale-[0.97]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
