import type { NextConfig } from "next";

// Build-time env validation. NEXT_PUBLIC_* values are inlined at `next build`
// and CANNOT be changed by setting env at runtime, so a misconfigured prod
// build must fail loudly here rather than silently ship localhost links or a
// broken Clerk key. Bypass for non-deploy prod builds with SKIP_ENV_VALIDATION=1.
if (process.env.NODE_ENV === "production" && !process.env.SKIP_ENV_VALIDATION) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  if (!appUrl.startsWith("https://")) {
    throw new Error(
      "[tinyplan] NEXT_PUBLIC_APP_URL must be your https:// production URL " +
        "(e.g. https://tinyplan.org) at build time. It is inlined into the bundle " +
        "and drives email/checkout links and the cookie Secure flag. " +
        "Set it in .env.production, or pass SKIP_ENV_VALIDATION=1 to bypass.",
    );
  }
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  if (!clerkKey.startsWith("pk_")) {
    throw new Error(
      "[tinyplan] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (pk_live_… / pk_test_…) must " +
        "be present at build time — it is inlined into the client and server bundles. " +
        "Set it in .env.production, or pass SKIP_ENV_VALIDATION=1 to bypass.",
    );
  }
}

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "form-action 'self' https://checkout.stripe.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.tinyplan.org",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.tinyplan.org https://js.stripe.com https://partnernetwork.space",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.tinyplan.org https://api.stripe.com https://partnernetwork.space",
      "frame-src https://*.clerk.accounts.dev https://*.clerk.com https://clerk.tinyplan.org https://js.stripe.com https://checkout.stripe.com",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // The landing/illustrations are ~1.4MB PNGs optimized per-request by sharp IN
    // the single Node process. Default TTL is 4h, so under sustained ad traffic
    // the optimizer keeps re-running and re-revalidating. 31 days means each
    // variant is generated once, then served from cache — keeping sharp CPU off
    // the hot path that also runs the synchronous SQLite writes.
    minimumCacheTTL: 2678400, // 31 days
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Long-cache the raw brand assets (stable filenames) so browsers/any CDN
        // and the image optimizer's upstream fetch stop re-pulling 1.4MB PNGs
        // through Node on every cold visit.
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000" }, // 30 days
        ],
      },
    ];
  },
};

export default nextConfig;
