import { requireAdmin } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";
import { analyticsEvents, users } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import {
  AdminIncompleteQuizzes,
  type AdminIncompleteQuizzesData,
  type IncompleteQuizRow,
} from "@/components/admin/admin-incomplete-quizzes";
import {
  buildSessionLog,
  filterIncompleteQuizSessions,
} from "@/lib/analytics/admin-sessions";

export const metadata = { title: "Incomplete Quizzes — TinyPlan" };

// Analytics must always reflect live data; force per-request rendering (no caching).
export const dynamic = "force-dynamic";

export default async function AdminIncompleteQuizzesPage() {
  await requireAdmin();

  const db = getDb();

  const allUsers = db.select().from(users).all();
  const usersById = new Map(allUsers.map((u) => [u.id, u]));

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

  // Build every session (no slice cap), then keep only the incomplete quizzes.
  const allSessions = buildSessionLog(allEvents, {
    now,
    sessionLimit: Number.MAX_SAFE_INTEGER,
    timelineCap: 50,
  });
  const incomplete = filterIncompleteQuizSessions(allSessions);

  // Attach the registered user's email/name when the session became identified
  // and that id still maps to a user row.
  const rows: IncompleteQuizRow[] = incomplete.map((session) => {
    const owner = session.userId ? usersById.get(session.userId) : undefined;
    return {
      session,
      email: owner?.email ?? null,
      name: owner?.name ?? null,
    };
  });

  const data: AdminIncompleteQuizzesData = { sessions: rows };

  return <AdminIncompleteQuizzes data={data} />;
}
