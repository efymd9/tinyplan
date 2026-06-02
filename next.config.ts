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

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
