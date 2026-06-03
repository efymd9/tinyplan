import type { MetadataRoute } from "next";

// Canonical production origin (mirrors the resolution in app/layout.tsx).
const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://tinyplan.org";

// Public, indexable pages. Each is served under both locale prefixes; the
// es URL is the canonical/default (x-default) per the Spanish-default design.
// Auth-gated (/dashboard), /admin, /api, /sign-in, /sign-up, and transient
// flow pages (/result, /checkout) are intentionally excluded.
const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/quiz", priority: 0.9, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PAGES.flatMap(({ path, priority, changeFrequency }) => {
    const esUrl = `${siteUrl}/es${path}`;
    const enUrl = `${siteUrl}/en${path}`;
    const alternates = {
      languages: {
        es: esUrl,
        en: enUrl,
        "x-default": esUrl,
      },
    };

    // Emit one <url> entry per locale; both carry the full hreflang cluster so
    // crawlers can resolve the language pair from either side.
    return [
      { url: esUrl, lastModified, changeFrequency, priority, alternates },
      { url: enUrl, lastModified, changeFrequency, priority, alternates },
    ];
  });
}
