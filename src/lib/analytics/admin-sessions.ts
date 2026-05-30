// Behavioral session log for the admin dashboard.
//
// First-party only: this module derives "sessions" purely from rows already in
// our own `analytics_events` table. It is computed per request (the admin page
// is `force-dynamic`) and never persisted. No IP addresses are read or stored —
// see `src/app/api/analytics/route.ts`, which intentionally omits them.
//
// A "session" is the set of events sharing one anonymous `session_id`
// (localStorage-generated on the client). For each session we expose counts,
// start/last timestamps, inferred device, traffic source, the path trail, an
// optional logged-in user id, and a chronological timeline of recent events.

export type DeviceClass = 'mobile' | 'tablet' | 'desktop' | 'unknown';

// Structural shape of the columns we read. `analytics_events` rows (Drizzle
// `select()`) are assignable to this; we keep it local so this stays a pure,
// dependency-free helper that the admin page and its client component can share.
export interface AnalyticsEventRow {
  id: string;
  user_id: string | null;
  session_id: string | null;
  event_name: string;
  properties_json: string | null;
  path: string | null;
  referrer: string | null;
  user_agent: string | null;
  created_at: number | null;
}

export interface SessionTimelineEvent {
  id: string;
  eventName: string;
  /** Server-formatted clock time (stable string prop — no client Date() needed). */
  timeLabel: string;
  path: string | null;
  /** Short curated context string built from the event's properties. May be ''. */
  detail: string;
}

export interface SessionSummary {
  sessionId: string;
  /** Logged-in user id if the session became identified (last value wins). */
  userId: string | null;
  eventCount: number;
  startedAt: number;
  lastActivity: number;
  startedLabel: string;
  lastActivityLabel: string;
  /** Relative recency of last activity, e.g. "now", "12m", "3h", "2d". */
  agoLabel: string;
  /** Session span, e.g. "<1 min" or "14 min". */
  durationLabel: string;
  device: DeviceClass;
  /** Normalized traffic source (referrer host or "direct"). */
  source: string;
  /** Raw entry referrer, if any. */
  referrer: string | null;
  entryPath: string | null;
  lastPath: string | null;
  /** Distinct page path trail in visit order (consecutive dupes collapsed). */
  pathTrail: string[];
  lastEventName: string;
  lastQuizStep: number | null;
  lastQuizStage: string | null;
  /** Whether this session emitted any quiz event (start / step / complete). */
  hasQuizActivity: boolean;
  /** Whether this session reached `quiz_completed`. */
  quizCompleted: boolean;
  /** Raw last `quiz_step_answered` answer (joined if multi-select). May be null. */
  lastQuizAnswer: string | null;
  /** Up to `timelineCap` most recent events, in chronological (ascending) order. */
  timeline: SessionTimelineEvent[];
}

export interface BuildSessionLogOptions {
  /** Current time in ms (Date.now()), passed in so labels stay request-stable. */
  now: number;
  /** Max number of sessions to return (most recently active first). */
  sessionLimit?: number;
  /** Max events kept per session timeline. */
  timelineCap?: number;
  /** Max entries kept in the page trail. */
  trailCap?: number;
}

// ── Shared pure helpers (also used by the admin page's aggregate metrics) ─────

export function parseProps(json: string | null): Record<string, unknown> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function toFiniteNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

// Simple, dependency-free device class inference from a user-agent string.
export function inferDevice(ua: string | null): DeviceClass {
  if (!ua) return 'unknown';
  const s = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk|kindle|(android(?!.*mobi))/.test(s)) return 'tablet';
  if (/mobi|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile|windows phone/.test(s))
    return 'mobile';
  return 'desktop';
}

// Normalize a referrer URL to its host so traffic sources group cleanly.
export function referrerSource(ref: string | null): string {
  if (!ref) return 'direct';
  try {
    return new URL(ref).host || 'direct';
  } catch {
    return ref;
  }
}

// ── Label formatting (server-side, explicit locale so output is deterministic) ─

function absoluteLabel(ms: number): string {
  return new Date(ms).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function clockLabel(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function relativeLabel(fromMs: number, now: number): string {
  const diff = Math.max(0, now - fromMs);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}

function durationLabel(ms: number): string {
  if (ms < 60_000) return '<1 min';
  return `${Math.round(ms / 60_000)} min`;
}

// Curate a short, human-readable context line from an event's properties.
function eventDetail(props: Record<string, unknown>): string {
  const parts: string[] = [];

  const step = toFiniteNumber(props.step);
  if (step !== null) {
    const stage = typeof props.stage === 'string' ? props.stage : null;
    parts.push(stage ? `step ${step} · ${stage}` : `step ${step}`);
  }

  if (props.answer != null) {
    const answer = Array.isArray(props.answer)
      ? props.answer.map((a) => String(a)).join(', ')
      : String(props.answer);
    if (answer.trim()) parts.push(`answer: ${answer}`);
  }

  if (typeof props.location === 'string' && props.location) parts.push(`cta: ${props.location}`);
  if (typeof props.profile === 'string' && props.profile) parts.push(props.profile);
  if (typeof props.goal === 'string' && props.goal) parts.push(props.goal);
  if (typeof props.status === 'string' && props.status) parts.push(`status: ${props.status}`);
  if (typeof props.activity_id === 'string' && props.activity_id)
    parts.push(`activity ${props.activity_id.slice(0, 8)}`);
  if (typeof props.email_domain === 'string' && props.email_domain)
    parts.push(`@${props.email_domain}`);

  const amount = toFiniteNumber(props.amount);
  if (amount !== null) parts.push(`$${amount}`);

  const detail = parts.join(' · ');
  return detail.length > 140 ? `${detail.slice(0, 139)}…` : detail;
}

// Internal accumulator so we can compute cheap aggregates for every session,
// then only format timelines/labels for the slice we actually return.
interface SessionCore {
  sessionId: string;
  rows: AnalyticsEventRow[];
  userId: string | null;
  startedAt: number;
  lastActivity: number;
  device: DeviceClass;
  referrer: string | null;
  pathTrail: string[];
  lastEventName: string;
  lastQuizStep: number | null;
  lastQuizStage: string | null;
  hasQuizActivity: boolean;
  quizCompleted: boolean;
  lastQuizAnswer: string | null;
}

/**
 * Build the recent-session behavioral log from raw analytics rows.
 *
 * @param events  Rows from `analytics_events`. Order is normalized internally,
 *                so callers may pass them in any order.
 */
export function buildSessionLog(
  events: AnalyticsEventRow[],
  options: BuildSessionLogOptions
): SessionSummary[] {
  const { now, sessionLimit = 20, timelineCap = 50, trailCap = 12 } = options;

  // 1. Group events by anonymous session id (skip rows with no session).
  const groups = new Map<string, AnalyticsEventRow[]>();
  for (const event of events) {
    const sid = event.session_id;
    if (!sid) continue;
    const group = groups.get(sid);
    if (group) group.push(event);
    else groups.set(sid, [event]);
  }

  // 2. Cheap per-session aggregates.
  const cores: SessionCore[] = [];
  for (const [sessionId, rows] of groups) {
    rows.sort((a, b) => (a.created_at ?? 0) - (b.created_at ?? 0));

    const core: SessionCore = {
      sessionId,
      rows,
      userId: null,
      startedAt: rows[0]?.created_at ?? 0,
      lastActivity: rows[rows.length - 1]?.created_at ?? 0,
      device: 'unknown',
      referrer: null,
      pathTrail: [],
      lastEventName: rows[rows.length - 1]?.event_name ?? '',
      lastQuizStep: null,
      lastQuizStage: null,
      hasQuizActivity: false,
      quizCompleted: false,
      lastQuizAnswer: null,
    };

    for (const event of rows) {
      // Identity: last logged-in user id wins (session may start anonymous).
      if (event.user_id) core.userId = event.user_id;

      // Device + referrer: first known value wins (the entry context).
      if (core.device === 'unknown') {
        const inferred = inferDevice(event.user_agent);
        if (inferred !== 'unknown') core.device = inferred;
      }
      if (!core.referrer && event.referrer) core.referrer = event.referrer;

      // Path trail: collapse consecutive duplicates.
      const props = parseProps(event.properties_json);
      const path =
        event.path ?? (typeof props.path === 'string' ? props.path : null);
      if (path && core.pathTrail[core.pathTrail.length - 1] !== path) {
        core.pathTrail.push(path);
      }

      // Quiz lifecycle: any quiz event marks activity; completion is sticky.
      if (
        event.event_name === 'quiz_started' ||
        event.event_name === 'quiz_step_viewed' ||
        event.event_name === 'quiz_step_answered' ||
        event.event_name === 'quiz_completed'
      ) {
        core.hasQuizActivity = true;
      }
      if (event.event_name === 'quiz_completed') core.quizCompleted = true;

      // Latest quiz position reached in this session. Only `quiz_step_viewed`
      // carries the screen id (`stage`); `quiz_step_answered` omits it, so we
      // keep the last known stage rather than clobbering it with null.
      if (event.event_name === 'quiz_step_viewed' || event.event_name === 'quiz_step_answered') {
        const step = toFiniteNumber(props.step);
        if (step !== null) {
          core.lastQuizStep = step;
          if (typeof props.stage === 'string' && props.stage) core.lastQuizStage = props.stage;
        }
      }

      // Last raw answer given (joined for multi-select). Untranslated.
      if (event.event_name === 'quiz_step_answered' && props.answer != null) {
        const answer = Array.isArray(props.answer)
          ? props.answer.map((a) => String(a)).join(', ')
          : String(props.answer);
        if (answer.trim()) core.lastQuizAnswer = answer;
      }
    }

    if (core.pathTrail.length > trailCap) {
      core.pathTrail = core.pathTrail.slice(-trailCap);
    }

    cores.push(core);
  }

  // 3. Most recently active first, then keep only the requested slice.
  cores.sort((a, b) => b.lastActivity - a.lastActivity);
  const kept = cores.slice(0, sessionLimit);

  // 4. Format labels + timeline only for the sessions we return.
  return kept.map((core) => {
    const recent = core.rows.slice(-timelineCap);
    const timeline: SessionTimelineEvent[] = recent.map((event) => ({
      id: event.id,
      eventName: event.event_name,
      timeLabel: clockLabel(event.created_at ?? core.lastActivity),
      path: event.path ?? null,
      detail: eventDetail(parseProps(event.properties_json)),
    }));

    return {
      sessionId: core.sessionId,
      userId: core.userId,
      eventCount: core.rows.length,
      startedAt: core.startedAt,
      lastActivity: core.lastActivity,
      startedLabel: absoluteLabel(core.startedAt),
      lastActivityLabel: absoluteLabel(core.lastActivity),
      agoLabel: relativeLabel(core.lastActivity, now),
      durationLabel: durationLabel(core.lastActivity - core.startedAt),
      device: core.device,
      source: referrerSource(core.referrer),
      referrer: core.referrer,
      entryPath: core.pathTrail[0] ?? null,
      lastPath: core.pathTrail[core.pathTrail.length - 1] ?? null,
      pathTrail: core.pathTrail,
      lastEventName: core.lastEventName,
      lastQuizStep: core.lastQuizStep,
      lastQuizStage: core.lastQuizStage,
      hasQuizActivity: core.hasQuizActivity,
      quizCompleted: core.quizCompleted,
      lastQuizAnswer: core.lastQuizAnswer,
      timeline,
    };
  });
}

// ── Per-user grouping ─────────────────────────────────────────────────────────
// Partition already-built session summaries by their identified user id. A
// session lands under a user when any of its events carried that `user_id`
// ("last value wins", per buildSessionLog); sessions that never became
// identified are returned separately as anonymous. Pure: input order is
// preserved within each bucket, so passing summaries pre-sorted by recency
// keeps each user's sessions newest-first.

export interface GroupedSessions {
  /** Sessions keyed by the identified user id. */
  byUserId: Map<string, SessionSummary[]>;
  /** Sessions that never became identified (no user id on any event). */
  anonymous: SessionSummary[];
}

export function groupSessionsByUser(sessions: SessionSummary[]): GroupedSessions {
  const byUserId = new Map<string, SessionSummary[]>();
  const anonymous: SessionSummary[] = [];

  for (const session of sessions) {
    if (session.userId) {
      const list = byUserId.get(session.userId);
      if (list) list.push(session);
      else byUserId.set(session.userId, [session]);
    } else {
      anonymous.push(session);
    }
  }

  return { byUserId, anonymous };
}

// ── Incomplete-quiz filtering ──────────────────────────────────────────────────
// A quiz session is "incomplete" when it shows quiz activity (a start, a viewed
// or answered step) but never reached `quiz_completed`. Returned newest-active
// first so the admin sees the freshest drop-offs at the top. Pure: derives only
// from already-built summaries.

export function filterIncompleteQuizSessions(sessions: SessionSummary[]): SessionSummary[] {
  return sessions
    .filter((s) => s.hasQuizActivity && !s.quizCompleted)
    .sort((a, b) => b.lastActivity - a.lastActivity);
}
