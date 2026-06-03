"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/locale-provider";

/**
 * Unobtrusive "Manage subscription" affordance for the dashboard header.
 *
 * POSTs /api/billing/portal and, on success, redirects the browser to the
 * Stripe Billing Portal session url. The route returns 400 when Stripe is not
 * configured or the user has no Stripe customer id yet (the common case during
 * the soft launch, before anyone has actually paid) — in that case we surface a
 * quiet inline note rather than navigating nowhere, then reset so the user can
 * dismiss it by trying again later. Never throws into the UI.
 */
export function ManageSubscriptionButton() {
  const t = useT();
  const [state, setState] = useState<"idle" | "loading" | "unavailable">("idle");

  async function openPortal() {
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = (await res.json()) as { url?: string };
        if (data.url) {
          window.location.href = data.url;
          return; // keep the loading state while navigating away
        }
      }
      // 400 (no billing account / Stripe unconfigured) or a malformed payload:
      // show a quiet inline note instead of a hard error.
      setState("unavailable");
    } catch {
      setState("unavailable");
    }
  }

  if (state === "unavailable") {
    return (
      <span className="hidden sm:inline text-xs text-muted-foreground px-3 py-2">
        {t.dashboard.account.noBillingAccount}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={openPortal}
      disabled={state === "loading"}
      className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all rounded-xl px-3 py-2 hover:bg-muted/50 border border-transparent hover:border-border-whisper disabled:opacity-60 disabled:cursor-default"
    >
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
      <span>
        {state === "loading"
          ? t.dashboard.account.openingPortal
          : t.dashboard.account.manageSubscription}
      </span>
    </button>
  );
}
