"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pendingGateAction } from "@/lib/dashboard/pending-gate";

const PENDING_PLAN_KEY = "tinyplan_pending_plan_id";

// Module-level latch: the reclaim POST must happen at most once per page load,
// even if React mounts the component twice (Strict Mode) or it appears more
// than once in the tree. Lives outside the component so it survives remounts.
let reclaimStarted = false;

function readPendingId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(PENDING_PLAN_KEY);
  } catch {
    return null;
  }
}

function clearPendingId() {
  try {
    window.localStorage.removeItem(PENDING_PLAN_KEY);
  } catch {
    // ignore — nothing more we can do
  }
}

/**
 * Mounted once in the dashboard layout. On mount, if the browser holds a
 * pending (anonymous) plan id, it POSTs /api/plan/reclaim to adopt it for the
 * now-signed-in user, then clears the key and refreshes so server components
 * re-read the freshly-attached plan.
 *
 * On any outcome (success OR failure) the key is removed to avoid retry loops —
 * a failed reclaim (expired / already claimed) is not worth retrying, and the
 * reveal page's no-plan handling will route the user appropriately.
 */
export default function PlanReclaimer() {
  const router = useRouter();

  useEffect(() => {
    if (reclaimStarted) return;
    const planId = readPendingId();
    if (!planId) return;

    reclaimStarted = true;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/plan/reclaim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
        });
        clearPendingId();
        if (!cancelled && res.ok) {
          router.refresh();
        }
      } catch {
        // Network error — drop the key anyway so we don't loop on every render.
        clearPendingId();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}

/**
 * Companion used by the reveal page when the user has no active plan yet.
 *
 * A just-checked-out user reaches reveal before the layout-mounted
 * <PlanReclaimer> has finished its POST + refresh. So instead of bouncing them
 * straight to the quiz, we check for a pending plan id:
 *   - present  → show a brief "setting up your plan…" spinner and wait for the
 *     reclaimer's router.refresh() to re-render reveal with the adopted plan.
 *   - absent   → there is genuinely nothing to set up; send them to the quiz.
 *
 * i18n: the visible spinner text and the quiz destination are passed in as
 * props (the caller owns the locale + any dictionary strings).
 */
export function PendingPlanGate({
  settingUpLabel,
  quizHref,
  waitForServerPlan = false,
  timedOutLabel,
  retryLabel,
}: {
  settingUpLabel: string;
  quizHref: string;
  waitForServerPlan?: boolean;
  /** Shown when the server-side plan never appears within the poll budget. */
  timedOutLabel?: string;
  /** Label for the manual retry control in the timed-out state. */
  retryLabel?: string;
}) {
  const router = useRouter();
  // Resolve "is there a pending plan?" once, lazily, on first client render.
  // On the server (and the first hydration pass) readPendingId() returns null,
  // so we default to the spinner and let the effect issue the quiz redirect if
  // nothing is actually pending — never a synchronous setState in the effect.
  const [hasPending] = useState<boolean>(() => readPendingId() !== null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const action = pendingGateAction({ hasPending, waitForServerPlan, attempts: 0 });
    // The layout-mounted reclaimer performs the POST + router.refresh(); we just
    // wait for that refresh to bring the adopted plan into view.
    if (action === "wait-reclaim") return;
    // No pending plan to set up — send them to the quiz.
    if (action === "redirect-quiz") {
      router.replace(quizHref);
      return;
    }
    // action === "poll": paid checkout plans are generated server-side from the
    // Stripe webhook. If the user reaches reveal while the webhook is still in
    // flight, refresh briefly — but BOUND it so a paid customer whose plan never
    // materializes lands on a recovery state instead of an infinite spinner.
    let attempts = 0;
    const id = window.setInterval(() => {
      attempts += 1;
      if (pendingGateAction({ hasPending, waitForServerPlan, attempts }) === "timeout") {
        window.clearInterval(id);
        setTimedOut(true);
        return;
      }
      router.refresh();
    }, 2500);
    return () => window.clearInterval(id);
  }, [router, quizHref, hasPending, waitForServerPlan]);

  // When nothing is pending and the user is not paid, the effect above
  // redirects; render nothing in that frame.
  if (!hasPending && !waitForServerPlan) return null;

  if (timedOut) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-sm text-muted-foreground mb-4">
            {timedOutLabel ?? settingUpLabel}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-primary hover:underline"
          >
            {retryLabel ?? "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-5 relative">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">{settingUpLabel}</p>
      </div>
    </div>
  );
}
