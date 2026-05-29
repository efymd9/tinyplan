import { v4 as uuidv4 } from 'uuid';

// First-party analytics only. Events are persisted to our own SQLite table and
// surfaced in the admin dashboard. No third-party analytics SDKs are used.

// ── Event types ─────────────────────────────────────────────────────────────

export type AnalyticsEvent =
  | { event: 'quiz_started'; properties?: Record<string, unknown> }
  | {
      event: 'quiz_step_viewed';
      properties: { step: number; stage: string; total?: number };
    }
  | {
      event: 'quiz_step_answered';
      properties: { step: number; stage?: string; answer: string | string[] };
    }
  | { event: 'quiz_completed'; properties?: Record<string, unknown> }
  | {
      event: 'cta_clicked';
      properties: { location: string; href?: string };
    }
  | { event: 'email_submitted'; properties?: { email_domain?: string } }
  | { event: 'mini_result_viewed'; properties?: { profile?: string } }
  | {
      event: 'paywall_viewed';
      properties?: { profile?: string; goal?: string };
    }
  | { event: 'checkout_started'; properties?: Record<string, unknown> }
  | { event: 'purchase_completed'; properties?: { amount?: number } }
  | { event: 'plan_revealed'; properties?: Record<string, unknown> }
  | { event: 'day1_started'; properties?: Record<string, unknown> }
  | {
      event: 'activity_completed';
      properties?: { activity_id?: string; status?: string };
    }
  | { event: 'weekly_checkin_completed'; properties?: Record<string, unknown> }
  | { event: 'page_viewed'; properties?: { path?: string } };

// ── Provider interface ──────────────────────────────────────────────────────

export interface AnalyticsProvider {
  track(event: AnalyticsEvent, userId?: string, sessionId?: string): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
}

// ── Server-side provider (stores events to DB) ──────────────────────────────

class ServerAnalyticsProvider implements AnalyticsProvider {
  track(event: AnalyticsEvent, userId?: string, sessionId?: string): void {
    // Import getDb lazily to avoid circular deps
    void (async () => {
      try {
        const { getDb } = await import('@/lib/db');
        const { analyticsEvents } = await import('@/lib/db/schema');
        const db = getDb();

        db.insert(analyticsEvents)
          .values({
            id: uuidv4(),
            user_id: userId ?? null,
            session_id: sessionId ?? null,
            event_name: event.event,
            properties_json: event.properties
              ? JSON.stringify(event.properties)
              : null,
            created_at: Date.now(),
          })
          .run();
      } catch (err) {
        console.error('[ANALYTICS] Failed to persist event:', event.event, err);
      }
    })();
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    // On the server side, identify is a no-op beyond logging.
    // User traits are stored directly in the users table.
    console.log('[ANALYTICS] identify', userId, traits);
  }
}

// ── Client-side provider (posts to our first-party /api/analytics) ──────────

class ClientAnalyticsProvider implements AnalyticsProvider {
  track(event: AnalyticsEvent, userId?: string, sessionId?: string): void {
    // POST to our own analytics endpoint
    void fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: event.event,
        properties: event.properties,
        userId,
        sessionId,
      }),
    }).catch((err) => {
      console.error('[ANALYTICS] Failed to send event:', event.event, err);
    });
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    // Inform our backend
    void fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'identify',
        properties: traits,
        userId,
      }),
    }).catch(() => {});
  }
}

// ── Factories ───────────────────────────────────────────────────────────────

export function getServerAnalytics(): AnalyticsProvider {
  return new ServerAnalyticsProvider();
}

export function createClientAnalytics(): AnalyticsProvider {
  return new ClientAnalyticsProvider();
}
