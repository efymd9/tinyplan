"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
}: {
  settingUpLabel: string;
  quizHref: string;
}) {
  const router = useRouter();
  // Resolve "is there a pending plan?" once, lazily, on first client render.
  // On the server (and the first hydration pass) readPendingId() returns null,
  // so we default to the spinner and let the effect issue the quiz redirect if
  // nothing is actually pending — never a synchronous setState in the effect.
  const [hasPending] = useState<boolean>(() => readPendingId() !== null);

  useEffect(() => {
    if (hasPending) {
      // The layout-mounted reclaimer performs the POST + router.refresh(); we
      // just wait for that refresh to bring the adopted plan into view.
      return;
    }
    // No pending plan to set up — send them to the quiz.
    router.replace(quizHref);
  }, [router, quizHref, hasPending]);

  // While a reclaim is in flight (pending id present), show a spinner rather
  // than flashing the quiz redirect. When nothing is pending the effect above
  // redirects; render nothing in that frame.
  if (!hasPending) return null;

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
