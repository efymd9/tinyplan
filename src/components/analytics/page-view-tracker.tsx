'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAnalytics } from '@/lib/analytics/use-analytics';

/**
 * Fires a `page_viewed` event on initial load and on every client-side
 * navigation. Mounted once in the root layout so it covers the whole app.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const { track } = useAnalytics();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;
    track({ event: 'page_viewed', properties: { path: pathname } });
  }, [pathname, track]);

  return null;
}
