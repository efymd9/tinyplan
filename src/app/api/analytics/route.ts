import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { analyticsEvents } from '@/lib/db/schema';
import { checkRateLimit } from '@/lib/rate-limit';

// First-party analytics ingestion. Runs at request time so it can read the
// user-agent / referer headers; never cached.
export const dynamic = 'force-dynamic';

// Defensive caps so a malformed or hostile client cannot bloat the table.
const MAX_EVENT_NAME = 80;
const MAX_PATH = 512;
const MAX_REFERRER = 1024;
const MAX_USER_AGENT = 512;
const MAX_PROPERTIES = 4096;

function clamp(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export async function POST(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, {
      namespace: 'analytics',
      limit: 120,
      windowSeconds: 60,
    });
    if (limited) return limited;

    const body = await request.json();
    const { event, properties, userId, sessionId, path, referrer } = body;

    if (!event || typeof event !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "event" field' },
        { status: 400 }
      );
    }

    // Privacy: we intentionally do NOT store IP addresses. User-agent and
    // referrer are kept only to power aggregate device/source breakdowns.
    const userAgent = clamp(request.headers.get('user-agent'), MAX_USER_AGENT);
    const headerReferer = request.headers.get('referer');
    const resolvedReferrer =
      clamp(referrer, MAX_REFERRER) ?? clamp(headerReferer, MAX_REFERRER);

    let propertiesJson: string | null = null;
    if (properties && typeof properties === 'object') {
      propertiesJson = JSON.stringify(properties).slice(0, MAX_PROPERTIES);
    }

    const db = getDb();

    db.insert(analyticsEvents)
      .values({
        id: uuidv4(),
        user_id: clamp(userId, 128),
        session_id: clamp(sessionId, 128),
        event_name: event.slice(0, MAX_EVENT_NAME),
        properties_json: propertiesJson,
        path: clamp(path, MAX_PATH),
        referrer: resolvedReferrer,
        user_agent: userAgent,
        created_at: Date.now(),
      })
      .run();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[API /analytics] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
