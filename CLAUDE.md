@AGENTS.md

# TinyPlan

Personalised play and routine planning app for parents of children aged 2-6. Parents take a 20-screen quiz, receive a play profile (one of 6 types), and get a deterministic 7-day activity plan with parent scripts, materials, and step-by-step guidance. Subscription model: $1 for 7 days, then $14.99/month via Stripe. Bilingual: **Spanish (default)** + English.

**Live:** https://tinyplan.org — see [DEPLOY.md](DEPLOY.md) for how it is hosted, [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system design.

## Commands

```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build (includes type checking)
npm run start        # Production server (next start)
npm run lint         # ESLint
```

> The SQLite schema is created and migrated **at runtime** on first DB access (`createTables()` / `migrateSchema()` in `src/lib/db/index.ts`) — there is **no migration step** in dev or deploy. `drizzle-kit` is available for tooling but is not required to run the app.

## Stack

- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS 4
- SQLite (better-sqlite3, WAL mode) + Drizzle ORM — single local file at `data/tinyplan.db`
- **Auth: Clerk** (`@clerk/nextjs`). A legacy jose/JWT magic-link flow remains, but only as a key-less **dev fallback** (its API routes return 410 when Clerk is enabled).
- Stripe subscriptions (mock fallback when key absent). Webhook at `POST /api/webhooks/stripe` advances `subscription_status`; the dashboard subscription gate (`requireActiveSubscription` in `src/lib/auth/subscription.ts`) is a **no-op while billing is not enforced** (`DEV_BYPASS_PAYWALL=true` or no `STRIPE_SECRET_KEY` — the soft-launch posture) and enforces once real Stripe keys are configured. The `$1-for-7-days → $14.99/mo` checkout model is validated in Stripe test mode ($1 charged at checkout, $14.99 at trial end).
- Email: Resend (console fallback when key absent) — not used at runtime in production (Clerk sends auth email)
- i18n: Spanish (default) + English under `app/[lang]/`; in-repo typed dictionary (no library); `src/proxy.ts` locale redirect
- Analytics: first-party events to SQLite (**no PostHog / third-party SDK**)

## Coding Conventions

- Server components by default; add `"use client"` only when needed
- Database: Drizzle ORM with SQLite. Schema in `src/lib/db/schema.ts` (**9 tables**). All IDs are UUID text. Timestamps are Unix integers (note: `analytics_events.created_at` is **milliseconds**).
- **Auth:** `getCurrentUser()` from `src/lib/auth/magic-link.ts` resolves the **Clerk** session (`auth()` / `currentUser()`) and maps the Clerk email onto a local `users` row (provisioning one on first sign-in); it returns `null` when signed out. That local row's UUID — not the Clerk id — is the foreign key every other table references. Protected pages/layouts redirect to `/sign-in` (only falling back to the legacy `/auth/login` when Clerk is disabled). Admin pages call `requireAdmin()` from `src/lib/auth/admin.ts`, which is **fail-closed** against `ADMIN_EMAILS` (empty allowlist denies everyone).
- `clerkEnabled` (`= NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set) is the master switch for all auth branching. When false (local dev / key-less build), `getCurrentUser()` returns `null` unless `DEV_BYPASS_AUTH=true` (honored **only** outside production) returns a fixed dev user.
- Complex objects (quiz answers, tag profiles, plans) are stored as JSON text columns and parsed at read time.
- Provider pattern with fallbacks: Stripe (mock), Resend (console), AI adapter (stub). Analytics is first-party SQLite only.
- Quiz state is persisted to localStorage on the client for recovery across page reloads. The funnel hands off via sessionStorage `tinyplan_quiz_result` (answers, read by result/checkout/success) and localStorage `tinyplan_pending_plan_id` (the anonymously generated plan id, adopted after sign-in by the reclaimer).
- Plan generation uses a deterministic seeded shuffle (Fisher-Yates) so the same inputs produce the same plan.
- **i18n (default Spanish):** All user-facing pages live under `app/[lang]/`. Get the locale from `params.lang` (server) or `useLocale()`/`useT()` (client) — never hardcode user-facing strings. Short chrome comes from the typed dictionary (`getDictionary(locale)`, `src/lib/i18n/en.ts` + `es.ts`); larger content from locale-keyed getters (`getQuestions`, `getSosScripts`, `getGrowthPath`, `getFallbackActivities`, `localizeRoutine`, `localizeParentTool`). Keep IDs/tags/enum codes identical across locales so logic stays language-independent. The DB stays English — stored plans are re-localized at render by `localizePlan(plan, locale)`. `/admin` and `/api/*` are NOT localized. Internal links/redirects must go through `localizeHref(path, locale)`.

## Product Guardrails

- **Not therapy or diagnosis.** Activities are play-based enrichment. Never claim to diagnose, treat, or cure.
- **No medical advice.** SOS scripts are general parenting guidance, not professional advice.
- **No child PII.** Only parent email is collected. Child age is stored as a range, never a birthdate. No child names, photos, or location data.
- **COPPA:** App is parent-facing. Children never interact with it directly. No data collected from children under 13.
- **Privacy (UK GDPR, CCPA, PIPEDA, Australian Privacy Act):** Minimal data collection (email + subscription). Honor deletion requests. No third-party tracking by default.
- **Age-appropriate content only.** Plan generator filters by child age range. Activities include safety notes where relevant.
- **Payment data:** Stripe handles all card data. TinyPlan never sees card numbers.

## Important Routes

> Page routes are served under a locale segment — `/es/…` (default) and `/en/…`. `src/proxy.ts` redirects any unprefixed path to the visitor's locale (cookie → `Accept-Language` by q-value → for visitors matching neither locale: `es` if their IP is in a Spanish-speaking country (local GeoIP, see DEPLOY.md), else `en` → `es` only with no language signal at all). `/sign-in`, `/sign-up`, `/admin`, and `/api/*` are NOT localized.

### Pages
- `/` — redirects to `/{locale}` (default `/es`)
- `/[lang]` — landing page
- `/[lang]/quiz` — 20-screen quiz shell (client component, localStorage persistence)
- `/[lang]/result` — quiz result preview + paywall teaser
- `/[lang]/pricing` — pricing + plan preview
- `/[lang]/checkout/success` — post-checkout: generates the plan **anonymously** (`/api/plan/generate`), stashes its id in `tinyplan_pending_plan_id`, fires `purchase_completed` only after a successful generation, then routes to `/dashboard/reveal`
- `/[lang]/privacy`, `/[lang]/terms` — legal pages
- `/[lang]/auth/login`, `/[lang]/auth/verify` — **legacy** magic-link (dev fallback only)
- `/sign-in`, `/sign-up` — **Clerk** hosted auth (non-localized catch-all routes)
- `/[lang]/dashboard/{today,week,sos,library,progress,reveal}` — auth-gated (signed-out access to `/dashboard/reveal` goes to Clerk **sign-up** so the funnel visitor creates an account; every other dashboard route → sign-in)
- `/admin`, `/admin/users`, `/admin/incomplete-quizzes` — admin analytics (`ADMIN_EMAILS`, fail-closed)

### API (under `/api`, not localized)
- `POST /api/quiz/submit` — build TagProfile + persist a quiz session (public)
- `POST /api/plan/generate` — generate + persist the 7-day plan (public; associates to the signed-in user if present)
- `POST /api/checkout` — create a Stripe/mock checkout session (public)
- `POST /api/dashboard/log` — log activity completion (**auth required**)
- `GET /api/dashboard/activities` — activity library (**auth required**)
- `POST /api/chat` — TinyPlan Coach reply (public; rule-based, safety-guarded)
- `POST /api/analytics` — track an event (public)
- `POST /api/plan/reclaim` — adopt an anonymous funnel-generated plan after sign-in (**auth required**; only unowned plans <24h old)
- `POST /api/webhooks/stripe` — Stripe webhook (signature-verified; advances `subscription_status`, records payments)
- `POST /api/billing/portal` — Stripe Billing Portal session for the signed-in user (**auth required**)
- `POST /api/auth/request`, `POST /api/auth/verify` — legacy magic-link; **return 410 when Clerk is enabled**
- `GET /api/auth/logout` — clears the legacy `tinyplan-session` cookie

## Important Files

- `src/proxy.ts` — Next 16 proxy (formerly middleware): layers `clerkMiddleware` (`auth.protect()` on `/dashboard`, `/admin`) over the locale redirect; both only when `clerkEnabled`. Special case: signed-out `/dashboard/reveal` is sent to Clerk **sign-up** (`redirectToSignUp`, `returnBackUrl` built on `NEXT_PUBLIC_APP_URL` since `request.url` carries the internal listen address behind Caddy)
- `src/lib/db/schema.ts` — 9 Drizzle table definitions · `src/lib/db/index.ts` — SQLite singleton + runtime `createTables`/`migrateSchema`
- `src/lib/auth/magic-link.ts` — `getCurrentUser()` (Clerk → local `users` row), the `clerkEnabled` flag, and legacy jose helpers
- `src/lib/auth/admin.ts` — `requireAdmin()` / `isAdminEmail()` (fail-closed `ADMIN_EMAILS` gate)
- `src/instrumentation.ts` — production startup preflight: throws if `CLERK_SECRET_KEY` is missing while Clerk is on; warns on empty `ADMIN_EMAILS`; **billing preflight** — `STRIPE_SECRET_KEY` requires `STRIPE_WEBHOOK_SECRET` (throw) and forbids `DEV_BYPASS_PAYWALL=true` (throw, contradictory); bypass-without-key warns loudly. `next.config.ts` — build-time guard (requires https `NEXT_PUBLIC_APP_URL` + `pk_` Clerk key)
- `src/lib/quiz/questions.ts` (+ `.en.ts`/`.es.ts`) — 20-screen quiz definition · `src/lib/quiz/tags.ts` — TagProfile builder + play profile derivation
- `src/lib/engine/plan-generator.ts` — deterministic 7-day plan · `src/lib/engine/localize-plan.ts` — render-time re-localization of stored (English) plans
- `src/lib/payments/stripe.ts` — checkout session (mock/real), `createBillingPortalSession`, `verifyWebhookSignature` (consumed by `/api/webhooks/stripe`)
- `src/lib/auth/subscription.ts` — `isBillingEnforced()` / `requireActiveSubscription()` paywall gate (no-op during soft launch) · `src/components/dashboard/plan-reclaimer.tsx` — adopts the anonymous funnel plan after sign-in (`tinyplan_pending_plan_id`)
- `deploy/delete-user.sh` + `scripts/delete-user.mjs` — GDPR/CCPA data-deletion CLI (dry-run first; must also delete the user in Clerk)
- `src/data/sos-scripts.ts` — 8 SOS emergency parenting scripts
- `src/components/quiz/quiz-shell.tsx` — quiz UI with state management
- `drizzle.config.ts` — Drizzle Kit config (optional tooling; SQLite at `./data/tinyplan.db`)
- SEO: `src/app/robots.ts`, `src/app/sitemap.ts` (both locales, hreflang, x-default→es), `src/app/icon.svg` + `apple-icon.tsx` (no `favicon.ico`), `src/app/[lang]/opengraph-image.tsx` (`next/og`); `metadataBase` + OG/Twitter in root + `[lang]` layouts (Next metadata merging is **shallow** — repeat shared blocks)
- Error boundaries: `src/app/global-error.tsx`, `src/app/[lang]/error.tsx`, `not-found.tsx` (root + `[lang]`), `src/app/[lang]/dashboard/loading.tsx` skeleton

### i18n
- `src/proxy.ts` — Locale detection + redirect + `tinyplan_locale` cookie (Next.js 16 proxy; lives in `src/` beside `app/`)
- `src/lib/i18n/config.ts` — `Locale`, `locales`, `defaultLocale` (`'es'`), `isLocale`/`resolveLocale` (edge-safe; no dictionary imports)
- `src/lib/i18n/en.ts` + `es.ts` + `index.ts` — Typed UI dictionaries + `getDictionary(locale)`/`t()`
- `src/lib/i18n/href.ts` — `localizeHref` / `switchLocalePath`
- `src/components/i18n/locale-provider.tsx` — `LocaleProvider` + `useLocale`/`useT` hooks
- `src/components/language-switcher.tsx` — ES/EN toggle
- `src/lib/engine/localize-plan.ts` — `localizePlan(plan, locale)` re-localizes a stored (English) plan at render time
- `src/app/[lang]/layout.tsx` — Locale validation + provider; `src/app/layout.tsx` sets `<html lang>` from cookie and mounts `<ClerkProvider>` when `clerkEnabled`
- Locale-keyed content: `src/lib/quiz/questions.{en,es}.ts`, `src/data/sos-scripts.{en,es}.ts`, `src/data/parent-growth-path.{en,es}.ts`, `src/lib/engine/fallback-activities.ts`
