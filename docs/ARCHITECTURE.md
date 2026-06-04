# TinyPlan Architecture

How the pieces fit together. For routes, env vars, and conventions see [`README.md`](../README.md) and [`CLAUDE.md`](../CLAUDE.md); for hosting see [`DEPLOY.md`](../DEPLOY.md).

## Overview

TinyPlan is a Next.js 16 (App Router, React 19) app. A parent takes a **20-screen quiz** (no email or child-name capture — no child PII anywhere), which produces a **TagProfile** and a **play profile**; from those, a **deterministic engine** generates a 7-day activity plan that is stored in English and **re-localized at render time**. Auth is **Clerk**; data is **local-file SQLite** (better-sqlite3, WAL). The whole stack degrades gracefully without API keys (mock Stripe, console email, stub AI, first-party analytics), which is what makes local dev keyless. Billing is **fully built but enforcement is OFF during the soft launch** (mock checkout; the paywall gate is a no-op).

```
Browser ──▶ src/proxy.ts ──▶ App Router (app/[lang]/…, /admin, /api/…)
              │  (1) Clerk middleware: auth.protect() on /dashboard, /admin
              │      — except /dashboard/reveal → redirectToSignUp (funnel)
              │  (2) locale redirect: / → /{es|en}, tinyplan_locale cookie
              ▼
        getCurrentUser()  ──▶  Clerk session ──▶ local users row (SQLite)
                                                   │ UUID = FK for every table
        quiz → TagProfile → plan-generator → plans.plan_json (English)
                                                   │
                                  localizePlan(plan, locale) at render
```

## 1. Request lifecycle — `src/proxy.ts`

`src/proxy.ts` is the Next.js 16 **Proxy** (the rename of `middleware.ts`). At module load it computes `clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`. The default export branches:

- **Clerk enabled** → runs `clerkMiddleware(async (auth, request) => { if (isProtectedRoute(request)) await auth.protect(); return localeProxy(request); })`. So a single request gets Clerk context attached **and** the locale redirect.
- **Clerk disabled** → runs only `localeProxy` (preserving the `DEV_BYPASS_AUTH` dev flow).

`isProtectedRoute = createRouteMatcher(['/(es|en)/dashboard(.*)', '/dashboard(.*)', '/admin(.*)'])` — covers both locale-prefixed and bare paths. `auth.protect()` is **optimistic / defense-in-depth**: route handlers and the dashboard layout re-verify via `getCurrentUser()`.

**Funnel exception** (`isFunnelSignUpRoute = ['/(es|en)/dashboard/reveal(.*)', '/dashboard/reveal(.*)']`): the post-checkout funnel drops an *account-less* visitor onto `/dashboard/reveal`, so for that one route "authenticate" means **create an account**. A signed-out visitor there is sent to Clerk's **sign-UP** (`redirectToSignUp`) instead of `auth.protect()`'s sign-in. Because the app sits behind Caddy, `request.url` carries the internal listen address (`0.0.0.0:3002`), so the `returnBackUrl` is rebuilt on the canonical `NEXT_PUBLIC_APP_URL`. Every other protected route keeps `auth.protect()` (returning-user → sign-in).

`localeProxy`: passes through `NON_LOCALIZED_PREFIXES` (`/api`, `/admin`, `/sign-in`, `/sign-up`); if the path already starts with a locale it mirrors the `tinyplan_locale` cookie onto request + response; otherwise it `pickLocale` (cookie → `Accept-Language` base codes sorted by q-value → `en` when languages are listed but none match → `defaultLocale` `'es'` only with no language signal) and **307-redirects** to `/{locale}{path}`, setting the cookie (1-year).

`config.matcher` covers all page routes (minus `_next/*`, images, favicon, any path with a dot) **plus** `/api/(.*)` — the API entry exists so Clerk attaches request context, enabling `getCurrentUser()` inside route handlers. (`auth.protect()` still only fires for the three `isProtectedRoute` matchers.)

## 2. Authentication

**Clerk** is the production auth provider; the legacy magic-link code is a key-less fallback only.

- `getCurrentUser()` (`src/lib/auth/magic-link.ts`, memoized per request with React `cache`):
  1. If `DEV_BYPASS` (`DEV_BYPASS_AUTH==='true'` **and** `NODE_ENV!=='production'`) → return a fixed `DEV_USER`.
  2. If `!clerkEnabled` → return `null`.
  3. `const { userId } = await auth()`; if none → `null`.
  4. `const clerkUser = await currentUser()`; take the primary email.
  5. Look up `users` by email → return the mapped `AuthUser`, **or** provision a new `users` row (UUID id, email, name, `subscription_status:'free'`) and return it.

  The **local UUID** — not the Clerk id — is the foreign key every other table references.

- **Admin gating** (`src/lib/auth/admin.ts`): `requireAdmin()` calls `getCurrentUser()`, redirects anon users to `/sign-in` (or `/auth/login` when Clerk is off), and redirects non-allowlisted users to `/dashboard/today`. It is **fail-closed** — an empty `ADMIN_EMAILS` denies everyone. Used by all three `/admin/*` pages.

- **Disabled legacy path**: `/api/auth/request` and `/api/auth/verify` early-return **HTTP 410** when `clerkEnabled` (otherwise they'd mint orphan users / set an ignored `tinyplan-session` cookie). The jose helpers (`createMagicLinkToken`, `verifySessionToken`, `sessionCookieOptions`, signed with `AUTH_SECRET`) still exist for the fallback. The `auth_tokens` table is defined but never used.

- **Startup / build guards**:
  - `src/instrumentation.ts` `register()` runs only on the Node runtime, not during build, only in production (skippable with `SKIP_ENV_VALIDATION`) — **throws** if `clerkEnabled` but `CLERK_SECRET_KEY` is missing (else every route 500s), and warns on empty `ADMIN_EMAILS`.
  - `next.config.ts` runs a **build-time** guard (production && !`SKIP_ENV_VALIDATION`) that throws unless `NEXT_PUBLIC_APP_URL` is `https://…` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is `pk_…` (both are inlined into the bundle at build).

- **UI**: `src/app/sign-in/[[...sign-in]]` and `sign-up/` render Clerk's `<SignIn/>`/`<SignUp/>` (force-dynamic, non-localized). The root layout (`src/app/layout.tsx`) wraps the tree in `<ClerkProvider>` only when `clerkEnabled`.

## 3. Data layer — `src/lib/db`

`src/lib/db/index.ts` exposes `getDb()`, a lazy singleton: `DB_PATH = <cwd>/data/tinyplan.db`; on first call it `mkdir -p`s `data/`, opens better-sqlite3, sets `journal_mode=WAL` + `foreign_keys=ON`, runs `createTables()` (one `exec` of `CREATE TABLE IF NOT EXISTS` for all 9 tables + 3 analytics indexes), then `migrateSchema()` (additive `ALTER TABLE ADD COLUMN` for `analytics_events` columns since `CREATE IF NOT EXISTS` never alters), then wraps it in Drizzle.

So the **schema materializes at first request** — there is no migration step (`drizzle-kit push` is available but not required). `closeDb()` resets the singleton (checkpointing the WAL on graceful shutdown).

**Data-deletion CLI** (`deploy/delete-user.sh` → `scripts/delete-user.mjs`): an FK-safe purge for GDPR/CCPA requests. It resolves a user by email or id, `--dry-run` counts every row that would be deleted, and the live run removes the user plus their `plans`, `plan_day_logs`, `payments`, `analytics_events`, and `quiz_sessions` (following both `quiz_sessions.user_id` and the `plans.quiz_session_id` link, since the anonymous funnel often leaves `quiz_sessions.user_id` NULL). It touches **local data only** — the operator must also delete the user in Clerk.

**9 tables** (`src/lib/db/schema.ts`): `users` (carries `stripe_customer_id`), `auth_tokens` (unused), `quiz_sessions`, `activities`, `plans` (`user_id` is nullable — anonymously-generated plans start unowned, then get adopted; see §7), `plan_day_logs`, `payments` (written by the Stripe webhook once billing is live — keyed on the invoice id in `stripe_session_id` for idempotency), `weekly_checkins`, `analytics_events`. All IDs are text UUIDs; timestamps are Unix integers (`analytics_events.created_at` is **ms**); complex values are JSON text columns parsed at read time. The `activities` table ships **empty** — read paths fall back to in-code `FALLBACK_ACTIVITIES`.

## 4. Quiz → TagProfile → plan engine

1. **Quiz** (`src/lib/quiz/questions.ts` + `.en.ts`/`.es.ts`): 20 `QuizScreen`s — no email-capture and no child-name screen (`ScreenType` is `single | multiple | loading | affirmation | micro-insight | preview`; the quiz collects no email and no child PII). Locales share structure/option-ids/tags; only text differs. `getQuestions(locale)` / `getVisibleScreensForLocale` select per locale. Quiz state persists to localStorage under `STATE_VERSION=6` (`src/components/quiz/quiz-shell.tsx`).
2. `POST /api/quiz/submit` builds a `TagProfile` via `buildTagProfile(answers)` (`src/lib/quiz/tags.ts`) and stores a `quiz_sessions` row. `tags.ts` maps answers → `play_style` → one of **6 `play_profile`s** (default `connection-seeker`) → `primary_goal`, `plan_style`, and booleans (`is_low_time`, `needs_scripts`, …). It also holds the EN/ES display-string maps.
3. `POST /api/plan/generate` loads the `activities` table (or `FALLBACK_ACTIVITIES` if empty), calls `generateWeeklyPlan`, deactivates the user's prior active plans, and inserts a `plans` row with `plan_json` (**always English**).
4. **`src/lib/engine/plan-generator.ts`**: `filterByAge` → low-time preference → `seededShuffle(pool, seed)` where `seed = ${primary_goal}-${play_style}-${age_range}` (Fisher-Yates over an LCG — fully **deterministic**) → selects goal/play-style/routine/bonding activities across 7 days; also `deriveRoutine()` and a quiz summary.
5. **Render-time localization** — `src/lib/engine/localize-plan.ts` `localizePlan(plan, locale)`: returns the plan unchanged for `en`; for `es` it rebuilds a catalog from `getFallbackActivities('es')` keyed by **stable activity id**, re-derives every text field (with English fallback for unknown ids), and re-localizes the profile/goal/moment/style displays, the routine, and the quiz summary. Toggling EN/ES therefore re-localizes existing plans with no regeneration.

## 5. Internationalization

- `src/lib/i18n/config.ts` is **edge-safe** (imported by `proxy.ts`, no dictionary imports): `locales=['es','en']`, `defaultLocale='es'`, `isLocale`/`resolveLocale`.
- `en.ts` + `es.ts` are typed nested dictionaries (`Dictionary` derived from `en`, so a missing key is a compile error); `index.ts` exposes `getDictionary(locale)` (+ `t()` alias).
- `href.ts`: `localizeHref(href, locale)` prefixes app-internal paths and leaves `/api`, `/admin`, external/hash/mailto alone; `switchLocalePath` swaps the locale segment for the switcher.
- Server components read `params.lang`; client components use `useLocale()`/`useT()` from `src/components/i18n/locale-provider.tsx`. The root layout sets `<html lang>` from the cookie; `app/[lang]/layout.tsx` validates the segment (`notFound()` on unknown), `generateStaticParams` over locales, and mounts `LocaleProvider`.
- Larger **content** (not chrome) comes from locale-keyed getters mirroring the quiz: `getSosScripts`, `getGrowthPath`, `localizeRoutine`, `localizeParentTool`, `getFallbackActivities`. IDs/tags/enum codes are identical across locales so all engine logic is language-independent.
- The ES/EN **language switcher** (`src/components/language-switcher.tsx`) is now rendered **inline in each public header** (landing/quiz `sm+`/pricing/privacy/terms/result) and in the dashboard header. The former floating fixed top-right overlay in `(site)/layout.tsx` was removed (it covered header buttons on mobile).

## 6. Providers with no-key fallbacks

All four degrade gracefully when their API key is absent:

- **Stripe** (`src/lib/payments/stripe.ts`): `createCheckoutSession` — no key **and** `NODE_ENV==='production'` **and** `DEV_BYPASS_PAYWALL!=='true'` → **throws**; otherwise no key → a **mock** result that redirects straight to success; with a key → a real subscription checkout (a $1 one-off line item `unit_amount:100` + a $14.99 recurring price with `trial_period_days:7`, carrying `metadata.userId/quizSessionId`). `createBillingPortalSession` backs `/api/billing/portal`. `verifyWebhookSignature()` **is now consumed** by `POST /api/webhooks/stripe` (see §8).
- **Email** (`src/lib/email/index.ts`): `ResendEmailProvider` if `RESEND_API_KEY`, else `ConsoleEmailProvider` (logs only). EN/ES templates exist; none are sent at runtime in the Clerk production path.
- **AI** (`src/lib/engine/ai-adapter.ts`): switches on `AI_PROVIDER` but only `StubAIAdapter` is implemented (returns inputs unchanged / canned strings).
- **Analytics** (`src/lib/analytics/events.ts`): first-party only. Server `track()` inserts into `analytics_events`; the client hook POSTs to `/api/analytics`, tagging events with a random localStorage id (`tinyplan_anon_id`, `src/lib/analytics/session.ts`). The `AnalyticsEvent` union covers the funnel (`quiz_started/_step_viewed/_step_answered/_completed`, `cta_clicked`, `mini_result_viewed`, `paywall_viewed`, `checkout_started`, `purchase_completed`, `plan_revealed`, `day1_started`, `activity_completed`, `weekly_checkin_completed`, `page_viewed`) — there is **no `email_submitted` event** (removed with the email screen). No third-party SDK.

## 7. The checkout → reveal → reclaim funnel

The funnel is **anonymous-first**: the plan is generated *before* the visitor has an account, then **adopted** once they sign up. This is the load-bearing sequence — it lets a parent see their plan immediately and only create an account to keep it.

```
/result ──(checkout_started)──▶ POST /api/checkout ──▶ Stripe/mock URL
   │                                                       │
   │  soft launch: DEV_BYPASS_PAYWALL=true + no key → MOCK redirect ↓
   ▼
/checkout/success (client)
   • reads quiz answers from sessionStorage (tinyplan_quiz_result)
   • POST /api/plan/generate  → plan persisted ANONYMOUSLY (user_id=NULL)
   • stash planId in localStorage "tinyplan_pending_plan_id"
   • fire purchase_completed  ← ONLY after a confirmed generation, not on landing
   • router → /dashboard/reveal
        │
        ▼  proxy: signed-out visitor on the reveal route → Clerk SIGN-UP
        ▼  (returnBackUrl on NEXT_PUBLIC_APP_URL) → back to reveal after sign-up
   dashboard layout mounts <PlanReclaimer>
        • POST /api/plan/reclaim { planId } → adopts the unowned plan
        • clears the key, router.refresh()
   reveal renders <PendingPlanGate> spinner while the reclaim is in flight
        • pending id present → spinner, wait for refresh to surface the plan
        • absent → genuinely nothing to set up → redirect to /quiz
```

- **`POST /api/checkout`** reads `{ answers, email? }` and calls `getCurrentUser()` (falling back to a fresh UUID if anonymous — checkout does **not** require auth). The funnel **no longer sends an email**; the param is still accepted, but once billing is live Stripe Checkout collects the payer's email natively. Builds `successUrl`/`cancelUrl` from `NEXT_PUBLIC_APP_URL` + locale; returns a Stripe (or mock) URL.
- **`POST /api/plan/generate`** builds the `TagProfile`, generates the plan, and inserts a `plans` row with `user_id = current user or NULL`. The same generation path serves both the signed-in case and the anonymous funnel case.
- **`POST /api/plan/reclaim`** (auth required) adopts a plan **only** if it exists, `user_id IS NULL`, and it was created within the last **24h** (`RECLAIM_WINDOW_SECONDS`). It deactivates the user's other active plans, sets `user_id` + `active=1`, and guards the update on `user_id IS NULL` so concurrent reclaims can't both win. Already-owned → idempotent success; owned by someone else → 403; stale → 404.
- **`<PlanReclaimer>`** (dashboard layout, `src/components/dashboard/plan-reclaimer.tsx`) fires the reclaim at most once per page load (module-level latch survives Strict-Mode double-mount) and clears the key on any outcome to avoid retry loops. **`<PendingPlanGate>`** (same file, used by the reveal page) shows the spinner while a reclaim is pending instead of bouncing to `/quiz`.

The other auth-required mutation is `POST /api/dashboard/log` (verifies the plan belongs to the user).

## 8. Billing (built; enforcement OFF during soft launch)

The full subscription system exists but is **dormant** under the soft launch (no `STRIPE_SECRET_KEY`, `DEV_BYPASS_PAYWALL=true`). The `$1-for-7-days → $14.99/month` model was validated end-to-end in Stripe test mode with a test clock: $1.00 charged at checkout (the `subscription_create` invoice), $14.99 at trial end (`subscription_cycle`), then status `active`.

- **`isBillingEnforced()`** (`src/lib/auth/subscription.ts`) = `STRIPE_SECRET_KEY` set **and** `DEV_BYPASS_PAYWALL !== 'true'`. **`requireActiveSubscription(user, lang)`** is called in the dashboard layout but is a **no-op** while billing is not enforced (gate OPEN — nobody is locked out); once enforced it redirects non-subscribers (`subscription_status` not `trial`/`active`) to `/pricing`.
- **`POST /api/webhooks/stripe`** (`force-dynamic`, reads the raw body) verifies the signature via `verifyWebhookSignature` (needs `STRIPE_WEBHOOK_SECRET`). It maps Stripe statuses → local enum (`trialing → trial`; `active`/`past_due → active`; `canceled`/`unpaid`/`incomplete_expired → cancelled`), resolves the local user by `metadata.userId` then lowercased email (tolerating unknown users with a 200), writes `payments` rows **idempotently** keyed on the invoice id, and stores `stripe_customer_id`.
- **`POST /api/billing/portal`** (auth required) + **`<ManageSubscriptionButton>`** in the dashboard header open a Stripe Billing Portal session; returns 400 when Stripe is unconfigured or the user has no `stripe_customer_id` yet (soft-launch users who never paid).
- **Preflight** (`src/instrumentation.ts`, production only): `STRIPE_SECRET_KEY` set ⇒ `STRIPE_WEBHOOK_SECRET` required (**throw** if missing); key + `DEV_BYPASS_PAYWALL=true` ⇒ **throw** (contradiction); bypass alone (the soft-launch posture) ⇒ a loud **warn** that the paywall is open.

## 9. Error handling & resilience

App Router error/empty boundaries keep a corrupt input or a thrown render from 500-ing the whole page:

- `src/app/global-error.tsx` (root shell crash) + `src/app/[lang]/error.tsx` (segment errors).
- `src/app/not-found.tsx` + `src/app/[lang]/not-found.tsx`; `src/app/[lang]/dashboard/loading.tsx` skeleton.
- **`parseWeeklyPlan(planJson, planId?)`** (`src/lib/dashboard/helpers.ts`) returns `WeeklyPlan | null` — a corrupt or `days`-less `plan_json` **degrades to "no plan"** (logged, then handled like an absent plan) instead of throwing.

## 10. SEO & metadata

- **File-convention assets**: `src/app/robots.ts`, `src/app/sitemap.ts` (both locales, hreflang clusters, `x-default → es`), `src/app/icon.svg` + `src/app/apple-icon.tsx` (the static `favicon.ico` was deleted), and `src/app/[lang]/opengraph-image.tsx` (rendered via `next/og`).
- **Metadata**: `metadataBase` + complete OpenGraph/Twitter blocks live in the root and `[lang]` layouts; canonical + `x-default` alternates on landing/quiz/pricing/privacy/terms. The pricing page is split into a server `page.tsx` (metadata) + `pricing-client.tsx`.
- **Gotcha — Next metadata merging is SHALLOW**: a child segment's `openGraph` object *replaces* the parent's entirely rather than deep-merging. `[lang]/layout.tsx` re-declares the full `openGraph` so child pages inherit a complete object; pages that set their own `openGraph` must include every field they need. (See the note at the top of `src/app/[lang]/layout.tsx`.)
