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

  // ── Billing preflight ────────────────────────────────────────────────────
  // When real Stripe billing is configured, the webhook MUST be able to verify
  // signatures (else every event is rejected and no subscription ever activates)
  // and the paywall bypass must be off (a real key + bypass is contradictory).
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
  const paywallBypassed = process.env.DEV_BYPASS_PAYWALL === "true";

  if (stripeConfigured) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error(
        "[tinyplan] STRIPE_WEBHOOK_SECRET is required in production when " +
          "STRIPE_SECRET_KEY is set — webhook signature verification fails " +
          "without it and subscriptions never activate.",
      );
    }
    if (paywallBypassed) {
      // Sandbox rehearsal (sk_test_…) is a legitimate staging posture: the
      // funnel shows the REAL Stripe checkout page (test cards only, no real
      // charges) while the subscription gate stays OPEN, so fresh sign-ups —
      // whose webhook events arrive before their local user exists — are not
      // locked out of the dashboard. A LIVE key with the bypass is still
      // contradictory (real charges + open paywall) and aborts startup.
      if (process.env.STRIPE_SECRET_KEY!.startsWith("sk_test")) {
        console.warn(
          "[tinyplan] SANDBOX BILLING REHEARSAL: STRIPE_SECRET_KEY is a TEST " +
            "key and DEV_BYPASS_PAYWALL=true — checkout uses the real Stripe " +
            "TEST page (test cards only), the subscription gate stays OPEN. " +
            "Switch to live keys AND remove DEV_BYPASS_PAYWALL to enforce billing.",
        );
      } else {
        throw new Error(
          "[tinyplan] DEV_BYPASS_PAYWALL=true with a LIVE STRIPE_SECRET_KEY is " +
            "contradictory: billing is live but the paywall is forced open. " +
            "Unset DEV_BYPASS_PAYWALL to enforce billing.",
        );
      }
    }
  } else if (paywallBypassed) {
    // No Stripe key + explicit bypass = the soft-launch posture. Allowed, but
    // make it impossible to miss in the logs that the paywall is OPEN.
    console.warn(
      "[tinyplan] DEV_BYPASS_PAYWALL=true — the subscription paywall is " +
        "intentionally OPEN. The entire /dashboard is reachable without an " +
        "active subscription. Unset it (and configure Stripe) to enforce billing.",
    );
  }
}
