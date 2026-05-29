'use client';

import { useCallback, useMemo } from 'react';
import type { AnalyticsEvent } from '@/lib/analytics/events';
import { getAnonSessionId } from '@/lib/analytics/session';

/**
 * Client-side analytics hook (first-party only).
 *
 * Returns `track` and `identify` helpers that POST to our own /api/analytics
 * endpoint. No third-party analytics SDKs are involved.
 *
 * Every tracked event is automatically tagged with an anonymous session id,
 * the current path, and the document referrer so the admin panel can build
 * funnels, drop-off, and traffic-source breakdowns without any per-call wiring.
 */
export function useAnalytics() {
  const track = useCallback(
    (
      event: AnalyticsEvent,
      userId?: string,
      sessionId?: string
    ): void => {
      const anonId = sessionId ?? getAnonSessionId();
      const path =
        typeof window !== 'undefined' ? window.location.pathname : undefined;
      const referrer =
        typeof document !== 'undefined' ? document.referrer || undefined : undefined;

      // POST to our own endpoint
      void fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: event.event,
          properties: event.properties,
          userId,
          sessionId: anonId,
          path,
          referrer,
        }),
      }).catch((err) => {
        console.error('[ANALYTICS] Failed to send event:', event.event, err);
      });
    },
    []
  );

  const identify = useCallback(
    (userId: string, traits?: Record<string, unknown>): void => {
      // Inform our backend
      void fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'identify',
          properties: traits,
          userId,
          sessionId: getAnonSessionId(),
        }),
      }).catch(() => {});
    },
    []
  );

  return useMemo(() => ({ track, identify }), [track, identify]);
}
