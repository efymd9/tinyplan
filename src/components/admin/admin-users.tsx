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
// raw user data (email, name, subscription enum, ids) and analytics strings pass
// through unchanged.

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  /** Raw subscription_status enum code (e.g. "free", "active"). Untranslated. */
  subscriptionStatus: string;
  /** Server-formatted join date, or "—" if unknown. */
  joinedLabel: string;
  sessionCount: number;
  eventCount: number;
  /** Absolute label of the most recent session activity, or "—". */
  lastActivityLabel: string;
  /** Relative recency of last activity ("3h", "2d"), or "—". */
  agoLabel: string;
  sessions: SessionSummary[];
}

export interface AdminUsersData {
  users: AdminUserRow[];
  anonymous: {
    sessionCount: number;
    eventCount: number;
    sessions: SessionSummary[];
  };
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
      {children}
    </h2>
  );
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

function UserCard({ user }: { user: AdminUserRow }) {
  const dict = useAdminDict();
  const [open, setOpen] = useState(false);
  const panelId = `user-panel-${user.id}`;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
      >
        {/* Filled when the user has at least one linked session. */}
        <span
          className={`shrink-0 w-2 h-2 rounded-full ${
            user.sessionCount > 0 ? "bg-success" : "bg-muted-foreground/40"
          }`}
          aria-hidden="true"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground truncate" title={user.email}>
              {user.email}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {user.subscriptionStatus}
            </span>
            {user.name && (
              <span className="text-[11px] text-muted-foreground truncate">{user.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground min-w-0 flex-wrap">
            <span className="tabular-nums">
              {user.sessionCount} {dict.usersPage.sessionsWord}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {user.eventCount} {dict.usersPage.eventsWord}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {dict.usersPage.lastActive}: {user.agoLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {dict.usersPage.joined}: {user.joinedLabel}
            </span>
          </div>
        </div>

        <ChevronIcon open={open} />
      </button>

      {open && (
        <div id={panelId} className="px-4 pb-4 pt-1 border-t border-border-whisper bg-muted/20">
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 py-3 text-xs">
            <Meta label={dict.usersPage.subscription} value={user.subscriptionStatus} />
            <Meta label={dict.usersPage.joined} value={user.joinedLabel} />
            <Meta label={dict.usersPage.lastActive} value={user.lastActivityLabel} />
          </dl>
          {user.sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{dict.usersPage.empty.userSessions}</p>
          ) : (
            <SessionsExplorer sessions={user.sessions} />
          )}
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{label}</dt>
      <dd className="text-foreground truncate" title={value}>
        {value}
      </dd>
    </div>
  );
}

function UsersView({ data }: { data: AdminUsersData }) {
  const dict = useAdminDict();
  const { users, anonymous } = data;

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
              {dict.usersPage.backToOverview}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">{dict.usersPage.title}</h1>
        <p className="text-sm text-muted-foreground mb-8">{dict.usersPage.subtitle}</p>

        <section className="mb-10">
          <SectionHeading>{dict.usersPage.registeredUsers}</SectionHeading>
          {users.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground">{dict.usersPage.empty.users}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <UserCard key={u.id} user={u} />
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionHeading>{dict.usersPage.anonymousSessions}</SectionHeading>
          <p className="text-xs text-muted-foreground/80 mb-3">
            {dict.usersPage.anonymousSub} · {anonymous.sessionCount} {dict.usersPage.sessionsWord}{" "}
            · {anonymous.eventCount} {dict.usersPage.eventsWord}
          </p>
          {anonymous.sessions.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground">{dict.usersPage.empty.anonymous}</p>
            </div>
          ) : (
            <SessionsExplorer sessions={anonymous.sessions} />
          )}
        </section>
      </main>
    </div>
  );
}

export function AdminUsers({ data }: { data: AdminUsersData }) {
  return (
    <AdminLangProvider>
      <UsersView data={data} />
    </AdminLangProvider>
  );
}
