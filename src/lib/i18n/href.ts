// src/lib/i18n/href.ts
import { type Locale, isLocale } from "./config";

/** Prefix an app-internal path with the locale. Leaves api/admin/external alone. */
export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/")) return href; // external / hash / mailto
  if (href.startsWith("/api") || href.startsWith("/admin")) return href;
  const firstSeg = href.split("/")[1] ?? "";
  if (isLocale(firstSeg)) {
    const rest = href.slice(firstSeg.length + 1); // drop "/xx"
    return `/${locale}${rest}`;
  }
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

/** Replace (or add) the locale segment of a live pathname for the switcher. */
export function switchLocalePath(pathname: string, locale: Locale): string {
  const parts = pathname.split("/");
  if (isLocale(parts[1])) {
    parts[1] = locale;
    return parts.join("/") || `/${locale}`;
  }
  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}
