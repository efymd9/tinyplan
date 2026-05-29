"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/locale-provider";

type FeedbackStatus = "done" | "too_hard" | "child_refused" | "skipped" | "loved_it";

const COPY = {
  es: {
    feedback: {
      done: "Salió bien",
      too_hard: "Muy difícil",
      child_refused: "Se negó",
      skipped: "Lo saltamos",
      loved_it: "Le encantó",
    },
    noted: "Anotado. Mañana se ajustará.",
    howWasToday: "¿Cómo te fue hoy?",
    shapesTomorrow: "Tu respuesta moldea el día de mañana.",
  },
  en: {
    feedback: {
      done: "Felt right",
      too_hard: "Too hard",
      child_refused: "Child refused",
      skipped: "We skipped",
      loved_it: "Loved it",
    },
    noted: "Noted. Tomorrow will adjust.",
    howWasToday: "How did today go?",
    shapesTomorrow: "Your answer shapes tomorrow.",
  },
} as const;

const feedbackOrder: FeedbackStatus[] = [
  "done",
  "too_hard",
  "child_refused",
  "skipped",
  "loved_it",
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
  const locale = useLocale();
  const copy = COPY[locale];
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
          <p className="text-sm font-semibold">{copy.noted}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold text-center mb-1">{copy.howWasToday}</p>
      <p className="text-xs text-muted-foreground text-center mb-3">{copy.shapesTomorrow}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {feedbackOrder.map((optStatus) => (
          <button
            key={optStatus}
            onClick={() => logStatus(optStatus)}
            disabled={saving}
            className={`text-sm px-4 py-2.5 rounded-full font-medium disabled:opacity-50 min-h-[44px] transition-all ${
              optStatus === "done" || optStatus === "loved_it"
                ? "bg-primary text-white hover:bg-primary-hover shadow-button active:scale-[0.97]"
                : "border border-border-whisper bg-card hover:bg-muted shadow-xs hover:shadow-card active:scale-[0.97]"
            }`}
          >
            {copy.feedback[optStatus]}
          </button>
        ))}
      </div>
    </div>
  );
}
