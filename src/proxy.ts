// proxy.ts — Next.js 16 Proxy (formerly middleware).
//
// Two responsibilities, layered:
//   1. Clerk authentication — only when a publishable key is configured. This
//      attaches the Clerk request context (so `auth()`/`currentUser()` work in
//      Server Components and Route Handlers) and redirects unauthenticated
//      visitors away from protected page routes.
//   2. Locale detection + redirect for the i18n `app/[lang]` tree.
//
// When Clerk is NOT configured (local dev, or a key-less build) we skip Clerk
// entirely and run only the locale proxy — preserving the original behavior and
// the DEV_BYPASS_AUTH flow.
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { Reader, type CountryResponse } from "mmdb-lib";
import { locales, defaultLocale, isLocale } from "@/lib/i18n/config";
import { clientIp } from "@/lib/request-ip";

const COOKIE = "tinyplan_locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

// ── GeoIP (local lookup — visitor IPs never leave this server) ──────────────
// Used only as a tiebreaker when Accept-Language matches neither locale.
// Database: DB-IP Country Lite (https://db-ip.com, CC BY 4.0) at
// data/geoip/dbip-country-lite.mmdb — see DEPLOY.md. Missing file = geo step
// silently disabled. The proxy runs on the Node.js runtime, so fs is fine.

// Countries where Spanish is the dominant/official language.
const SPANISH_SPEAKING = new Set([
  "ES", "MX", "AR", "CO", "PE", "VE", "CL", "EC", "GT", "CU", "BO", "DO",
  "HN", "PY", "SV", "NI", "CR", "PA", "UY", "PR", "GQ",
]);

let geoReader: Reader<CountryResponse> | null | undefined;

function getGeoReader(): Reader<CountryResponse> | null {
  if (geoReader !== undefined) return geoReader;
  try {
    const dbPath = path.join(
      process.cwd(), "data", "geoip", "dbip-country-lite.mmdb",
    );
    geoReader = new Reader<CountryResponse>(fs.readFileSync(dbPath));
  } catch {
    geoReader = null; // no database on this box → geo tiebreak disabled
  }
  return geoReader;
}

function clientCountry(request: NextRequest): string | null {
  const reader = getGeoReader();
  if (!reader) return null;
  // Behind a single Caddy hop the trustworthy client IP is the rightmost
  // X-Forwarded-For entry (see clientIp). Never the spoofable leftmost token.
  let ip = clientIp(request.headers);
  if (ip === "unknown") return null;
  if (ip.startsWith("::ffff:")) ip = ip.slice(7); // IPv4-mapped IPv6
  try {
    return reader.get(ip)?.country?.iso_code ?? null;
  } catch {
    return null; // malformed IP
  }
}

const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Paths that are intentionally NOT under the localized `app/[lang]` tree:
// API + admin (per CLAUDE.md) and Clerk's own sign-in/up pages.
const NON_LOCALIZED_PREFIXES = ["/api", "/admin", "/sign-in", "/sign-up"];
function isNonLocalized(pathname: string): boolean {
  return NON_LOCALIZED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

// Routes that require a signed-in user. Covers both the locale-prefixed
// dashboard (the normal case) and the bare path (before a locale redirect).
const isProtectedRoute = createRouteMatcher([
  "/(es|en)/dashboard(.*)",
  "/dashboard(.*)",
  "/admin(.*)",
]);

// The post-checkout funnel drops an ACCOUNT-LESS visitor onto the plan reveal
// (checkout/success → /dashboard/reveal). For them "authenticate" means CREATE
// an account, so reveal routes to Clerk's sign-UP screen (which offers a
// "Sign in" link for the rare returning user). Every other protected route is
// returning-user territory and keeps the sign-in default.
const isFunnelSignUpRoute = createRouteMatcher([
  "/(es|en)/dashboard/reveal(.*)",
  "/dashboard/reveal(.*)",
]);

function pickLocale(request: NextRequest): string {
  const cookie = request.cookies.get(COOKIE)?.value;
  if (cookie && isLocale(cookie)) return cookie;

  // Parse Accept-Language ("es-419,es;q=0.9,en;q=0.8") into base codes sorted
  // by q-value (header order as tiebreak), so a stated preference order wins.
  const header = request.headers.get("accept-language") ?? "";
  const prefs = header
    .split(",")
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const q = qParam ? parseFloat(qParam.slice(2)) : 1;
      return {
        base: tag.trim().slice(0, 2).toLowerCase(),
        q: Number.isFinite(q) ? q : 0,
        i,
      };
    })
    .filter((p) => p.base && p.base !== "*")
    .sort((a, b) => b.q - a.q || a.i - b.i);

  for (const p of prefs) if (isLocale(p.base)) return p.base;

  // The visitor listed languages but none we support (e.g. ru-RU only, de-DE
  // only). Tiebreak on location: an IP in a Spanish-speaking country → es
  // (local GeoIP lookup; the IP is not stored and never leaves the server);
  // otherwise English is the likelier match than the Spanish product default.
  // Spanish remains the default only when there is no language signal at all
  // (no header / wildcard-only: bots, curl) — matching the SEO x-default.
  if (prefs.length > 0) {
    const country = clientCountry(request);
    if (country && SPANISH_SPEAKING.has(country)) return "es";
    return "en";
  }
  return defaultLocale;
}

function localeProxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  // API, admin, and Clerk auth pages are not localized — pass them through.
  if (isNonLocalized(pathname)) return NextResponse.next();

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  if (hasLocale) {
    const urlLocale = pathname.split("/")[1];
    // Mirror the cookie onto the request so the root layout's <html lang>
    // is correct on the very first (cold) render of a non-default locale.
    request.cookies.set(COOKIE, urlLocale);
    const res = NextResponse.next({ request });
    res.cookies.set(COOKIE, urlLocale, { path: "/", maxAge: ONE_YEAR });
    return res;
  }

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  url.search = search;
  const res = NextResponse.redirect(url);
  res.cookies.set(COOKIE, locale, { path: "/", maxAge: ONE_YEAR });
  return res;
}

const clerkProxy = clerkMiddleware(async (auth, request) => {
  // Optimistic auth gate for page routes. Route Handlers additionally verify
  // auth themselves via getCurrentUser(), so this is defense-in-depth.
  if (isProtectedRoute(request)) {
    if (isFunnelSignUpRoute(request)) {
      // Funnel landing: send signed-out visitors to sign-UP (account creation),
      // returning to the reveal afterwards so the plan reclaim can run.
      const { userId, redirectToSignUp } = await auth();
      if (!userId) {
        // Behind the reverse proxy `request.url` carries the internal listen
        // address (0.0.0.0:3002), so build the return URL on the canonical
        // public origin instead (build-guarded NEXT_PUBLIC_APP_URL).
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        const returnBackUrl = appUrl
          ? new URL(
              request.nextUrl.pathname + request.nextUrl.search,
              appUrl,
            ).toString()
          : request.url;
        return redirectToSignUp({ returnBackUrl });
      }
    } else {
      await auth.protect();
    }
  }
  return localeProxy(request);
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  // Production uses real Clerk auth only; when no key is present (dev / key-less
  // build) we fall back to the plain locale proxy.
  if (clerkEnabled) {
    return clerkProxy(request, event);
  }
  return localeProxy(request);
}

export const config = {
  matcher: [
    // All page routes (incl. /admin) except Next internals and static assets.
    "/((?!_next/static|_next/image|images|favicon.ico|.*\\..*).*)",
    // API routes — so Clerk attaches request context for getCurrentUser().
    "/api/(.*)",
  ],
};
