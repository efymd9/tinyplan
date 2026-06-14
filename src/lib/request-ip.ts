// Real client IP extraction for requests behind a SINGLE trusted reverse proxy
// (Caddy, per DEPLOY.md). Shared by the rate limiter and the locale proxy so the
// trust model lives in one place.

type HeaderGetter = { get(name: string): string | null };

/**
 * Return the client IP, or `'unknown'` when none can be determined.
 *
 * Caddy appends the real peer IP to any client-supplied `X-Forwarded-For`, so
 * the RIGHTMOST entry is the trustworthy one. The leftmost entries are fully
 * attacker-controlled — trusting them lets a caller rotate a fabricated XFF to
 * get a fresh rate-limit bucket (or spoofed geo) on every request. We therefore
 * never read the leftmost token, and we do NOT trust `X-Real-IP`/`CF-*` headers
 * because bare Caddy forwards client-supplied copies of them unchanged.
 *
 * NOTE: assumes exactly one trusted hop. If a CDN is added in front of Caddy,
 * also set `trusted_proxies` in the Caddyfile and revisit this.
 */
export function clientIp(headers: HeaderGetter): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return 'unknown';
}
