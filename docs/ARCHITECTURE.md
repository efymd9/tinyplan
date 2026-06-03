# TinyPlan Architecture

How the pieces fit together. For routes, env vars, and conventions see [`README.md`](../README.md) and [`CLAUDE.md`](../CLAUDE.md); for hosting see [`DEPLOY.md`](../DEPLOY.md).

## Overview

TinyPlan is a Next.js 16 (App Router, React 19) app. A parent takes a **22-screen quiz**, which produces a **TagProfile** and a **play profile**; from those, a **deterministic engine** generates a 7-day activity plan that is stored in English and **re-localized at render time**. Auth is **Clerk**; data is **local-file SQLite** (better-sqlite3, WAL). The whole stack degrades gracefully without API keys (mock Stripe, console email, stub AI, first-party analytics), which is what makes local dev keyless.

```
Browser ──▶ src/proxy.ts ──▶ App Router (app/[lang]/…, /admin, /api/…)
              │  (1) Clerk middleware: auth.protect() on /dashboard, /admin
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

`localeProxy`: passes through `NON_LOCALIZED_PREFIXES` (`/api`, `/admin`, `/sign-in`, `/sign-up`); if the path already starts with a locale it mirrors the `tinyplan_locale` cookie onto request + response; otherwise it `pickLocale` (cookie → first 2 chars of `Accept-Language` → `defaultLocale` `'es'`) and **307-redirects** to `/{locale}{path}`, setting the cookie (1-year).

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

**9 tables** (`src/lib/db/schema.ts`): `users`, `auth_tokens` (unused), `quiz_sessions`, `activities`, `plans`, `plan_day_logs`, `payments` (unwritten — no webhook), `weekly_checkins`, `analytics_events`. All IDs are text UUIDs; timestamps are Unix integers (`analytics_events.created_at` is **ms**); complex values are JSON text columns parsed at read time. The `activities` table ships **empty** — read paths fall back to in-code `FALLBACK_ACTIVITIES`.

## 4. Quiz → TagProfile → plan engine

1. **Quiz** (`src/lib/quiz/questions.ts` + `.en.ts`/`.es.ts`): 22 `QuizScreen`s. Locales share structure/option-ids/tags; only text differs. `getQuestions(locale)` / `getVisibleScreensForLocale` select per locale.
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

## 6. Providers with no-key fallbacks

All four degrade gracefully when their API key is absent:

- **Stripe** (`src/lib/payments/stripe.ts` `createCheckoutSession`): no key **and** `NODE_ENV==='production'` **and** `DEV_BYPASS_PAYWALL!=='true'` → **throws**; otherwise no key → a **mock** result that redirects straight to success; with a key → a real subscription checkout ($1 `unit_amount:100` + $14.99 recurring, `trial_period_days:7`, `metadata.userId/quizSessionId`). `verifyWebhookSignature()` exists but is **unused** — no webhook route consumes it.
- **Email** (`src/lib/email/index.ts`): `ResendEmailProvider` if `RESEND_API_KEY`, else `ConsoleEmailProvider` (logs only). EN/ES templates exist; none are sent at runtime in the Clerk production path.
- **AI** (`src/lib/engine/ai-adapter.ts`): switches on `AI_PROVIDER` but only `StubAIAdapter` is implemented (returns inputs unchanged / canned strings).
- **Analytics** (`src/lib/analytics/events.ts`): first-party only. Server `track()` inserts into `analytics_events`; the client hook POSTs to `/api/analytics`. No third-party SDK.

## 7. Payments flow (and the gap)

`POST /api/checkout` reads `{email, answers}`, calls `getCurrentUser()` (falling back to a fresh UUID + posted email if anonymous — so checkout does **not** require auth), builds `successUrl`/`cancelUrl` from `NEXT_PUBLIC_APP_URL` + locale, and returns a Stripe (or mock) URL. The client redirects to it.

The success page (`app/[lang]/(site)/checkout/success/page.tsx`, client) fires `purchase_completed` analytics, reads the quiz answers from `sessionStorage`, POSTs them to `/api/plan/generate` to build + persist the plan, then routes to `/dashboard/reveal`.

> **⚠️ There is no Stripe webhook.** Payment success is inferred purely client-side from landing on the success URL. `users.subscription_status` is only ever written as `'free'` (at provision time), never advanced to `trial`/`active`, and the `payments` table is never written. Real billing requires adding the webhook + fulfillment (see [`DEPLOY.md`](../DEPLOY.md) → "Going live with real billing"). The only auth-required mutation today is `POST /api/dashboard/log` (verifies the plan belongs to the user).
