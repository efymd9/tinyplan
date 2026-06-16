"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SessionsExplorer } from "@/components/admin/sessions-explorer";
import {
  AdminLangProvider,
  AdminLangSwitcher,
  useAdminDict,
} from "@/components/admin/admin-lang-provider";
import type { AdminDict } from "@/lib/admin-i18n/dictionary";
import type { SessionSummary } from "@/lib/analytics/admin-sessions";

// ── Serializable data contract (computed server-side, rendered client-side) ────
// All values here are plain data; every user-facing *label* is supplied by the
// admin dictionary, never baked into this payload. Raw analytics strings
// (event names, paths, referrers, device enums, user ids) pass through unchanged.

export interface TopRow {
  label: string;
  count: number;
}

export interface DropoffRow {
  step: number;
  stage: string | null;
  count: number;
}

export interface RecentEventRow {
  id: string;
  eventName: string;
  userShort: string;
  properties: string;
  timeLabel: string;
}

export interface AdminData {
  metrics: {
    totalUsers: number;
    anonSessions: number;
    totalPlans: number;
    totalQuizSessions: number;
    purchases: number;
    funnelConversion: string;
    maxQuizDepth: number;
    avgQuizDepth: string;
    totalEvents: number;
  };
  funnel: {
    quizStarts: number;
    quizCompletes: number;
    pricingViews: number;
    purchaseStarts: number;
    checkoutCompletes: number;
  };
  sessionLog: SessionSummary[];
  topDropoffs: DropoffRow[];
  topAnswers: TopRow[];
  topPaths: TopRow[];
  topReferrers: TopRow[];
  topCtas: TopRow[];
  deviceBreakdown: TopRow[];
  eventCounts: { event_name: string; count: number }[];
  recentEvents: RecentEventRow[];
}

interface FunnelStep {
  label: string;
  value: number;
  pct: number;
}

function buildFunnelSteps(funnel: AdminData["funnel"], dict: AdminDict): FunnelStep[] {
  const { quizStarts } = funnel;
  const pct = (value: number) => (quizStarts > 0 ? Math.round((value / quizStarts) * 100) : 0);
  return [
    { label: dict.funnel.quizStarts, value: funnel.quizStarts, pct: 100 },
    { label: dict.funnel.quizCompletes, value: funnel.quizCompletes, pct: pct(funnel.quizCompletes) },
    { label: dict.funnel.pricingViews, value: funnel.pricingViews, pct: pct(funnel.pricingViews) },
    { label: dict.funnel.purchaseStarts, value: funnel.purchaseStarts, pct: pct(funnel.purchaseStarts) },
    { label: dict.funnel.checkoutCompletions, value: funnel.checkoutCompletes, pct: pct(funnel.checkoutCompletes) },
  ];
}

function TopList({ rows, empty }: { rows: TopRow[]; empty: string }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="truncate pr-2" title={r.label}>
              {r.label}
            </span>
            <span className="text-muted-foreground tabular-nums">{r.count}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary/70 rounded-full"
              style={{ width: `${Math.round((r.count / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
      {children}
    </h2>
  );
}

function Dashboard({ data }: { data: AdminData }) {
  const dict = useAdminDict();
  const { metrics, funnel } = data;

  const metricCards: { label: string; value: string | number; sub?: string }[] = [
    { label: dict.metrics.totalUsers, value: metrics.totalUsers },
    { label: dict.metrics.anonSessions, value: metrics.anonSessions, sub: dict.metrics.anonSessionsSub },
    { label: dict.metrics.plansGenerated, value: metrics.totalPlans },
    { label: dict.metrics.quizSessions, value: metrics.totalQuizSessions },
    { label: dict.metrics.purchases, value: metrics.purchases, sub: dict.metrics.purchasesSub },
    { label: dict.metrics.quizToPurchase, value: `${metrics.funnelConversion}%` },
    { label: dict.metrics.maxQuizDepth, value: metrics.maxQuizDepth, sub: dict.metrics.maxQuizDepthSub },
    { label: dict.metrics.avgQuizDepth, value: metrics.avgQuizDepth, sub: dict.metrics.avgQuizDepthSub },
    { label: dict.metrics.totalEvents, value: metrics.totalEvents },
  ];

  const funnelSteps = buildFunnelSteps(funnel, dict);

  const dropoffLabel = (row: DropoffRow) =>
    row.stage ? `${dict.step} ${row.step} · ${row.stage}` : `${dict.step} ${row.step}`;

  const sortedEventCounts = [...data.eventCounts].sort((a, b) => b.count - a.count);

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
            <Link href="/admin/users" className="text-sm text-muted-foreground hover:text-foreground">
              {dict.usersPage.navLink}
            </Link>
            <Link
              href="/admin/incomplete-quizzes"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {dict.incompletePage.navLink}
            </Link>
            <AdminLangSwitcher />
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              {dict.backToDashboard}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">{dict.title}</h1>

        <section className="mb-10">
          <SectionHeading>{dict.sections.keyMetrics}</SectionHeading>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {metricCards.map((m) => (
              <div key={m.label} className="premium-card p-4">
                <div className="text-2xl font-bold">{m.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
                {m.sub && (
                  <div className="text-[10px] text-muted-foreground/70 mt-0.5">{m.sub}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <SectionHeading>{dict.sections.conversionFunnel}</SectionHeading>
          <div className="premium-card p-6">
            {funnelSteps.map((step, i) => (
              <div key={step.label} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{step.label}</span>
                  <span className="text-muted-foreground">
                    {step.value} ({step.pct}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
                {i < funnelSteps.length - 1 && i > 0 && step.pct < funnelSteps[i - 1].pct && (
                  <div className="text-xs text-destructive mt-1">
                    -{funnelSteps[i - 1].pct - step.pct}% {dict.dropoffSuffix}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <SectionHeading>{dict.sections.dropoffAnalysis}</SectionHeading>
          <div className="premium-card p-6">
            <div className="space-y-3">
              {funnelSteps.slice(1).map((step, i) => {
                const prev = funnelSteps[i];
                const dropoff = prev.value > 0 ? prev.value - step.value : 0;
                const dropoffPct = prev.value > 0 ? Math.round((dropoff / prev.value) * 100) : 0;
                return (
                  <div key={step.label} className="flex items-center justify-between text-sm">
                    <span>
                      {prev.label} → {step.label}
                    </span>
                    <span
                      className={
                        dropoffPct > 50 ? "text-destructive font-medium" : "text-muted-foreground"
                      }
                    >
                      {dropoff} {dict.lost} ({dropoffPct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mb-10">
          <SectionHeading>{dict.sections.recentSessions}</SectionHeading>
          <SessionsExplorer sessions={data.sessionLog} />
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-2">
          <div>
            <SectionHeading>{dict.sections.quizDropoff}</SectionHeading>
            <div className="premium-card p-6">
              {data.topDropoffs.length === 0 ? (
                <p className="text-sm text-muted-foreground">{dict.empty.dropoffs}</p>
              ) : (
                <TopList
                  rows={data.topDropoffs.map((r) => ({ label: dropoffLabel(r), count: r.count }))}
                  empty={dict.empty.dropoffs}
                />
              )}
            </div>
          </div>
          <div>
            <SectionHeading>{dict.sections.topAnswers}</SectionHeading>
            <div className="premium-card p-6">
              <TopList rows={data.topAnswers} empty={dict.empty.answers} />
            </div>
          </div>
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-2">
          <div>
            <SectionHeading>{dict.sections.pageViews}</SectionHeading>
            <div className="premium-card p-6">
              <TopList rows={data.topPaths} empty={dict.empty.pageViews} />
            </div>
          </div>
          <div>
            <SectionHeading>{dict.sections.trafficSources}</SectionHeading>
            <div className="premium-card p-6">
              <TopList rows={data.topReferrers} empty={dict.empty.referrers} />
            </div>
          </div>
          <div>
            <SectionHeading>{dict.sections.ctaClicks}</SectionHeading>
            <div className="premium-card p-6">
              <TopList rows={data.topCtas} empty={dict.empty.ctas} />
            </div>
          </div>
          <div>
            <SectionHeading>{dict.sections.deviceBreakdown}</SectionHeading>
            <div className="premium-card p-6">
              <TopList rows={data.deviceBreakdown} empty={dict.empty.devices} />
            </div>
          </div>
        </section>

        <section className="mb-10">
          <SectionHeading>{dict.sections.eventBreakdown}</SectionHeading>
          <div className="premium-card p-6">
            {sortedEventCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{dict.empty.events}</p>
            ) : (
              <div className="space-y-2">
                {sortedEventCounts.map((e) => (
                  <div key={e.event_name} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs">{e.event_name}</span>
                    <span className="text-muted-foreground">{e.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <SectionHeading>{dict.sections.recentEvents}</SectionHeading>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {data.recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground p-6">{dict.empty.eventsShort}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                        {dict.table.event}
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                        {dict.table.user}
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                        {dict.table.properties}
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                        {dict.table.time}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentEvents.map((e) => (
                      <tr key={e.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-2 font-mono text-xs">{e.eventName}</td>
                        <td className="px-4 py-2 text-muted-foreground text-xs">{e.userShort}</td>
                        <td className="px-4 py-2 text-muted-foreground text-xs max-w-[200px] truncate">
                          {e.properties}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground text-xs whitespace-nowrap">
                          {e.timeLabel}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export function AdminDashboard({ data }: { data: AdminData }) {
  return (
    <AdminLangProvider>
      <Dashboard data={data} />
    </AdminLangProvider>
  );
}
