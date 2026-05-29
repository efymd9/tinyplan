// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, isLocale } from "@/lib/i18n/config";

const COOKIE = "tinyplan_locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

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

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  if (hasLocale) {
    const urlLocale = pathname.split("/")[1];
    const res = NextResponse.next();
    if (request.cookies.get(COOKIE)?.value !== urlLocale) {
      res.cookies.set(COOKIE, urlLocale, { path: "/", maxAge: ONE_YEAR });
    }
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

export const config = {
  // Exclude api, admin, Next internals, public assets, and any file with an extension.
  matcher: ["/((?!api|admin|_next/static|_next/image|images|favicon.ico|.*\\..*).*)"],
};
