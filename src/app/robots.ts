import type { MetadataRoute } from "next";

// Canonical production origin (mirrors the resolution in app/layout.tsx).
const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://tinyplan.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Auth-gated, admin, API, and Clerk hosted-auth surfaces should never be
      // indexed. Locale-prefixed dashboard paths are covered by the wildcards.
      disallow: [
        "/dashboard",
        "/*/dashboard",
        "/admin",
        "/api",
        "/sign-in",
        "/sign-up",
        "/*/auth/",
        "/*/checkout/",
        "/*/result",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
