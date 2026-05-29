import { v4 as uuidv4 } from 'uuid';

// Anonymous, first-party session identifier. Stored in localStorage so a
// returning visitor keeps the same id across reloads and across the funnel
// (landing -> quiz -> result -> checkout). It is NOT derived from any PII and
// is only used to stitch together one visitor's events for funnel/depth stats.
const ANON_ID_KEY = 'tinyplan_anon_id';

export function getAnonSessionId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    let id = localStorage.getItem(ANON_ID_KEY);
    if (!id) {
      id = uuidv4();
      localStorage.setItem(ANON_ID_KEY, id);
    }
    return id;
  } catch {
    // localStorage can throw in private mode / when storage is disabled.
    return undefined;
  }
}
