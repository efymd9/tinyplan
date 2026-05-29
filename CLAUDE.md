@AGENTS.md

# TinyPlan

Personalised play and routine planning app for parents of children aged 2-6. Parents take a 31-screen quiz, receive a play profile (one of 6 types), and get a 7-day activity plan with parent scripts, materials, and step-by-step guidance. Subscription model: $1 for 7 days, then $14.99/month via Stripe.

## Commands

```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build (includes type checking)
npm run lint         # ESLint
npm run start        # Production server
npx drizzle-kit push # Push schema to SQLite
```

## Stack

- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS 4
- SQLite (better-sqlite3, WAL mode) + Drizzle ORM
- Magic link auth (jose JWT, httpOnly session cookies)
- Stripe subscriptions (mock fallback when key absent)
- Resend email (console fallback when key absent)
- i18n: Spanish (default) + English under `app/[lang]/`; in-repo typed dictionary (no library); `proxy.ts` locale redirect

## Coding Conventions

- Server components by default; add `"use client"` only when needed
- Database: Drizzle ORM with SQLite. Schema in `src/lib/db/schema.ts`. All IDs are UUIDs (text). Timestamps are Unix integers.
- Auth: `getCurrentUser()` from `src/lib/auth/magic-link.ts` reads the session cookie. Protected pages should call this and redirect to `/auth/login` if null.
- Complex objects (quiz answers, tag profiles, plans) are stored as JSON text columns and parsed at read time.
- Provider pattern with fallbacks: Stripe (mock), Resend (console), PostHog (SQLite-only), AI adapter (stub).
- Quiz state is persisted to localStorage on the client for recovery across page reloads.
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

> All page routes below are served under a locale segment — `/es/…` (default) and `/en/…`. `proxy.ts` redirects any unprefixed path to the visitor's locale (cookie → `Accept-Language` → `es`). `/admin` and `/api/*` are NOT localized.

### Pages
- `/` — Redirects to `/{locale}` (default `/es`)
- `/[lang]` — Landing page
- `/quiz` — 31-screen quiz shell (client component with localStorage persistence)
- `/result` — Quiz result preview with paywall teaser
- `/pricing` — Pricing and plan preview
- `/auth/login` — Magic link email entry
- `/auth/verify` — Token verification
- `/dashboard/today` — Today's activity with parent script
- `/dashboard/week` — 7-day plan overview
- `/dashboard/sos` — 8 emergency parenting scripts
- `/dashboard/library` — Activity library
- `/dashboard/progress` — Week completion stats
- `/admin` — Conversion funnel and analytics (ADMIN_EMAILS gated)

### API
- `POST /api/auth/request` — Send magic link
- `POST /api/auth/verify` — Verify token, set session cookie
- `GET /api/auth/logout` — Clear session
- `POST /api/quiz/submit` — Submit quiz answers, create quiz session
- `POST /api/plan/generate` — Generate 7-day plan from quiz session
- `POST /api/checkout` — Create Stripe checkout session
- `POST /api/dashboard/log` — Log activity completion
- `POST /api/analytics` — Track event

## Important Files

- `src/lib/db/schema.ts` — All 8 Drizzle table definitions
- `src/lib/db/index.ts` — SQLite connection singleton
- `src/lib/auth/magic-link.ts` — JWT magic link + session token logic
- `src/lib/quiz/questions.ts` — 31-screen quiz definition
- `src/lib/quiz/tags.ts` — TagProfile builder + play profile derivation
- `src/lib/engine/plan-generator.ts` — Deterministic 7-day plan generation
- `src/lib/payments/stripe.ts` — Checkout session creation + webhook verification
- `src/data/sos-scripts.ts` — 8 SOS emergency parenting scripts
- `src/components/quiz/quiz-shell.tsx` — Quiz UI with state management
- `drizzle.config.ts` — Drizzle Kit config (SQLite at `./data/tinyplan.db`)

### i18n
- `proxy.ts` — Locale detection + redirect + `tinyplan_locale` cookie (Next.js 16 proxy; lives in `src/` beside `app/`)
- `src/lib/i18n/config.ts` — `Locale`, `locales`, `defaultLocale` (`'es'`), `isLocale`/`resolveLocale` (edge-safe; no dictionary imports)
- `src/lib/i18n/en.ts` + `es.ts` + `index.ts` — Typed UI dictionaries + `getDictionary(locale)`/`t()`
- `src/lib/i18n/href.ts` — `localizeHref` / `switchLocalePath`
- `src/components/i18n/locale-provider.tsx` — `LocaleProvider` + `useLocale`/`useT` hooks
- `src/components/language-switcher.tsx` — ES/EN toggle
- `src/lib/engine/localize-plan.ts` — `localizePlan(plan, locale)` re-localizes a stored (English) plan at render time
- `src/app/[lang]/layout.tsx` — Locale validation + provider; `src/app/layout.tsx` sets `<html lang>` from cookie
- Locale-keyed content: `src/lib/quiz/questions.{en,es}.ts`, `src/data/sos-scripts.{en,es}.ts`, `src/data/parent-growth-path.{en,es}.ts`, `src/lib/engine/fallback-activities.ts`
