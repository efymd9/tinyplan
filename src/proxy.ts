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
import { locales, defaultLocale, isLocale } from "@/lib/i18n/config";

const COOKIE = "tinyplan_locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

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
  const header = request.headers.get("accept-language") ?? "";
  const prefs = header
    .split(",")
    .map((p) => p.split(";")[0].trim().slice(0, 2).toLowerCase());
  for (const p of prefs) if (isLocale(p)) return p;
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
        return redirectToSignUp({ returnBackUrl: request.url });
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
