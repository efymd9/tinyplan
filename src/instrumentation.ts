// Production preflight — runs once at server start (Next.js `instrumentation`
// file convention). Fails fast on misconfiguration that would otherwise 500
// every request, instead of you discovering it from user reports.
export async function register() {
  // Only the Node.js server runtime; never the Edge runtime.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // Don't run during `next build` (env may be partial there); only at start.
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  // Dev/test have their own defaults and bypasses.
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.SKIP_ENV_VALIDATION) return;

  const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // @clerk/nextjs reads CLERK_SECRET_KEY at request time; without it every route
  // 500s. The app's auth gate keys off the publishable key alone, so a
  // publishable-but-no-secret deploy is the dangerous case — abort at startup.
  if (clerkEnabled && !process.env.CLERK_SECRET_KEY) {
    throw new Error(
      "[tinyplan] CLERK_SECRET_KEY is required in production when " +
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set. Add it to .env.production.",
    );
  }

  // /admin is fail-closed: an empty ADMIN_EMAILS locks out every admin. That is
  // safe (not an exposure) but usually a mistake — warn loudly.
  if (!(process.env.ADMIN_EMAILS || "").trim()) {
    console.warn(
      "[tinyplan] ADMIN_EMAILS is empty — the /admin dashboard will be " +
        "inaccessible to everyone. Set a comma-separated allowlist to enable it.",
    );
  }
}
