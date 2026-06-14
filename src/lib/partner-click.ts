// Shared affiliate-click helpers with NO server-only imports, so the server
// (checkout, proxy) and the client (PartnerClickCapture) can all use them.

/** HttpOnly cookie holding the affiliate click id, read server-side at checkout. */
export const PARTNER_CLICK_COOKIE = 'pn_click';
/** Readable companion flag so the client can decide whether to load the partner SDK. */
export const PARTNER_AFFILIATE_FLAG_COOKIE = 'pn_aff';

/**
 * Affiliate click ids are short opaque tokens: word chars, dot, hyphen, 1–128.
 * Validate on every read (not just on write) so a tampered cookie is never
 * forwarded into Stripe metadata and credited as a referral.
 */
export function isValidClickId(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^[\w.-]{1,128}$/.test(value);
}
