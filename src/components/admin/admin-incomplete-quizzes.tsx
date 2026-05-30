"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SessionsExplorer } from "@/components/admin/sessions-explorer";
import {
  AdminLangProvider,
  AdminLangSwitcher,
  useAdminDict,
} from "@/components/admin/admin-lang-provider";
import type { SessionSummary } from "@/lib/analytics/admin-sessions";

// ── Serializable data contract (computed server-side, rendered client-side) ────
// Plain data only. Every user-facing *label* comes from the admin dictionary;
// raw analytics data (session ids, stage codes, answers, paths) and the
// registered user's email/name pass through unchanged.

export interface IncompleteQuizRow {
  session: SessionSummary;
  /** Registered user's email if the session became identified, else null. */
  email: string | null;
  /** Registered user's name if known, else null. */
  name: string | null;
}

export interface AdminIncompleteQuizzesData {
  sessions: IncompleteQuizRow[];
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
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

function IncompleteCard({ row }: { row: IncompleteQuizRow }) {
  const dict = useAdminDict();
  const [open, setOpen] = useState(false);
  const { session, email } = row;
  const panelId = `incomplete-panel-${session.sessionId}`;

  // Readable question label from a small local stage mapping; unknown stages
  // fall back to the raw stage code (which is untranslated data).
  const stage = session.lastQuizStage;
  const questionLabel = stage ? dict.incompletePage.stages[stage] ?? stage : "—";

  const identity = email ?? row.name ?? dict.incompletePage.anonymous;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
      >
        {/* Filled when the session became identified (logged-in). */}
        <span
          className={`shrink-0 w-2 h-2 rounded-full ${
            session.userId ? "bg-success" : "bg-muted-foreground/40"
          }`}
          aria-hidden="true"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-foreground">
              {session.sessionId.slice(0, 8)}…
            </span>
            <span className="text-sm font-medium text-foreground truncate" title={identity}>
              {identity}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {session.source}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground min-w-0 flex-wrap">
            <span className="tabular-nums">
              {dict.incompletePage.step}{" "}
              {session.lastQuizStep != null ? session.lastQuizStep : "—"}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {dict.incompletePage.question}: {questionLabel}
            </span>
            {session.lastQuizAnswer && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate" title={session.lastQuizAnswer}>
                  {dict.incompletePage.lastAnswer}: {session.lastQuizAnswer}
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>
              {dict.incompletePage.lastActive}: {session.agoLabel}
            </span>
            {session.lastPath && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate font-mono" title={session.lastPath}>
                  {session.lastPath}
                </span>
              </>
            )}
          </div>
        </div>

        <ChevronIcon open={open} />
      </button>

      {open && (
        <div id={panelId} className="px-4 pb-4 pt-1 border-t border-border-whisper bg-muted/20">
          <SessionsExplorer sessions={[session]} />
        </div>
      )}
    </div>
  );
}

function IncompleteView({ data }: { data: AdminIncompleteQuizzesData }) {
  const dict = useAdminDict();
  const { sessions } = data;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border-whisper bg-card/90 backdrop-blur-md shadow-xs sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" aria-label={dict.homeAria}>
              <BrandLogo width={130} />
            </Link>
            <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {dict.badge}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <AdminLangSwitcher />
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
              {dict.incompletePage.backToOverview}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">{dict.incompletePage.title}</h1>
        <p className="text-sm text-muted-foreground mb-2">{dict.incompletePage.subtitle}</p>
        <p className="text-xs text-muted-foreground/80 mb-8 tabular-nums">
          {sessions.length} {dict.incompletePage.sessionsWord}
        </p>

        {sessions.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground">{dict.incompletePage.empty}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((row) => (
              <IncompleteCard key={row.session.sessionId} row={row} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export function AdminIncompleteQuizzes({ data }: { data: AdminIncompleteQuizzesData }) {
  return (
    <AdminLangProvider>
      <IncompleteView data={data} />
    </AdminLangProvider>
  );
}
