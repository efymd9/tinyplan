"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pendingGateAction } from "@/lib/dashboard/pending-gate";

const PENDING_PLAN_KEY = "tinyplan_pending_plan_id";
const PENDING_SESSION_KEY = "tinyplan_pending_session_id";

// Module-level latch: the reclaim POST must happen at most once per page load,
// even if React mounts the component twice (Strict Mode) or it appears more
// than once in the tree. Lives outside the component so it survives remounts.
let reclaimStarted = false;

function readKey(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function clearKey(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore — nothing more we can do
  }
}

function readPendingId(): string | null {
  return readKey(PENDING_PLAN_KEY);
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
    const planId = readKey(PENDING_PLAN_KEY);
    const sessionId = readKey(PENDING_SESSION_KEY);
    if (!planId && !sessionId) return;

    reclaimStarted = true;

    let cancelled = false;
    (async () => {
      let changed = false;

      // 1) Bridge a paid ANONYMOUS checkout (by Stripe session id) onto this
      //    account, independent of whether the Stripe email matched the Clerk
      //    sign-up email. Retry briefly while the webhook is still granting the
      //    placeholder access (response { pending: true }).
      if (sessionId) {
        const MAX_ATTEMPTS = 8;
        for (let attempt = 0; attempt < MAX_ATTEMPTS && !cancelled; attempt++) {
          let retry = false;
          try {
            const res = await fetch("/api/checkout/adopt", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId }),
            });
            const data = res.ok ? await res.json().catch(() => null) : null;
            if (data?.adopted) changed = true;
            else if (data?.pending) retry = true;
          } catch {
            // Network error — stop retrying.
          }
          if (changed || !retry) break;
          await new Promise((r) => setTimeout(r, 2500));
        }
        clearKey(PENDING_SESSION_KEY);
      }

      // 2) Legacy funnel: adopt an anonymously-generated plan by id.
      if (planId) {
        try {
          const res = await fetch("/api/plan/reclaim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId }),
          });
          clearKey(PENDING_PLAN_KEY);
          if (res.ok) changed = true;
        } catch {
          // Network error — drop the key anyway so we don't loop on every render.
          clearKey(PENDING_PLAN_KEY);
        }
      }

      if (!cancelled && changed) {
        router.refresh();
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
  // A paid anonymous checkout being bridged by Stripe session id (see
  // PlanReclaimer). While present, the buyer must wait — not be bounced to the
  // quiz — even though their account may momentarily look free and plan-less.
  const [hasPendingSession] = useState<boolean>(() => readKey(PENDING_SESSION_KEY) !== null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const action = pendingGateAction({ hasPending, waitForServerPlan, hasPendingSession, attempts: 0 });
    // The layout-mounted reclaimer performs the POST + router.refresh(); we just
    // wait for that refresh to bring the adopted plan into view.
    if (action === "wait-reclaim") return;
    // No pending plan to set up — send them to the quiz.
    if (action === "redirect-quiz") {
      router.replace(quizHref);
      return;
    }
    // action === "poll": paid checkout plans are generated server-side from the
    // Stripe webhook (and bridged onto this account by the reclaimer). If the
    // user reaches reveal while that is still in flight, refresh briefly — but
    // BOUND it so a paid customer whose plan never materializes lands on a
    // recovery state instead of an infinite spinner.
    let attempts = 0;
    const id = window.setInterval(() => {
      attempts += 1;
      if (
        pendingGateAction({ hasPending, waitForServerPlan, hasPendingSession, attempts }) ===
        "timeout"
      ) {
        window.clearInterval(id);
        setTimedOut(true);
        return;
      }
      router.refresh();
    }, 2500);
    return () => window.clearInterval(id);
  }, [router, quizHref, hasPending, waitForServerPlan, hasPendingSession]);

  // When nothing is pending and the user is not paid, the effect above
  // redirects; render nothing in that frame.
  if (!hasPending && !waitForServerPlan && !hasPendingSession) return null;

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
