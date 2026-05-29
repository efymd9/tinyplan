import { getCurrentUser } from "@/lib/auth/magic-link";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { analyticsEvents, users, plans, payments, quizSessions } from "@/lib/db/schema";
import { sql, asc, desc } from "drizzle-orm";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata = { title: "Admin — TinyPlan" };

// Analytics must always reflect live data; force per-request rendering (no caching).
export const dynamic = "force-dynamic";

interface MetricCard {
  label: string;
  value: string | number;
  sub?: string;
}

// created_at is stored in milliseconds (Date.now()), not seconds.
function formatTime(ms: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleString();
}

function parseProps(json: string | null): Record<string, unknown> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function toFiniteNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

// Simple, dependency-free device class inference from a user-agent string.
function inferDevice(ua: string | null): "mobile" | "tablet" | "desktop" | "unknown" {
  if (!ua) return "unknown";
  const s = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk|kindle|(android(?!.*mobi))/.test(s)) return "tablet";
  if (/mobi|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile|windows phone/.test(s))
    return "mobile";
  return "desktop";
}

// Normalize a referrer URL to its host so traffic sources group cleanly.
function referrerSource(ref: string | null): string {
  if (!ref) return "direct";
  try {
    return new URL(ref).host || "direct";
  } catch {
    return ref;
  }
}

function topEntries(map: Map<string, number>, limit = 10): { label: string; count: number }[] {
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function TopList({
  rows,
  empty,
}: {
  rows: { label: string; count: number }[];
  empty: string;
}) {
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

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  if (adminEmails.length > 0 && !adminEmails.includes(user.email)) {
    redirect("/dashboard");
  }

  const db = getDb();

  const totalUsers = db.select({ count: sql<number>`count(*)` }).from(users).get()?.count ?? 0;
  const totalPlans = db.select({ count: sql<number>`count(*)` }).from(plans).get()?.count ?? 0;
  const totalQuizSessions = db.select({ count: sql<number>`count(*)` }).from(quizSessions).get()?.count ?? 0;
  const totalPayments = db.select({ count: sql<number>`count(*)` }).from(payments).get()?.count ?? 0;

  const eventCounts = db
    .select({
      event_name: analyticsEvents.event_name,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .groupBy(analyticsEvents.event_name)
    .all();

  const eventMap = new Map(eventCounts.map((e) => [e.event_name, e.count]));

  const quizStarts = eventMap.get("quiz_started") ?? 0;
  const quizCompletes = eventMap.get("quiz_completed") ?? totalQuizSessions;
  const pricingViews = eventMap.get("paywall_viewed") ?? 0;
  const purchaseStarts = eventMap.get("checkout_started") ?? 0;
  const purchaseCompletes = eventMap.get("purchase_completed") ?? totalPayments;

  const funnelConversion =
    quizStarts > 0 ? ((purchaseCompletes / quizStarts) * 100).toFixed(1) : "0";

  const recentEvents = db
    .select()
    .from(analyticsEvents)
    .orderBy(desc(analyticsEvents.created_at))
    .limit(20)
    .all();

  // ── Derived analytics (first-party, computed per request) ──────────────────
  // Pull all events ascending so "last value wins" loops naturally yield the
  // most recent state per session. Fine for an MVP-scale SQLite table.
  const allEvents = db
    .select()
    .from(analyticsEvents)
    .orderBy(asc(analyticsEvents.created_at))
    .all();

  interface SessionAgg {
    sessionId: string;
    count: number;
    lastEventName: string;
    lastActivity: number;
    lastQuizStep?: number;
    lastQuizStage?: string;
    device: "mobile" | "tablet" | "desktop" | "unknown";
    source?: string;
  }

  const sessions = new Map<string, SessionAgg>();
  const sessionMaxStep = new Map<string, number>();
  const lastViewedPerSession = new Map<string, { step: number; stage?: string }>();
  const completedSessions = new Set<string>();

  const pageViewsByPath = new Map<string, number>();
  const ctaClicksByLocation = new Map<string, number>();
  const answerCounts = new Map<string, number>();

  for (const e of allEvents) {
    const sid = e.session_id;
    const props = parseProps(e.properties_json);
    const createdAt = e.created_at ?? 0;

    if (sid) {
      let agg = sessions.get(sid);
      if (!agg) {
        agg = {
          sessionId: sid,
          count: 0,
          lastEventName: e.event_name,
          lastActivity: createdAt,
          device: inferDevice(e.user_agent),
          source: e.referrer ? referrerSource(e.referrer) : undefined,
        };
        sessions.set(sid, agg);
      }
      agg.count += 1;
      // allEvents is ascending, so the final write is the latest event.
      agg.lastActivity = createdAt;
      agg.lastEventName = e.event_name;
      if (agg.device === "unknown") agg.device = inferDevice(e.user_agent);
      if (!agg.source && e.referrer) agg.source = referrerSource(e.referrer);
    }

    if (e.event_name === "quiz_completed" && sid) {
      completedSessions.add(sid);
    }

    if (
      (e.event_name === "quiz_step_viewed" || e.event_name === "quiz_step_answered") &&
      sid
    ) {
      const step = toFiniteNumber(props.step);
      const stage = typeof props.stage === "string" ? props.stage : undefined;
      if (step !== null) {
        sessionMaxStep.set(sid, Math.max(sessionMaxStep.get(sid) ?? 0, step));
        const agg = sessions.get(sid);
        if (agg) {
          agg.lastQuizStep = step;
          if (stage) agg.lastQuizStage = stage;
        }
        if (e.event_name === "quiz_step_viewed") {
          lastViewedPerSession.set(sid, { step, stage });
        }
      }
    }

    if (e.event_name === "quiz_step_answered") {
      const answer = props.answer;
      const list = Array.isArray(answer) ? answer : answer != null ? [answer] : [];
      for (const a of list) {
        const key = String(a).trim();
        if (key) answerCounts.set(key, (answerCounts.get(key) ?? 0) + 1);
      }
    }

    if (e.event_name === "page_viewed") {
      const path = e.path ?? (typeof props.path === "string" ? props.path : null) ?? "(unknown)";
      pageViewsByPath.set(path, (pageViewsByPath.get(path) ?? 0) + 1);
    }

    if (e.event_name === "cta_clicked") {
      const location = typeof props.location === "string" ? props.location : "(unknown)";
      ctaClicksByLocation.set(location, (ctaClicksByLocation.get(location) ?? 0) + 1);
    }
  }

  // 1. Anonymous sessions.
  const anonSessions = sessions.size;

  // 2. Quiz depth.
  const depths = [...sessionMaxStep.values()];
  const maxQuizDepth = depths.length ? Math.max(...depths) : 0;
  const avgQuizDepth = depths.length
    ? (depths.reduce((s, d) => s + d, 0) / depths.length).toFixed(1)
    : "0";

  // 3. Recent sessions.
  const recentSessions = [...sessions.values()]
    .sort((a, b) => b.lastActivity - a.lastActivity)
    .slice(0, 15);

  // 4. Quiz drop-off: last viewed step/stage for sessions without a completion.
  const dropoffCounts = new Map<string, number>();
  for (const [sid, info] of lastViewedPerSession) {
    if (completedSessions.has(sid)) continue;
    const label = info.stage
      ? `Step ${info.step} · ${info.stage}`
      : `Step ${info.step}`;
    dropoffCounts.set(label, (dropoffCounts.get(label) ?? 0) + 1);
  }
  const topDropoffs = topEntries(dropoffCounts, 10);

  // 5. Top answers / pain points.
  const topAnswers = topEntries(answerCounts, 12);

  // 6. Traffic + behavior breakdowns.
  const topPaths = topEntries(pageViewsByPath, 10);
  const topCtas = topEntries(ctaClicksByLocation, 10);

  const referrerCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  for (const agg of sessions.values()) {
    const source = agg.source ?? "direct";
    referrerCounts.set(source, (referrerCounts.get(source) ?? 0) + 1);
    deviceCounts.set(agg.device, (deviceCounts.get(agg.device) ?? 0) + 1);
  }
  const topReferrers = topEntries(referrerCounts, 10);
  const deviceBreakdown = topEntries(deviceCounts, 4);

  const funnelSteps = [
    { label: "Quiz Starts", value: quizStarts, pct: 100 },
    {
      label: "Quiz Completes",
      value: quizCompletes,
      pct: quizStarts > 0 ? Math.round((quizCompletes / quizStarts) * 100) : 0,
    },
    {
      label: "Pricing Views",
      value: pricingViews,
      pct: quizStarts > 0 ? Math.round((pricingViews / quizStarts) * 100) : 0,
    },
    {
      label: "Purchase Starts",
      value: purchaseStarts,
      pct: quizStarts > 0 ? Math.round((purchaseStarts / quizStarts) * 100) : 0,
    },
    {
      label: "Purchases",
      value: purchaseCompletes,
      pct: quizStarts > 0 ? Math.round((purchaseCompletes / quizStarts) * 100) : 0,
    },
  ];

  const metrics: MetricCard[] = [
    { label: "Total Users", value: totalUsers },
    { label: "Anon Sessions", value: anonSessions, sub: "distinct visitors" },
    { label: "Plans Generated", value: totalPlans },
    { label: "Quiz Sessions", value: totalQuizSessions },
    { label: "Purchases", value: purchaseCompletes },
    { label: "Quiz → Purchase", value: `${funnelConversion}%` },
    { label: "Max Quiz Depth", value: maxQuizDepth, sub: "deepest step reached" },
    { label: "Avg Quiz Depth", value: avgQuizDepth, sub: "per session" },
    { label: "Total Events", value: eventCounts.reduce((s, e) => s + e.count, 0) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border-whisper bg-card/90 backdrop-blur-md shadow-xs sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" aria-label="TinyPlan home">
              <BrandLogo width={130} />
            </Link>
            <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

        <section className="mb-10">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Key Metrics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="premium-card p-4"
              >
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
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Conversion Funnel
          </h2>
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
                    -{funnelSteps[i - 1].pct - step.pct}% dropoff
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Dropoff Analysis
          </h2>
          <div className="premium-card p-6">
            <div className="space-y-3">
              {funnelSteps.slice(1).map((step, i) => {
                const prev = funnelSteps[i];
                const dropoff = prev.value > 0 ? prev.value - step.value : 0;
                const dropoffPct =
                  prev.value > 0 ? Math.round((dropoff / prev.value) * 100) : 0;
                return (
                  <div key={step.label} className="flex items-center justify-between text-sm">
                    <span>
                      {prev.label} → {step.label}
                    </span>
                    <span className={dropoffPct > 50 ? "text-destructive font-medium" : "text-muted-foreground"}>
                      {dropoff} lost ({dropoffPct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Recent Sessions
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {recentSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground p-6">No sessions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Session</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Last Event</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Quiz Step</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Device</th>
                      <th className="text-right px-4 py-2 font-medium text-muted-foreground">Events</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSessions.map((s) => (
                      <tr key={s.sessionId} className="border-b border-border last:border-0">
                        <td className="px-4 py-2 font-mono text-xs">{s.sessionId.slice(0, 8)}…</td>
                        <td className="px-4 py-2 font-mono text-xs">{s.lastEventName}</td>
                        <td className="px-4 py-2 text-muted-foreground text-xs">
                          {s.lastQuizStep != null
                            ? s.lastQuizStage
                              ? `${s.lastQuizStep} · ${s.lastQuizStage}`
                              : `${s.lastQuizStep}`
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground text-xs">{s.device}</td>
                        <td className="px-4 py-2 text-muted-foreground text-xs text-right tabular-nums">
                          {s.count}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground text-xs whitespace-nowrap">
                          {formatTime(s.lastActivity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Quiz Drop-off (last step before exit)
            </h2>
            <div className="premium-card p-6">
              <TopList rows={topDropoffs} empty="No drop-offs recorded yet." />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Top Answers / Pain Points
            </h2>
            <div className="premium-card p-6">
              <TopList rows={topAnswers} empty="No quiz answers recorded yet." />
            </div>
          </div>
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Page Views by Path
            </h2>
            <div className="premium-card p-6">
              <TopList rows={topPaths} empty="No page views recorded yet." />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Traffic Sources (by session)
            </h2>
            <div className="premium-card p-6">
              <TopList rows={topReferrers} empty="No referrers recorded yet." />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              CTA Clicks by Location
            </h2>
            <div className="premium-card p-6">
              <TopList rows={topCtas} empty="No CTA clicks recorded yet." />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Device Breakdown (by session)
            </h2>
            <div className="premium-card p-6">
              <TopList rows={deviceBreakdown} empty="No device data recorded yet." />
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Event Breakdown
          </h2>
          <div className="premium-card p-6">
            {eventCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {eventCounts
                  .sort((a, b) => b.count - a.count)
                  .map((e) => (
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
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Recent Events
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground p-6">No events yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Event</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">User</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Properties</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvents.map((e) => (
                      <tr key={e.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-2 font-mono text-xs">{e.event_name}</td>
                        <td className="px-4 py-2 text-muted-foreground text-xs">
                          {e.user_id ? e.user_id.slice(0, 8) + "..." : "—"}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground text-xs max-w-[200px] truncate">
                          {e.properties_json || "—"}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground text-xs whitespace-nowrap">
                          {formatTime(e.created_at)}
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
