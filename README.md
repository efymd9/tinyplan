# TinyPlan

Personalised play and routine planning app for parents of children aged 2-6. Parents complete a 31-screen quiz about their child's play style, family routines, and goals. TinyPlan generates a 7-day activity plan with exact parent scripts, materials lists, and step-by-step guidance. Includes SOS scripts for difficult moments (tantrums, bedtime battles, screen transitions).

**Pricing:** $1 for 7 days, then $14.99/month.

## Implemented MVP Features

- **31-screen quiz** across 7 stages (warm-up, parent pain, play style, routine, commitment, result) that profiles the child and family
- **Play profile engine** deriving one of 6 profiles (big-feelings-explorer, curious-builder, story-seeker, routine-lover, fast-bored-sprinter, connection-seeker)
- **Deterministic plan generation** producing a 7-day activity plan matched by age, goal tags, play style tags, and routine moment
- **Magic-link auth** (passwordless email login via JWT)
- **Dashboard** with today view, weekly overview, activity library, progress tracking, and SOS scripts
- **Activity logging** (done / too hard / too easy / skipped) per day
- **Stripe subscription checkout** with $1 intro for 7 days then $14.99/month, mock fallback for local dev
- **Admin dashboard** with conversion funnel, event breakdown, and dropoff analysis (email-gated)
- **Analytics** tracked to SQLite with optional PostHog forwarding
- **SOS scripts** for 8 common parenting emergencies with exact words to say

## Routes

| Path | Auth | Description |
|---|---|---|
| `/` | No | Landing page |
| `/quiz` | No | 31-screen quiz |
| `/result` | No | Quiz result preview (paywall teaser) |
| `/pricing` | No | Pricing page with plan preview |
| `/auth/login` | No | Magic link email entry |
| `/auth/verify` | No | Token verification and redirect |
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
- **Auth:** Passwordless magic links (jose JWT)
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

Copy `.env.example` to `.env.local`. All external services are optional for local development, with built-in fallbacks:

| Variable | Required | Fallback |
|---|---|---|
| `AUTH_SECRET` | Yes | None (set any string locally) |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` |
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

## Magic Link Auth

- User enters email at `/auth/login`
- Server generates a JWT token (15-minute expiry) and sends a magic link email
- When `RESEND_API_KEY` is absent, the magic link URL is logged to the console for local dev
- Clicking the link hits `/auth/verify?token=...`, which verifies the JWT, creates or finds the user, and sets a `tinyplan-session` httpOnly cookie (30-day expiry)

## Analytics

- All events tracked to `analytics_events` table in SQLite
- Optional PostHog forwarding when `NEXT_PUBLIC_POSTHOG_KEY` is set
- Client-side: `useAnalytics()` hook
- Server-side: direct DB insert via analytics module
- Admin dashboard at `/admin` shows conversion funnel and event breakdown

## Architecture

```
src/
  app/                    # Next.js App Router pages and API routes
    admin/                # Admin analytics dashboard
    api/                  # Server-side API routes
      auth/               # Magic link request, verify, logout
      checkout/           # Stripe session creation
      dashboard/          # Activity list, day logging
      plan/               # Plan generation
      quiz/               # Quiz submission
      analytics/          # Event tracking
    auth/                 # Login and verify pages
    checkout/             # Post-checkout success page
    dashboard/            # Protected dashboard pages (today, week, sos, library, progress)
    pricing/              # Pricing page
    quiz/                 # Quiz shell page
    result/               # Quiz result preview
  components/
    ui/                   # Shared UI primitives (button, card, input, progress-bar)
    quiz/                 # Quiz shell component with localStorage persistence
    dashboard/            # Activity action buttons
  data/
    sos-scripts.ts        # 8 emergency parenting scripts
  lib/
    db/
      schema.ts           # Drizzle ORM table definitions (SQLite)
      index.ts            # Database connection (singleton, WAL mode)
    auth/
      magic-link.ts       # JWT token creation, verification, session management
    email/
      index.ts            # Email provider (Resend / console fallback)
    quiz/
      questions.ts        # 31-screen quiz definition
      tags.ts             # TagProfile builder, play profile derivation
    engine/
      plan-generator.ts   # Deterministic 7-day plan generation
      ai-adapter.ts       # AI provider stub
    payments/
      stripe.ts           # Stripe checkout session and webhook verification
    analytics/
      events.ts           # Server-side event tracking
      use-analytics.ts    # Client-side useAnalytics() hook
    dashboard/
      helpers.ts          # Dashboard data helpers
    i18n/
      en.ts               # English dictionary
      index.ts            # i18n loader
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

## Verification Commands

```bash
npm run lint         # ESLint checks
npm run build        # Full production build (type checking included)
npx tsc --noEmit     # TypeScript type check only
```
