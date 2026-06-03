# TinyPlan

Personalised play and routine planning app for parents of children aged 2-6. Parents complete a 20-screen quiz about their child's play style, family routines, and goals. TinyPlan derives a play profile (one of 6 types) and generates a deterministic 7-day activity plan with exact parent scripts, materials lists, and step-by-step guidance. Includes SOS scripts for difficult moments (tantrums, bedtime battles, screen transitions).

**Pricing:** $1 for 7 days, then $14.99/month.

**Languages:** Bilingual — **Spanish (default)** and English, served from localized URLs (`/es/…`, `/en/…`) with a top-of-page language switch. See [Internationalization](#internationalization-i18n). The admin panel is English-only.

**Live:** https://tinyplan.org. Hosting, DNS, and operations are documented in **[DEPLOY.md](DEPLOY.md)**; the system design is in **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

## Implemented MVP Features

- **20-screen quiz** profiling the child and family across warm-up, pain points, play style, routine, and commitment stages (no child PII — no child name is collected)
- **Play profile engine** deriving one of 6 profiles (big-feelings-explorer, curious-builder, story-seeker, routine-lover, fast-bored-sprinter, connection-seeker)
- **Deterministic plan generation** producing a 7-day activity plan matched by age, goal tags, play style tags, and routine moment
- **Clerk authentication** (production) via custom `/sign-in` and `/sign-up` pages; a legacy magic-link JWT flow remains only as a key-less local/dev fallback
- **Dashboard** with today view, weekly overview, activity library, progress tracking, plan reveal, and SOS scripts
- **TinyPlan Coach** — a rule-based, safety-guarded chat helper (`/api/chat`)
- **Activity logging** (done / too hard / too easy / skipped) per day
- **Stripe subscription billing** ($1 intro for 7 days then $14.99/month): checkout, signature-verified webhook (`/api/webhooks/stripe`), billing-portal endpoint, and a subscription gate that stays **open during the soft launch** (see [Stripe Integration](#stripe-integration)); mock fallback for local dev
- **Admin dashboard** with conversion funnel, users/sessions explorer, and incomplete-quiz drop-off analysis (email-gated, fail-closed)
- **First-party analytics** stored in SQLite (no third-party tracking)
- **SOS scripts** for 8 common parenting moments with exact words to say
- **Bilingual (Spanish default + English)** — localized URLs, a language switch, and render-time re-localization so even stored plans switch language

## Routes

All user-facing pages are served under a **locale segment**: `/es/…` (default) and `/en/…`. A request to an unprefixed path (e.g. `/quiz`) is 307-redirected by `src/proxy.ts` to the visitor's locale (cookie → `Accept-Language` → default `es`). The paths below are shown without the prefix for brevity, except where noted. **`/sign-in`, `/sign-up`, `/admin`, and `/api/*` are NOT localized.**

| Path | Auth | Description |
|---|---|---|
| `/quiz` | No | 20-screen quiz |
| `/result` | No | Quiz result preview (paywall teaser) |
| `/pricing` | No | Pricing page with plan preview |
| `/checkout/success` | No | Post-checkout: generates the plan, redirects to `/dashboard/reveal` |
| `/privacy`, `/terms` | No | Legal pages |
| `/sign-in`, `/sign-up` | No | **Clerk** hosted auth (custom catch-all, NOT localized) |
| `/auth/login`, `/auth/verify` | No | Magic-link entry/verify — **legacy, dev fallback only** |
| `/dashboard` | Yes | Redirects to `/dashboard/today` |
| `/dashboard/today` | Yes | Today's activity with parent script |
| `/dashboard/week` | Yes | 7-day plan overview |
| `/dashboard/reveal` | Yes | New-plan reveal screen |
| `/dashboard/sos` | Yes | Emergency parenting scripts |
| `/dashboard/library` | Yes | Activity library |
| `/dashboard/progress` | Yes | Week completion stats |
| `/admin` | Admin | Conversion funnel + analytics (`ADMIN_EMAILS`, fail-closed) |
| `/admin/users` | Admin | Users & sessions explorer |
| `/admin/incomplete-quizzes` | Admin | Quiz drop-off explorer |

> The landing page is `/{locale}/` (served by `app/[lang]/(site)/page.tsx`). Bare `/` only redirects.

### API Routes

`/api/*` is never localized. Most endpoints are **public**; only the two marked Auth call `getCurrentUser()` and return 401 when signed out. `/dashboard/*` page protection is enforced by `proxy.ts` (`auth.protect()`) and the dashboard layout, not by these endpoints.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/quiz/submit` | POST | No | Build TagProfile, persist a quiz session |
| `/api/plan/generate` | POST | No | Generate + persist the 7-day plan (associates to user if signed in) |
| `/api/checkout` | POST | No | Create a Stripe (or mock) checkout session |
| `/api/dashboard/log` | POST | **Yes** | Log activity completion for an owned plan/day |
| `/api/dashboard/activities` | GET | **Yes** | List all activities for the library |
| `/api/chat` | POST | No | TinyPlan Coach reply (rule-based, safety-guarded) |
| `/api/analytics` | POST | No | Track an analytics event |
| `/api/auth/request` | POST | No | Legacy: send magic link — **returns 410 when Clerk is enabled** |
| `/api/auth/verify` | POST | No | Legacy: verify token, mint session — **returns 410 when Clerk is enabled** |
| `/api/auth/logout` | GET | No | Clear the legacy `tinyplan-session` cookie |

## Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database:** SQLite (better-sqlite3, WAL mode) with Drizzle ORM — a single local file
- **Auth:** Clerk (`@clerk/nextjs`); magic-link JWT (jose) retained only as a key-less dev fallback
- **Payments:** Stripe (subscription mode with $1 intro period); mock fallback when unconfigured
- **Email:** Resend (production), console fallback (dev)
- **Analytics:** First-party events written to SQLite (no PostHog / third-party SDK)

## Setup

```bash
git clone <repo-url> && cd parentpath
npm install
cp .env.example .env.local   # fill in as needed; all external services have local fallbacks
```

## Environment Variables

`.env.example` is the **authoritative, commented reference** — copy it to `.env.local` for dev (or `.env.production` on the server). All `NEXT_PUBLIC_*` values are **inlined at `next build`** and cannot be changed at runtime. Highlights:

| Variable | When | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | **Required (prod), build-time** | Canonical `https://` origin. Builds email/checkout/redirect links and flips the session-cookie `Secure` flag. Falls back to `http://localhost:3000`. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Required (prod), build-time** | Master switch (`clerkEnabled`). When unset, Clerk is disabled and the app uses the magic-link/dev-bypass fallback. |
| `CLERK_SECRET_KEY` | **Required (prod), runtime** | Clerk server SDK. Missing while the publishable key is set → every route 500s (the startup preflight aborts). |
| `ADMIN_EMAILS` | **Required (prod), runtime** | Comma-separated `/admin` allowlist. **Fail-closed**: empty = nobody can access `/admin`. |
| `AUTH_SECRET` | Optional | Signs the **legacy** magic-link/session JWTs only; effectively unused under Clerk (still good hygiene to set). |
| `NODE_ENV` | Runtime | `production` on the server; gates the dev bypass, the Stripe hard-fail, and the startup preflight. |
| `STRIPE_SECRET_KEY` | Optional | Real checkout when set. In production, absent + `DEV_BYPASS_PAYWALL` unset → checkout throws. |
| `DEV_BYPASS_PAYWALL` | Soft-launch flag | `true` → mock checkout pass-through (no real charge) even in production. Remove once billing is live. |
| `DEV_BYPASS_AUTH` | Dev only | `true` returns a fixed signed-in user. Ignored when `NODE_ENV=production`. |
| `COOKIE_SECURE` | Optional | Override for the legacy session cookie `Secure` flag (otherwise inferred from the https app URL). |
| `RESEND_API_KEY` / `EMAIL_FROM` | Optional | Resend sender; without a key, email is logged to console. `EMAIL_FROM` defaults to `TinyPlan <hello@tinyplan.org>`. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` etc. | Optional, build-time | Clerk SDK routing hints (`/sign-in`, `/sign-up`, post-auth `/dashboard/today`). |

**Declared but unused** (present in older configs; safe to omit): `DATABASE_URL` (the SQLite path is hardcoded), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (checkout is a server-side redirect), `NEXT_PUBLIC_POSTHOG_KEY`/`HOST` (PostHog is not integrated), `AI_PROVIDER`/`OPENAI_API_KEY` (the AI adapter is a stub). `STRIPE_WEBHOOK_SECRET` is consumed by `/api/webhooks/stripe` and is **required** in production once `STRIPE_SECRET_KEY` is set (the startup preflight enforces this).

## Local Development

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
```

The database file and schema are **created automatically** at first DB access (`createTables()`/`migrateSchema()` in `src/lib/db/index.ts`) — no migration step is required. `drizzle-kit` (`generate`/`push`/`studio`) is available for schema tooling but is optional.

With no env configured, the app runs fully: Clerk is off (use `DEV_BYPASS_AUTH=true` to get a signed-in dev user), Stripe is mocked, and email logs to the console.

## Stripe Integration

- **Subscription mode:** `$1` for 7 days (trial), then `$14.99/month` recurring. Prices are inline `price_data` — no Stripe Price IDs to configure.
- **Mock fallback:** with no `STRIPE_SECRET_KEY`, `/api/checkout` returns a mock session that redirects straight to the success page. **In production**, an absent key throws *unless* `DEV_BYPASS_PAYWALL=true` (the soft-launch mode).
- **Metadata:** `userId` and `quizSessionId` are attached to the checkout session.
- **Webhook:** `POST /api/webhooks/stripe` verifies signatures (`STRIPE_WEBHOOK_SECRET`) and handles `checkout.session.completed`, `customer.subscription.*`, and `invoice.paid`/`payment_failed` — advancing `users.subscription_status` (`trial`/`active`/`cancelled`) and recording `payments` rows idempotently.
- **Subscription gate:** `requireActiveSubscription()` (`src/lib/auth/subscription.ts`) protects the dashboard, but is a **no-op while billing is not enforced** — `isBillingEnforced()` is true only when `STRIPE_SECRET_KEY` is set *and* `DEV_BYPASS_PAYWALL` is not `true`. The soft launch therefore runs with an intentionally open paywall.
- **Validated charge timeline** (Stripe test mode, test clock): **$1.00 charged at checkout** (`subscription_create` invoice), 7-day `trialing`, then **$14.99 at trial end** (`subscription_cycle`) — matching the advertised "$1 for 7 days, then $14.99/month". Re-confirm once against the live account before the first real charge.
- **To enable real billing:** set `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`, register the webhook endpoint in Stripe, and remove `DEV_BYPASS_PAYWALL` (the startup preflight rejects contradictory combinations). A "Manage subscription" button in the dashboard opens the Stripe Billing Portal via `/api/billing/portal`.

## Authentication

Production auth runs on **Clerk**, mounted via `ClerkProvider` in the root layout and `clerkMiddleware` in `src/proxy.ts` — both activated only when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set (`clerkEnabled`). Sign-in/sign-up use **custom catch-all routes** at `/sign-in` and `/sign-up` (outside `[lang]`, so not localized). `getCurrentUser()` (`src/lib/auth/magic-link.ts`) derives identity from the Clerk session and provisions a local `users` row keyed by the Clerk email on first sign-in; that row's UUID is the foreign key the rest of the schema uses. Admin pages are gated by `requireAdmin()` (`src/lib/auth/admin.ts`), which is **fail-closed** against `ADMIN_EMAILS`.

When Clerk is **not** configured (local dev or a key-less build), the app falls back to a legacy magic-link flow and the `DEV_BYPASS_AUTH` dev user.

### Magic Link Auth (legacy / dev fallback only)

- Only reachable when `clerkEnabled` is false; `/api/auth/request` and `/api/auth/verify` return **HTTP 410** when Clerk is on.
- User enters email at `/auth/login`; the server issues a **stateless** JWT (15-min expiry) and "sends" a magic link (logged to console without `RESEND_API_KEY`).
- The verify page sets a `tinyplan-session` httpOnly cookie (30-day expiry). Tokens are verified by signature only — they are **not** single-use, and the `auth_tokens` table is defined but never written.

## Analytics

- All events are written to the `analytics_events` table in SQLite (first-party, no IP stored).
- Client-side: `useAnalytics()` hook → `POST /api/analytics`. Server-side: direct DB insert.
- The admin dashboards at `/admin` derive the conversion funnel, session timelines, and drop-off from these events.
- **No PostHog / third-party analytics** are integrated.

## Internationalization (i18n)

TinyPlan ships bilingual with **Spanish as the default**, built on an in-repo dictionary (no i18n library).

- **Locales:** `es` (default) and `en`, defined in `src/lib/i18n/config.ts` (`defaultLocale = 'es'`).
- **Localized routing:** every user-facing page lives under `app/[lang]/`. `src/proxy.ts` (the Next.js 16 successor to `middleware.ts`) redirects unprefixed paths to `/{locale}` — resolving from the `tinyplan_locale` cookie → `Accept-Language` → `es` — and keeps the cookie in sync. `app/admin`, `app/sign-in`, `app/sign-up`, and `app/api` sit outside `[lang]` and are never localized.
- **Reading the locale:** server components use `params.lang` + `getDictionary(lang)`; client components use `useLocale()` / `useT()` from `@/components/i18n/locale-provider`. The root layout sets `<html lang>` from the cookie.
- **Switcher:** `LanguageSwitcher` (floating on public pages via the `(site)` route group, in the header on the dashboard) sets the cookie and swaps the URL's locale segment. The chosen locale is **not** persisted to the database.
- **Content split:** short UI chrome lives in the typed dictionaries (`en.ts` / `es.ts`); larger bodies (quiz, SOS, growth path, activities, routines, legal pages, emails, parent toolkit) live in locale-keyed modules selected by getters such as `getQuestions(locale)`, `getSosScripts(locale)`, `getFallbackActivities(locale)`. IDs, tags, and enum codes are identical across locales, so application logic is language-independent.
- **The database stays English.** Generated plans are stored in English and **re-localized at render time** by `localizePlan(plan, locale)`, which re-derives all display text from the stored stable keys/IDs. Toggling EN/ES re-localizes even existing plans without regenerating them.
- **Adding a string:** add the key to `en.ts` **and** `es.ts` (the `Dictionary = Widen<typeof en>` type makes a missing key a compile error), or extend the relevant locale-keyed content module.

## Architecture

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the full design. Source layout:

```
src/
  proxy.ts                # Next.js 16 proxy: Clerk middleware (auth.protect on /dashboard,/admin) layered over locale redirect
  instrumentation.ts      # Production startup preflight (requires CLERK_SECRET_KEY; warns on empty ADMIN_EMAILS)
  app/
    layout.tsx            # Root layout — <html lang> from cookie, mounts <ClerkProvider> when clerkEnabled
    [lang]/               # Locale segment ("es" | "en") — validates locale, mounts LocaleProvider
      (site)/             # Public pages (route group): landing, quiz, result, pricing, auth, checkout, privacy, terms
      dashboard/          # Protected pages (today, week, sos, library, progress, reveal) + layout auth guard
    sign-in/ sign-up/     # Clerk hosted auth (catch-all, NOT localized)
    admin/                # Admin dashboards (page, users, incomplete-quizzes) — English-only, NOT localized
    api/                  # Route handlers (auth, checkout, dashboard, plan, quiz, analytics, chat)
  components/
    i18n/locale-provider.tsx   # LocaleProvider + useLocale()/useT()
    language-switcher.tsx      # ES/EN toggle
    ui/ quiz/ dashboard/       # UI primitives, quiz shell, dashboard widgets + toolkit
  data/                   # Localized content: sos-scripts, parent-growth-path, parent-tools (+ .en/.es)
  lib/
    i18n/                 # config.ts (edge-safe), en.ts/es.ts, index.ts (getDictionary), href.ts
    db/                   # schema.ts (9 tables), index.ts (better-sqlite3 singleton, runtime createTables/migrate)
    auth/                 # magic-link.ts (getCurrentUser → Clerk → users row; clerkEnabled; legacy jose helpers)
                          # admin.ts (requireAdmin, fail-closed allowlist)
    quiz/                 # questions.ts (+ .en/.es) 20 screens, tags.ts (TagProfile + profile derivation)
    engine/               # plan-generator.ts (deterministic), fallback-activities.ts, localize-plan.ts, daily-toolkit.ts, ai-adapter.ts (stub)
    routines/ payments/   # routines.ts (deriveRoutine/localizeRoutine); stripe.ts (checkout, billing portal, verifyWebhookSignature)
    analytics/            # events.ts (first-party SQLite), use-analytics.ts (client hook)
```

## Data Model

**9 SQLite tables** defined in `src/lib/db/schema.ts`:

- **users** — Email, name, locale, Stripe customer ID, subscription status (free/trial/active/cancelled — advanced by the Stripe webhook; stays `free` during the soft launch)
- **auth_tokens** — *Defined but unused* (legacy magic-link; never written or read)
- **quiz_sessions** — Raw quiz answers, parsed tag profile, derived play profile
- **activities** — Activity catalog with age range, goal/style/routine tags, parent scripts, steps, difficulty variants
- **plans** — Generated 7-day plans (English `plan_json`) linked to user and quiz session
- **plan_day_logs** — Per-day activity completion status (pending/done/too_hard/skipped/too_easy)
- **payments** — Stripe invoice/subscription IDs, amount, status (written idempotently by the webhook on paid/failed invoices)
- **weekly_checkins** — End-of-week check-in responses
- **analytics_events** — Event name, user, session, properties, path/referrer/user-agent, timestamp (ms)

## Privacy and Legal Guardrails

TinyPlan targets families in the **US, UK, Canada, and Australia**.

### Data Collection
- **Minimal PII:** Only email address is collected. No child names, photos, or location data.
- **No child accounts:** Children never interact with the app directly. All data describes the parent's observations.
- **Age stored as range:** Child age is stored as a bracket (2-6), not a birthdate.
- **Quiz answers are observational:** play-style preferences and routine patterns, not medical or diagnostic information.

### Regulatory Considerations

| Jurisdiction | Key Regulation | TinyPlan Relevance |
|---|---|---|
| US | COPPA | App is directed at parents, not children. No data from under-13s. No child accounts. |
| US | CCPA/CPRA, etc. | Email + subscription data only. Honor deletion requests. |
| UK | UK GDPR + Age Appropriate Design Code | No child PII. Parent email under a contract basis (subscription). |
| Canada | PIPEDA | Consent at email capture. Minimal data collection. |
| Australia | Privacy Act 1988 + APPs | No sensitive information collected. Consent at signup. |

### Content Guardrails
- **Not therapy or diagnosis:** play-based enrichment, not clinical intervention. Never claim to diagnose, treat, or cure.
- **No medical advice:** SOS scripts are general parenting guidance.
- **Age-appropriate only:** the plan generator filters activities by the child's age range; safety notes are included where relevant.
- **No ads or third-party tracking by default:** analytics are first-party (SQLite).

### Data Handling
- Clerk manages production sessions. The legacy magic-link `tinyplan-session` cookie (httpOnly, 30-day) is only used when Clerk is disabled.
- The SQLite database is local to the deployment; no data leaves the server unless external services (Stripe, Resend) are configured.
- Stripe handles all payment card data; TinyPlan never sees card numbers.

## Deployment

Production runs on a **single Linux VPS** (Caddy for HTTPS, `next start` under systemd, local SQLite on a persistent disk) — **not** Vercel/serverless, because SQLite needs a persistent filesystem. The full, accurate runbook (host setup, DNS, Clerk, redeploy, backups, troubleshooting) is in **[DEPLOY.md](DEPLOY.md)**.

```bash
npm ci
npm run build
npm run start -- -H 0.0.0.0 -p <port>   # serves the production build from .next
```

> **Restart `next start` after every build.** `next start` loads its asset manifest once at launch and does not hot-reload. If you rebuild while an old `next start` is still serving, clients hit `ChunkLoadError`. Always **stop → build → start** (or `npm run build && systemctl restart tinyplan`). A hard refresh clears cached broken HTML.

## Verification Commands

```bash
npm run lint         # ESLint
npm run build        # Full production build (type checking included)
npx tsc --noEmit     # TypeScript type check only
```
