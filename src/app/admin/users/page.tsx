import { getCurrentUser } from "@/lib/auth/magic-link";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { analyticsEvents, users } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import {
  AdminUsers,
  type AdminUsersData,
  type AdminUserRow,
} from "@/components/admin/admin-users";
import {
  buildSessionLog,
  groupSessionsByUser,
  type SessionSummary,
} from "@/lib/analytics/admin-sessions";

export const metadata = { title: "Users & Sessions — TinyPlan" };

// Analytics must always reflect live data; force per-request rendering (no caching).
export const dynamic = "force-dynamic";

// created_at is stored in milliseconds (Date.now()), not seconds.
function formatDate(ms: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-US", { dateStyle: "medium" });
}

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (adminEmails.length > 0 && !adminEmails.includes(user.email)) {
    redirect("/dashboard");
  }

  const db = getDb();

  const allUsers = db.select().from(users).all();

  // Pull all events ascending so the per-session "last value wins" derivation in
  // buildSessionLog yields the most recent state. Fine at MVP-scale SQLite.
  const allEvents = db
    .select()
    .from(analyticsEvents)
    .orderBy(asc(analyticsEvents.created_at))
    .all();

  // Per-request clock read for relative ("3h ago") labels — intentional and safe
  // on this server-only, force-dynamic page that re-renders every request.
  // eslint-disable-next-line react-hooks/purity -- server-side per-request timestamp
  const now = Date.now();

  // Build every session (no slice cap — we need each user's full set), then
  // partition by identified user id.
  const allSessions = buildSessionLog(allEvents, {
    now,
    sessionLimit: Number.MAX_SAFE_INTEGER,
    timelineCap: 50,
  });
  const { byUserId, anonymous } = groupSessionsByUser(allSessions);

  const knownUserIds = new Set(allUsers.map((u) => u.id));

  // Sessions tagged with a user id that no longer maps to a user row are
  // "unassigned" — fold them into the anonymous bucket so nothing is lost.
  const orphanSessions: SessionSummary[] = [];
  for (const [uid, sessions] of byUserId) {
    if (!knownUserIds.has(uid)) orphanSessions.push(...sessions);
  }
  const anonSessions = [...anonymous, ...orphanSessions].sort(
    (a, b) => b.lastActivity - a.lastActivity
  );

  const userRows: AdminUserRow[] = allUsers
    .map((u) => {
      const sessions = byUserId.get(u.id) ?? [];
      // Sessions arrive newest-first (buildSessionLog sorts by recency).
      const mostRecent = sessions[0];
      const row: AdminUserRow = {
        id: u.id,
        email: u.email,
        name: u.name,
        subscriptionStatus: u.subscription_status ?? "free",
        joinedLabel: formatDate(u.created_at),
        sessionCount: sessions.length,
        eventCount: sessions.reduce((sum, s) => sum + s.eventCount, 0),
        lastActivityLabel: mostRecent ? mostRecent.lastActivityLabel : "—",
        agoLabel: mostRecent ? mostRecent.agoLabel : "—",
        sessions,
      };
      return { row, lastActivity: mostRecent ? mostRecent.lastActivity : 0 };
    })
    // Most recently active users first; users with no sessions fall to the
    // bottom, tie-broken alphabetically by email.
    .sort((a, b) => b.lastActivity - a.lastActivity || a.row.email.localeCompare(b.row.email))
    .map((entry) => entry.row);

  const data: AdminUsersData = {
    users: userRows,
    anonymous: {
      sessionCount: anonSessions.length,
      eventCount: anonSessions.reduce((sum, s) => sum + s.eventCount, 0),
      sessions: anonSessions,
    },
  };

  return <AdminUsers data={data} />;
}
