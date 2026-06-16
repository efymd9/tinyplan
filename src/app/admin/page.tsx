import { requireAdmin } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";
import { analyticsEvents, users, plans, quizSessions } from "@/lib/db/schema";
import { sql, asc, desc } from "drizzle-orm";
import { countPaidCustomers } from "@/lib/analytics/purchases";
import {
  AdminDashboard,
  type AdminData,
  type DropoffRow,
} from "@/components/admin/admin-dashboard";
import {
  buildSessionLog,
  parseProps,
  toFiniteNumber,
  inferDevice,
  referrerSource,
  type DeviceClass,
} from "@/lib/analytics/admin-sessions";

export const metadata = { title: "Admin — TinyPlan" };

// Analytics must always reflect live data; force per-request rendering (no caching).
export const dynamic = "force-dynamic";

// created_at is stored in milliseconds (Date.now()), not seconds.
function formatTime(ms: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleString();
}

function topEntries(map: Map<string, number>, limit = 10): { label: string; count: number }[] {
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export default async function AdminPage() {
  await requireAdmin();

  const db = getDb();

  const totalUsers = db.select({ count: sql<number>`count(*)` }).from(users).get()?.count ?? 0;
  const totalPlans = db.select({ count: sql<number>`count(*)` }).from(plans).get()?.count ?? 0;
  const totalQuizSessions = db.select({ count: sql<number>`count(*)` }).from(quizSessions).get()?.count ?? 0;

  // Real purchases = distinct customers with a successful payment, read from the
  // payments table (money actually collected) — NOT the purchase_completed
  // analytics event, which over-counted reloads/test runs and is no longer
  // emitted. See countPaidCustomers.
  const purchases = countPaidCustomers(db);

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

  // Conversion is measured against REAL purchases (payments), not funnel events.
  const funnelConversion =
    quizStarts > 0 ? ((purchases / quizStarts) * 100).toFixed(1) : "0";

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

  // Expandable behavioral session log (timeline view) — derived first-party.
  // Per-request clock read for relative ("3h ago") labels; intentional and safe
  // on this server-only, force-dynamic page that re-renders every request.
  // eslint-disable-next-line react-hooks/purity -- server-side per-request timestamp
  const now = Date.now();
  const sessionLog = buildSessionLog(allEvents, {
    now,
    sessionLimit: 20,
    timelineCap: 50,
  });

  // Lightweight per-session aggregate used only for the count + breakdowns below.
  interface SessionAgg {
    device: DeviceClass;
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

    if (sid) {
      let agg = sessions.get(sid);
      if (!agg) {
        agg = {
          device: inferDevice(e.user_agent),
          source: e.referrer ? referrerSource(e.referrer) : undefined,
        };
        sessions.set(sid, agg);
      }
      // First known value wins for device/source (the session entry context).
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

  // 3. Quiz drop-off: last viewed step/stage for sessions without a completion.
  // Keep step/stage structured (not a prebaked label) so the admin UI can
  // localize the "Step" prefix; the stage code itself is raw data, untranslated.
  const dropoffAgg = new Map<string, DropoffRow>();
  for (const [sid, info] of lastViewedPerSession) {
    if (completedSessions.has(sid)) continue;
    const key = `${info.step}|${info.stage ?? ""}`;
    const existing = dropoffAgg.get(key);
    if (existing) existing.count += 1;
    else dropoffAgg.set(key, { step: info.step, stage: info.stage ?? null, count: 1 });
  }
  const topDropoffs = [...dropoffAgg.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 4. Top answers / pain points.
  const topAnswers = topEntries(answerCounts, 12);

  // 5. Traffic + behavior breakdowns.
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

  // Pre-format the recent-events table server-side; passing display strings keeps
  // the client component free of `Date` (no hydration drift) and leaks no PII
  // beyond the truncated user id already shown.
  const recentEventRows = recentEvents.map((e) => ({
    id: e.id,
    eventName: e.event_name,
    userShort: e.user_id ? e.user_id.slice(0, 8) + "..." : "—",
    properties: e.properties_json || "—",
    timeLabel: formatTime(e.created_at),
  }));

  const data: AdminData = {
    metrics: {
      totalUsers,
      anonSessions,
      totalPlans,
      totalQuizSessions,
      purchases,
      funnelConversion,
      maxQuizDepth,
      avgQuizDepth,
      totalEvents: eventCounts.reduce((s, e) => s + e.count, 0),
    },
    funnel: {
      quizStarts,
      quizCompletes,
      pricingViews,
      purchaseStarts,
      purchases,
    },
    sessionLog,
    topDropoffs,
    topAnswers,
    topPaths,
    topReferrers,
    topCtas,
    deviceBreakdown,
    eventCounts,
    recentEvents: recentEventRows,
  };

  return <AdminDashboard data={data} />;
}
