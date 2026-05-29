# TinyPlan Bilingual (Spanish-default + English) — Design Spec

**Date:** 2026-05-29
**Status:** Approved (pending spec review)

## Summary

Make TinyPlan bilingual with **Spanish as the default language** and an **English/Spanish switch at the top of every page**. The entire user-facing product is translated **except the admin panel** (`/admin`). Localized URLs are used (`/es/...` default, `/en/...`). The toggle **fully re-localizes** the experience, including already-generated 7-day plans.

Spanish register: **neutral Latin American, informal (`tú`)**, warm and encouraging — chosen for the broadest international reach.

## Key decisions

1. **Localized URL routing** under an `app/[lang]/` dynamic segment (not cookie-only). Default locale `es`.
2. **Full plan re-localization at render time** (no plan regeneration, no per-locale plan storage).
3. **Database stays English.** No schema default change, no Spanish content stored in the DB, and the chosen locale is **not** persisted to `users.locale`. Locale lives entirely in the URL + cookie. All Spanish is produced at the render/presentation layer.
4. **No new i18n library** — build on the existing in-repo dictionary scaffold (`src/lib/i18n/`).
5. Admin panel (`/admin`) and `/api/*` remain untouched and English.

## Locale model

- `src/lib/i18n/index.ts`: `export type Locale = 'es' | 'en'`, `export const locales = ['es','en'] as const`, `export const defaultLocale: Locale = 'es'`, `getDictionary(locale)`, and `t(locale)` falling back to `es`.
- A guard `isLocale(x): x is Locale` and `resolveLocale(maybe)` helper used by the proxy and layouts.

## Routing & file structure

Move all localized routes under `[lang]`; leave admin/api at the top level:

```
src/app/
  layout.tsx              # ROOT layout — <html lang>/<body>, analytics; reads locale cookie
  [lang]/
    layout.tsx            # NEW — validates lang (notFound), LocaleProvider, global LanguageSwitcher
    page.tsx              # landing (from app/page.tsx)
    quiz/  result/  pricing/  auth/  checkout/  privacy/  terms/
    dashboard/            # dashboard subtree, incl. its own layout with header
  admin/                  # UNCHANGED — English-only, NOT under [lang]
  api/                    # UNCHANGED
  globals.css             # UNCHANGED
```

Static segments `admin` and `api` take precedence over the dynamic `[lang]`, so `/admin` and `/api/*` keep resolving.

### Proxy (`proxy.ts` at project root)

Next.js 16 renamed `middleware.ts` → `proxy.ts` (verified in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Behavior:

- `export function proxy(request)` + `export const config = { matcher: [...] }`.
- Skip `/api`, `/admin`, `/_next`, `/images`, any path with a file extension, and `favicon.ico`.
- If the path has no locale prefix: resolve locale from `tinyplan_locale` cookie → `Accept-Language` → `defaultLocale` (`es`), then `NextResponse.redirect` to `/{locale}{path}` (preserving query string).
- On locale-prefixed requests: set/refresh the `tinyplan_locale` cookie to the URL's locale on both the request (so the root layout's `<html lang>` is consistent in the same render) and the response.

## Layouts & `<html lang>`

- **Root `app/layout.tsx`** keeps the single `<html>`/`<body>` (Next requires them in the one root layout, and `/admin` renders under it). It reads `tinyplan_locale` via `const c = await cookies()` (`cookies()` is async in Next 16) and sets `<html lang={locale}>`, defaulting to `es`. Localized root `metadata` via cookie locale.
- **`app/[lang]/layout.tsx`** reads `const { lang } = await params` (`params` is async in Next 16), calls `notFound()` if not a valid locale, wraps children in a client `LocaleProvider`, and renders the global `<LanguageSwitcher/>`.

## Locale access pattern

- **Server components** (landing, quiz page shell, dashboard pages, legal): receive `params.lang`, call `getDictionary(lang)` and locale-aware content getters.
- **Client components** (`/result`, `/pricing`, `/auth/*`, `/checkout/success`, `quiz-shell`, dashboard client widgets): consume a `LocaleProvider` React context exposing `locale` + the dictionary. A `useT()` / `useLocale()` hook is provided. Client components needing the locale segment for navigation read it from context (or `useParams`).

## Language switcher

- Component `src/components/language-switcher.tsx` (client): compact `ES | EN` toggle.
- Mounted **globally** from `[lang]/layout.tsx`, fixed top-right, for public pages (landing/quiz/auth/result/pricing/legal/checkout).
- On the **dashboard**, it is folded into the existing header row in `[lang]/dashboard/layout.tsx` (beside `ProfileMenu`) and the global floating instance is suppressed there to avoid overlap (e.g. via a layout flag/segment check or by rendering it only in the dashboard header and the public branch).
- On click: set `tinyplan_locale` cookie, swap the leading locale segment in the current pathname (keep the rest + query), and navigate. **No DB write.**

## Translation content architecture

Two tiers, both on the existing `src/lib/i18n/` scaffold.

### a) UI dictionary
`src/lib/i18n/en.ts` (expanded) + new `src/lib/i18n/es.ts` covering: common, nav, buttons, form labels, validation/error/loading/empty-state messages, section headers, CTA copy, and metadata strings. `Dictionary` type derived from the English object; the Spanish object must satisfy the same type (compile-time completeness check).

### b) Localized content modules
Large structured content is converted from single exports to locale-keyed data selected by a getter. **IDs, tags, ages, times, and structure stay identical across locales — only human-readable text differs.**

- `src/lib/quiz/questions.ts` → `getQuestions(locale)` (+ `questions.es.ts` / `questions.en.ts`)
- `src/data/sos-scripts.ts` → `getSosScripts(locale)` (8 scripts × 7 text fields)
- `src/data/parent-growth-path.ts` → `getGrowthPath(locale)` (7 skills × ~20 fields)
- `src/lib/engine/fallback-activities.ts` → locale-keyed activity catalog keyed by `id` (15 activities)
- `src/lib/routines/routines.ts` → locale-keyed routine text keyed by `id` (5 routines); selection logic (`deriveRoutine`) unchanged
- `src/lib/quiz/tags.ts` display maps + `plan-generator` quiz-summary/`deriveBestFor` maps → locale-aware getters
- Legal pages (`/terms`, `/privacy`) → per-locale content
- Email templates (`src/lib/email/index.ts`) → per-locale subject + body

## Plan re-localization (core technical piece)

Stored `plan_json` already carries stable keys per plan: each day's `activity.id`, the `routine.id`, per-day `routineMoment`, and tag keys (`profile`, `goal`, `plan_style`, `bestMoment`, `hardMoment`). **Add `tagProfile` to the stored `WeeklyPlan`** (small) so the quiz summary can be rebuilt in any locale.

A pure function `localizePlan(plan, locale): WeeklyPlan` runs in the dashboard server components and re-derives **all** display text from those keys against the locale-keyed content modules:

- Each day's activity fields (`title`, `description`, `materials`, `steps`, `parent_script`, `fallback_if_refuses`, `why_it_works`, `easier_version`, `bestFor`) ← localized activity catalog by `activity.id`.
- Routine (`title`, `whenToUse`, `steps`, `script`) ← localized routines by `routine.id`.
- Display strings (`profileDisplayName`, `goalDisplayText`, `planStyleDisplay`, `bestMomentDisplay`, `hardMomentDisplay`) ← locale-aware tag getters using stored keys.
- `quizSummary` (`youToldUs`, `soWeCreated`) ← rebuilt by a locale-aware `buildQuizSummary` from the stored `tagProfile`.
- **Graceful fallback:** if an `id` is missing from the code catalog (e.g. a future DB-seeded activity), keep the stored baked text.

Consequences: toggling EN/ES instantly re-localizes existing plans; generation stays deterministic; `plan_json` content remains English (DB unchanged) and is overridden at render. Generation locale is irrelevant to display.

**Rejected alternative:** regenerate/store a plan per locale — would not re-localize existing plans and adds storage/complexity.

## Emails & metadata

- Magic-link / welcome / plan-ready emails are rendered in the locale read from the `tinyplan_locale` cookie at send time (API routes use `await cookies()`); no DB locale needed. Verify links include the locale prefix so post-verify redirects land on the localized dashboard.
- Each page's `generateMetadata` returns localized `title`/`description` from the dictionary plus `alternates.languages` (`es`/`en` hreflang).

## Internal links & redirects

All in-app `<Link href>` and `redirect()` targets carry the active locale prefix (e.g. `redirect('/auth/login')` → `redirect(`/${locale}/auth/login`)`). The proxy is the safety net for any missed prefix, but prefixing preserves the user's chosen locale.

## Out of scope

- `/admin` and `/api/*` remain English and structurally unchanged.
- No third-party i18n library.
- No DB schema/content changes for localization (DB stays English).

## Risks & testing

- **Risk:** missed locale prefixes on links/redirects → proxy redirect drops chosen locale. Mitigation: audit links; proxy fallback.
- **Risk:** Spanish object drifting out of sync with the `Dictionary` type. Mitigation: typed dictionaries (compile error on missing keys).
- **Risk:** activity/routine `id` mismatch between locales breaks `localizePlan`. Mitigation: shared id list; fallback to stored text.
- **Verification:** `npm run build` (includes type-check); manual walk of `/es` and `/en` across landing → quiz → result → pricing → auth → dashboard (today/week/sos/library/progress); confirm a pre-existing English-generated plan re-localizes on toggle; confirm `/admin` still works and is unaffected.

## Execution strategy

1. Build the plumbing directly: i18n core, `proxy.ts`, `[lang]` restructure, root/locale layouts, `LocaleProvider` + `useT`, `LanguageSwitcher`, `localizePlan`, locale-aware getters, link/redirect prefixing, localized metadata, localized emails.
2. Translate the ~1,800 strings across content domains in parallel (one worker per domain: UI dictionary, quiz, SOS, growth-path, activities, routines, landing, dashboard, legal, emails), enforcing a shared glossary (`tú`; consistent terms for "play profile", "toolkit", "SOS", "parent script", etc.) and neutral LatAm tone.
3. Spanish-quality verification pass (tone, consistency, placeholder/variable preservation) before build + manual walkthrough.
