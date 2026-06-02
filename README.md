# TinyPlan

Personalised play and routine planning app for parents of children aged 2-6. Parents complete a 31-screen quiz about their child's play style, family routines, and goals. TinyPlan generates a 7-day activity plan with exact parent scripts, materials lists, and step-by-step guidance. Includes SOS scripts for difficult moments (tantrums, bedtime battles, screen transitions).

**Pricing:** $1 for 7 days, then $14.99/month.

**Languages:** Bilingual — **Spanish (default)** and English, served from localized URLs (`/es/…`, `/en/…`) with a top-of-page language switch. See [Internationalization](#internationalization-i18n). The admin panel is English-only.

## Implemented MVP Features

- **31-screen quiz** across 7 stages (warm-up, parent pain, play style, routine, commitment, result) that profiles the child and family
- **Play profile engine** deriving one of 6 profiles (big-feelings-explorer, curious-builder, story-seeker, routine-lover, fast-bored-sprinter, connection-seeker)
- **Deterministic plan generation** producing a 7-day activity plan matched by age, goal tags, play style tags, and routine moment
- **Clerk authentication** (production) via custom `/sign-in` and `/sign-up` pages; magic-link JWT login remains as a legacy/local fallback when Clerk is not configured
- **Dashboard** with today view, weekly overview, activity library, progress tracking, and SOS scripts
- **Activity logging** (done / too hard / too easy / skipped) per day
- **Stripe subscription checkout** with $1 intro for 7 days then $14.99/month, mock fallback for local dev
- **Admin dashboard** with conversion funnel, event breakdown, and dropoff analysis (email-gated)
- **Analytics** tracked to SQLite with optional PostHog forwarding
- **SOS scripts** for 8 common parenting emergencies with exact words to say
- **Bilingual (Spanish default + English)** — localized URLs, a language switch, and render-time re-localization so even stored plans switch language

## Routes

All user-facing pages are served under a **locale segment**: `/es/…` (default) and `/en/…`. A request to an unprefixed path (e.g. `/quiz`) is redirected by `proxy.ts` to the visitor's locale (cookie → `Accept-Language` → default `es`). The paths below are shown without the prefix for brevity. **`/admin` and `/api/*` are NOT localized.**

| Path | Auth | Description |
|---|---|---|
| `/` | No | Landing page |
| `/quiz` | No | 31-screen quiz |
| `/result` | No | Quiz result preview (paywall teaser) |
| `/pricing` | No | Pricing page with plan preview |
| `/sign-in` | No | Clerk sign-in (custom catch-all, NOT localized) |
| `/sign-up` | No | Clerk sign-up (custom catch-all, NOT localized) |
| `/auth/login` | No | Magic link email entry (legacy/local fallback) |
| `/auth/verify` | No | Token verification and redirect (legacy/local fallback) |
| `/checkout/success` | Yes | Post-checkout landing |
| `/dashboard` | Yes | Redirects to `/dashboard/today` |
| `/dashboard/today` | Yes | Today's activity with parent script |
| `/dashboard/week` | Yes | 7-day plan overview |
| `/dashboard/sos` | Yes | Emergency parenting scripts |
| `/dashboard/library` | Yes | Activity library |
| `/dashboard/progress` | Yes | Week completion stats |
| `/admin` | Yes | Admin analytics (ADMIN_EMAILS gated) |

### API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/request` | POST | Send magic link email |
| `/api/auth/verify` | POST | Verify token, create session |
| `/api/auth/logout` | GET | Clear session cookie |
| `/api/quiz/submit` | POST | Submit quiz answers |
| `/api/plan/generate` | POST | Generate weekly plan |
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/dashboard/activities` | POST | List activities |
| `/api/dashboard/log` | POST | Log activity completion |
| `/api/analytics` | POST | Track analytics event |

## Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database:** SQLite (better-sqlite3, WAL mode) with Drizzle ORM
- **Auth:** Clerk (production) with custom `/sign-in` and `/sign-up`; magic-link JWT (jose) as legacy/local fallback when Clerk is unconfigured
- **Payments:** Stripe (subscription mode with $1 intro period)
- **Email:** Resend (production), console fallback (dev)
- **Analytics:** Custom SQLite events + optional PostHog

## Setup

```bash
git clone <repo-url> && cd parentpath
npm install
cp .env.example .env.local
```

## Environment Variables

Copy `.env.example` to `.env.local` (`.env.example` may be git-ignored locally, but includes placeholders for every variable below when present). All external services are optional for local development, with built-in fallbacks. **Clerk is required in production** but is skipped when its publishable key is absent — the app then falls back to magic-link auth / the dev bypass for local development.

| Variable | Required | Fallback |
|---|---|---|
| `AUTH_SECRET` | Yes | None (set any string locally) |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Prod | Clerk disabled; magic-link/dev auth used |
| `CLERK_SECRET_KEY` | Prod | Clerk disabled; magic-link/dev auth used |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | No | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | No | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | No | `/` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | No | `/` |
| `STRIPE_SECRET_KEY` | No | Mock checkout that auto-succeeds |
| `STRIPE_WEBHOOK_SECRET` | No | Webhooks disabled |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Checkout button hidden or mock |
| `RESEND_API_KEY` | No | Magic link logged to console |
| `EMAIL_FROM` | No | `hello@tinyplan.app` |
| `DATABASE_URL` | No | Local SQLite at `./data/tinyplan.db` |
| `AI_PROVIDER` | No | Stub (returns activity unchanged) |
| `OPENAI_API_KEY` | No | AI adapter disabled |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | Analytics to SQLite only |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog disabled |
| `ADMIN_EMAILS` | No | Admin page open to all authenticated users |

## Local Development

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
```

Database migrations (Drizzle Kit):

```bash
npx drizzle-kit generate    # Generate migration from schema changes
npx drizzle-kit push        # Push schema to database
npx drizzle-kit studio      # Open Drizzle Studio GUI
```

## Stripe Integration

- **Subscription mode:** $1 for 7 days, then $14.99/month recurring
- **Mock fallback:** When `STRIPE_SECRET_KEY` is not set, `/api/checkout` returns a mock session that auto-redirects to the success page. No Stripe account needed for local dev.
- **Webhooks:** Signature verified via `STRIPE_WEBHOOK_SECRET`. Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` for local testing.
- **Metadata:** `userId` and `quizSessionId` are attached to checkout session and subscription metadata.

## Authentication

Production auth runs on **Clerk**, mounted via `ClerkProvider` in the root layout and `clerkMiddleware` in `proxy.ts` — both activated only when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set. Sign-in and sign-up use **custom catch-all routes** at `/sign-in` and `/sign-up` (outside `[lang]`, so not localized). `getCurrentUser()` (`src/lib/auth/magic-link.ts`) derives identity from the Clerk session and provisions a local user record keyed by the Clerk email on first sign-in.

When Clerk is not configured (local dev or a key-less build), the app falls back to the legacy magic-link flow below (and a dev bypass).

### Magic Link Auth (legacy / local fallback)

- User enters email at `/auth/login`
- Server generates a JWT token (15-minute expiry) and sends a magic link email
- When `RESEND_API_KEY` is absent, the magic link URL is logged to the console for local dev
- Magic-link emails are rendered in the recipient's locale (read from the `tinyplan_locale` cookie at send time)
- Clicking the link hits the locale-prefixed verify page `/{locale}/auth/verify?token=...`, which verifies the JWT, creates or finds the user, and sets a `tinyplan-session` httpOnly cookie (30-day expiry)

## Analytics

- All events tracked to `analytics_events` table in SQLite
- Optional PostHog forwarding when `NEXT_PUBLIC_POSTHOG_KEY` is set
- Client-side: `useAnalytics()` hook
- Server-side: direct DB insert via analytics module
- Admin dashboard at `/admin` shows conversion funnel and event breakdown

## Internationalization (i18n)

TinyPlan ships bilingual with **Spanish as the default**, built on an in-repo dictionary (no i18n library).

- **Locales:** `es` (default) and `en`, defined in `src/lib/i18n/config.ts` (`defaultLocale = 'es'`).
- **Localized routing:** every user-facing page lives under `app/[lang]/`. `proxy.ts` (the Next.js 16 successor to `middleware.ts`) redirects unprefixed paths to `/{locale}` — resolving from the `tinyplan_locale` cookie → `Accept-Language` → `es` — and keeps the cookie in sync. `app/admin` and `app/api` sit outside `[lang]` and are never localized.
- **Reading the locale:** server components use `params.lang` + `getDictionary(lang)`; client components use `useLocale()` / `useT()` from `@/components/i18n/locale-provider`. The root layout sets `<html lang>` from the cookie.
- **Switcher:** `LanguageSwitcher` (floating on public pages via the `(site)` route group, in the header on the dashboard) sets the cookie and swaps the URL's locale segment. The chosen locale is **not** persisted to the database.
- **Content split:** short UI chrome lives in the typed dictionaries (`en.ts` / `es.ts`); larger bodies (quiz, SOS, growth path, activities, routines, legal pages, emails, parent toolkit) live in locale-keyed modules selected by getters such as `getQuestions(locale)`, `getSosScripts(locale)`, `getFallbackActivities(locale)`. IDs, tags, and enum codes are identical across locales, so application logic is language-independent.
- **The database stays English.** Generated plans are stored in English and **re-localized at render time** by `localizePlan(plan, locale)`, which re-derives all display text from the stored stable keys/IDs. Toggling EN/ES therefore re-localizes even existing plans without regenerating them.
- **Adding a string:** add the key to `en.ts` **and** `es.ts` (the `Dictionary = Widen<typeof en>` type makes a missing key a compile error), or extend the relevant locale-keyed content module.

## Architecture

```
proxy.ts                  # Locale redirect + tinyplan_locale cookie (Next.js 16 "proxy", formerly middleware)
src/
  app/
    layout.tsx            # Root layout — sets <html lang> from the locale cookie
    [lang]/               # Locale segment ("es" | "en") — validates locale, mounts LocaleProvider
      layout.tsx
      (site)/             # Public pages (route group, adds no URL segment)
        layout.tsx        # Floating language switcher
        page.tsx          # Landing (+ landing-content.ts)
        quiz/ result/ pricing/ auth/ checkout/ privacy/ terms/
      dashboard/          # Protected pages (today, week, sos, library, progress, reveal)
    admin/                # Admin analytics dashboard (English-only, NOT localized)
    api/                  # API routes (auth, checkout, dashboard, plan, quiz, analytics, chat)
  components/
    i18n/locale-provider.tsx   # LocaleProvider + useLocale()/useT() (client context)
    language-switcher.tsx      # ES/EN toggle
    ui/                   # Shared UI primitives (button, card, input, progress-bar)
    quiz/                 # Quiz shell component with localStorage persistence
    dashboard/            # Dashboard widgets + toolkit/*
  data/
    sos-scripts.ts        # getSosScripts(locale) → 8 scripts (+ .en.ts / .es.ts)
    parent-growth-path.ts # getGrowthPath(locale) → 7-day parent skills (+ .en/.es)
    parent-tools.ts       # Parent-toolkit cards (localizeParentTool)
  lib/
    i18n/
      config.ts           # Locale type, locales, defaultLocale ('es'), isLocale/resolveLocale (edge-safe)
      en.ts / es.ts       # Typed UI dictionaries (Dictionary = Widen<typeof en>)
      index.ts            # getDictionary(locale) / t()
      href.ts             # localizeHref / switchLocalePath
    db/
      schema.ts           # Drizzle ORM table definitions (SQLite)
      index.ts            # Database connection (singleton, WAL mode)
    auth/
      magic-link.ts       # JWT token creation, verification, session management
    email/
      index.ts            # Locale-aware email templates (Resend / console fallback)
    quiz/
      questions.ts        # getQuestions(locale) / getVisibleScreensForLocale (+ .en/.es)
      tags.ts             # TagProfile builder + locale-aware display getters
    engine/
      plan-generator.ts   # Deterministic 7-day plan generation (persists tagProfile)
      fallback-activities.ts # getFallbackActivities(locale) — 15 activities keyed by stable id
      localize-plan.ts    # localizePlan(plan, locale) — re-localizes a stored plan at render time
      daily-toolkit.ts    # buildDailyToolkit(ctx, day, locale)
      ai-adapter.ts       # AI provider stub
    routines/
      routines.ts         # deriveRoutine (selection) + localizeRoutine
    payments/
      stripe.ts           # Stripe checkout session and webhook verification
    analytics/
      events.ts           # Server-side event tracking
      use-analytics.ts    # Client-side useAnalytics() hook
    dashboard/
      helpers.ts          # Dashboard data helpers (re-exports localizePlan)
```

## Data Model

8 SQLite tables defined in `src/lib/db/schema.ts`:

- **users** - Email, name, locale, Stripe customer ID, subscription status (free/trial/active/cancelled)
- **auth_tokens** - Magic link JWT tokens with expiry and used flag
- **quiz_sessions** - Raw quiz answers, parsed tag profile, derived play profile
- **activities** - Activity catalog with age range, goal/style/routine tags, parent scripts, steps, difficulty variants
- **plans** - Generated 7-day plans linked to user and quiz session
- **plan_day_logs** - Per-day activity completion status (pending/done/too_hard/skipped/too_easy)
- **payments** - Stripe session and subscription IDs, amount, status
- **weekly_checkins** - End-of-week check-in responses
- **analytics_events** - Event name, user, session, properties, timestamp

## Privacy and Legal Guardrails

TinyPlan targets families in the **US, UK, Canada, and Australia**. The following constraints apply:

### Data Collection

- **Minimal PII:** Only email address is collected. No child names, photos, or location data.
- **No child accounts:** Children never interact with the app directly. All data describes the parent's observations about their child.
- **Age stored as range:** Child age is stored as a bracket (2-6), not a birthdate.
- **Quiz answers are observational:** Questions ask about play style preferences and routine patterns, not medical, behavioral, or diagnostic information.

### Regulatory Considerations

| Jurisdiction | Key Regulation | TinyPlan Relevance |
|---|---|---|
| US | COPPA (Children's Online Privacy Protection Act) | App is directed at parents, not children. No data collected from children under 13. No child accounts. |
| US | State privacy laws (CCPA/CPRA, etc.) | Email + subscription data only. Honor deletion requests. |
| UK | UK GDPR + Age Appropriate Design Code | No child PII collected. Parent email requires consent basis (contract for subscription). |
| Canada | PIPEDA | Consent obtained at email capture. Minimal data collection. |
| Australia | Privacy Act 1988 + APPs | No sensitive information collected. Consent at signup. |

### Content Guardrails

- **Not therapy or diagnosis:** Activities are play-based enrichment, not clinical interventions. Copy must never claim to diagnose, treat, or cure any condition.
- **No medical advice:** SOS scripts provide general parenting guidance, not professional advice. Include appropriate disclaimers.
- **Age-appropriate only:** Plan generator filters activities by the child's age range. Activities include safety notes where relevant.
- **No ads or third-party tracking by default:** Analytics are first-party (SQLite). PostHog is opt-in via environment variable.

### Data Handling

- Session tokens are httpOnly cookies (30-day expiry), not stored in localStorage
- Magic link tokens expire after 15 minutes and are single-use
- SQLite database is local to the deployment; no data leaves the server unless external services (Stripe, Resend, PostHog) are configured
- Stripe handles all payment card data; TinyPlan never sees card numbers

## Deployment

The app is a standard Next.js server:

```bash
npm ci
npm run build
npm run start -- -H 0.0.0.0 -p <port>   # serves the production build from .next
```

> **Important — restart `next start` after every build.** `next start` loads its asset manifest once at launch and does not hot-reload. If you run `npm run build` again while an old `next start` process is still serving, the new build replaces the content-hashed chunks in `.next/static` and deletes the old ones — but the running server keeps handing browsers HTML that references the now-missing chunks, so clients hit a `ChunkLoadError` ("This page couldn't load"). Always **stop the server → build → start**; never rebuild underneath a live `next start`. After redeploying, a hard refresh (Ctrl/Cmd+Shift+R) clears any cached broken HTML.

## Verification Commands

```bash
npm run lint         # ESLint checks
npm run build        # Full production build (type checking included)
npx tsc --noEmit     # TypeScript type check only
```
