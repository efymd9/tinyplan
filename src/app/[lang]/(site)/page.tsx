import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { StickyMobileCTA } from "@/components/landing/sticky-cta";
import {
  IconTile,
  LandingIcon,
  type LandingIconName,
} from "@/components/landing/landing-icons";
import { localizeHref } from "@/lib/i18n/href";
import { resolveLocale, type Locale } from "@/lib/i18n/config";
import { clerkEnabled } from "@/lib/auth/magic-link";
import { getLandingContent } from "./landing-content";

/* ── Small building blocks ────────────────────────────────── */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
      {children}
    </p>
  );
}

function TrustChip({ name, label }: { name: LandingIconName; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground/80 shadow-xs">
      <LandingIcon name={name} className="h-3.5 w-3.5 text-primary" />
      {label}
    </span>
  );
}

function Chevron() {
  return (
    <svg
      className="toolkit-chevron h-4 w-4 shrink-0 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/* Renders a string with a single `__emphasized__` span as <em>. */
function EmphasizedText({ text }: { text: string }) {
  const parts = text.split("__");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <em key={i}>{part}</em> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

/* ── Metadata ─────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const c = getLandingContent(locale);
  return {
    title: { absolute: c.meta.title },
    description: c.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { es: "/es", en: "/en", "x-default": "/es" },
    },
    openGraph: {
      title: c.meta.title,
      description: c.meta.description,
      url: `/${locale}`,
    },
    twitter: {
      title: c.meta.title,
      description: c.meta.description,
    },
  };
}

/* ── Page ─────────────────────────────────────────────────── */

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = resolveLocale(lang) as Locale;
  const c = getLandingContent(locale);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border-whisper bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href={localizeHref("/", locale)}
            aria-label={c.nav.homeAria}
            className="flex items-center"
          >
            <BrandLogo width={132} priority />
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label={c.nav.primaryAria}>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {c.nav.howItWorks}
            </a>
            <a
              href="#what-you-get"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {c.nav.whatYouGet}
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {c.nav.pricing}
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href={clerkEnabled ? "/sign-in" : localizeHref("/auth/login", locale)}
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              {c.nav.logIn}
            </Link>
            <Link href={localizeHref("/quiz", locale)}>
              <Button size="sm" className="rounded-full px-5">
                {c.nav.buildMyPlan}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="surface-hero overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-24 lg:pt-20">
            {/* Left: copy + CTA */}
            <div className="text-center lg:text-left">
              <p className="landing-reveal mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-light/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                <LandingIcon name="heart" className="h-3.5 w-3.5" />
                {c.hero.badge}
              </p>
              <h1
                className="landing-reveal text-[34px] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[56px]"
                style={{ animationDelay: "60ms" }}
              >
                {c.hero.headingLead}{" "}
                <span className="gradient-text-primary">{c.hero.headingAccent}</span>
              </h1>
              <p
                className="landing-reveal mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0"
                style={{ animationDelay: "120ms" }}
              >
                {c.hero.subhead}
              </p>
              <div
                className="landing-reveal mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start"
                style={{ animationDelay: "180ms" }}
              >
                <Link href={localizeHref("/quiz", locale)} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full rounded-full px-10 sm:w-auto">
                    {c.hero.cta}
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground">
                  {c.hero.ctaNote1}
                  <br className="hidden sm:block" /> {c.hero.ctaNote2}
                </p>
              </div>
              <div
                className="landing-reveal mt-7 flex flex-wrap justify-center gap-2 lg:justify-start"
                style={{ animationDelay: "240ms" }}
              >
                {c.trustChips.map((chip) => (
                  <TrustChip key={chip.label} name={chip.name} label={chip.label} />
                ))}
              </div>
            </div>

            {/* Right: illustration + floating UI preview */}
            <div
              className="landing-reveal relative mx-auto w-full max-w-md lg:max-w-none"
              style={{ animationDelay: "200ms" }}
            >
              <div className="hero-card overflow-hidden rounded-[2rem]">
                <Image
                  src="/images/illustrations/tinyplan-landing-hero.png"
                  alt={c.hero.illustrationAlt}
                  width={1448}
                  height={1086}
                  className="h-auto w-full"
                  priority
                />
              </div>

              {/* Floating: Today's Toolkit */}
              <div className="absolute -left-2 top-6 w-[210px] rounded-2xl border border-border-whisper bg-card/95 p-3.5 shadow-elevated backdrop-blur-sm sm:-left-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {c.hero.floatToolkitLabel}
                </p>
                <p className="mt-0.5 text-sm font-semibold">{c.hero.floatToolkitFocus}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <IconTile name="spark" tint="lavender" size="sm" />
                  <div className="leading-tight">
                    <p className="text-[11px] text-muted-foreground">
                      {c.hero.floatToolkitSkillLabel}
                    </p>
                    <p className="text-xs font-semibold">{c.hero.floatToolkitSkillValue}</p>
                  </div>
                </div>
              </div>

              {/* Floating: SOS chip */}
              <div className="absolute -right-1 bottom-8 flex items-center gap-2 rounded-2xl border border-border-whisper bg-card/95 px-3.5 py-2.5 shadow-elevated backdrop-blur-sm sm:-right-4">
                <IconTile name="lifebuoy" tint="blush" size="sm" />
                <div className="leading-tight">
                  <p className="text-[11px] text-muted-foreground">{c.hero.floatSosLabel}</p>
                  <p className="text-xs font-semibold">{c.hero.floatSosValue}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Problem recognition ── */}
        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{c.pain.eyebrow}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {c.pain.heading}
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {c.pain.cards.map((card) => (
              <div key={card.title} className="premium-card flex items-start gap-4 p-6">
                <IconTile name={card.name} tint={card.tint} />
                <div>
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Product promise + daily toolkit preview ── */}
        <section className="surface-sunken py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <Eyebrow>{c.dayPreview.eyebrow}</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {c.dayPreview.heading}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {c.dayPreview.body}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                {c.dayPreview.chips.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-card px-3.5 py-1.5 text-xs font-medium text-foreground/70 shadow-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                {c.dayPreview.tapHint}
              </p>
            </div>

            {/* Phone mockup */}
            <div className="mx-auto w-full max-w-[320px]">
              <div className="rounded-[2.6rem] bg-foreground/90 p-2.5 shadow-elevated">
                <div className="relative overflow-hidden rounded-[2rem] bg-background">
                  <div className="relative flex h-8 items-center justify-center">
                    <span className="h-1.5 w-16 rounded-full bg-foreground/15" />
                  </div>
                  <div className="px-3 pb-5">
                    <div className="mb-3 px-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {c.dayPreview.phoneToolkitLabel}
                      </p>
                      <p className="text-base font-bold">{c.dayPreview.phoneFocus}</p>
                    </div>
                    <div className="space-y-2.5">
                      {c.dayPreview.items.map((item) => (
                        <details
                          key={item.n}
                          className="toolkit-card"
                          open={item.open}
                        >
                          <summary className="flex items-center gap-3 p-3">
                            <IconTile name={item.icon} tint={item.tint} size="sm" />
                            <span className="flex-1">
                              <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                                {item.n}. {item.name}
                              </span>
                              <span className="block text-sm font-semibold leading-tight">
                                {item.value}
                              </span>
                            </span>
                            <Chevron />
                          </summary>
                          <div className="toolkit-body px-3 pb-3.5">
                            {item.steps ? (
                              <ol className="space-y-1.5">
                                {item.steps.map((s, i) => (
                                  <li
                                    key={s}
                                    className="flex items-center gap-2 rounded-lg bg-lavender-light px-2.5 py-1.5 text-xs font-medium text-foreground/80"
                                  >
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lavender text-[10px] font-bold text-white">
                                      {i + 1}
                                    </span>
                                    {s}
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <p className="text-xs leading-relaxed text-muted-foreground">
                                {item.body}
                              </p>
                            )}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── What you get every day ── */}
        <section id="what-you-get" className="landing-anchor mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{c.toolkit.eyebrow}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {c.toolkit.heading}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {c.toolkit.body}
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.toolkit.cards.map((card) => (
              <div key={card.title} className="premium-card p-6">
                <IconTile name={card.name} tint={card.tint} size="lg" />
                <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{card.text}</p>
              </div>
            ))}
            <div className="flex flex-col justify-center rounded-2xl border border-dashed border-primary/30 bg-primary-light/40 p-6 text-center">
              <p className="text-sm font-medium text-foreground/80">
                {c.toolkit.ctaCardText}
              </p>
              <Link href={localizeHref("/quiz", locale)} className="mt-4">
                <Button size="sm" variant="outline" className="rounded-full">
                  {c.toolkit.ctaCardButton}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── How it works + personalization ── */}
        <section id="how-it-works" className="landing-anchor surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow>{c.howItWorks.eyebrow}</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {c.howItWorks.heading}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {c.howItWorks.body}
              </p>
            </div>

            {/* 3-step flow */}
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {c.howItWorks.steps.map((s, i) => (
                <div key={s.title} className="premium-card relative p-6">
                  <span className="absolute right-5 top-5 text-3xl font-bold text-primary/15">
                    {i + 1}
                  </span>
                  <IconTile name={s.name} tint="peach" />
                  <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>

            {/* input → output */}
            <div className="mt-14 grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="order-2 lg:order-1">
                <Image
                  src="/images/illustrations/tinyplan-quiz-discovery.png"
                  alt={c.howItWorks.quizImageAlt}
                  width={1448}
                  height={1086}
                  className="mx-auto h-auto w-full max-w-sm rounded-2xl"
                />
              </div>
              <ul className="order-1 space-y-3 lg:order-2">
                {c.howItWorks.personalization.map((p) => (
                  <li
                    key={p.input}
                    className="flex items-center gap-3 rounded-2xl border border-border-whisper bg-card p-4 shadow-xs sm:gap-4"
                  >
                    <IconTile name={p.name} tint={p.tint} />
                    <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                      <span className="shrink-0 text-sm font-semibold sm:w-36">{p.input}</span>
                      <LandingIcon
                        name="arrow-right"
                        className="hidden h-4 w-4 shrink-0 text-primary/50 sm:block"
                      />
                      <span className="text-sm leading-snug text-muted-foreground">
                        {p.output}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Parent Growth Path ── */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{c.growthPath.eyebrow}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {c.growthPath.heading}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {c.growthPath.body}
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.growthPath.items.map((g) => (
              <div key={g.day} className="premium-card flex flex-col p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {g.day}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {c.growthPath.dayLabel} {g.day}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold">{g.skill}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{g.text}</p>
              </div>
            ))}
            <div className="flex items-center justify-center rounded-2xl bg-secondary-light p-5 text-center">
              <p className="text-sm font-medium text-secondary">
                {c.growthPath.closingText}
              </p>
            </div>
          </div>
        </section>

        {/* ── SOS Coach ── */}
        <section className="surface-sunken py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>{c.sos.eyebrow}</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {c.sos.heading}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {c.sos.body}
              </p>

              {/* Mini chat preview */}
              <div className="mt-7 space-y-3 rounded-2xl border border-border-whisper bg-card p-4 shadow-card">
                <div className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-sm">
                    {c.sos.chatUser}
                  </p>
                </div>
                <div className="flex items-end gap-2">
                  <IconTile name="lifebuoy" tint="blush" size="sm" />
                  <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-primary-light px-4 py-2.5 text-sm">
                    {c.sos.chatReply}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                <EmphasizedText text={c.sos.footnote} />
              </p>
            </div>

            <div>
              <p className="mb-4 text-sm font-semibold text-foreground/70">
                {c.sos.cardsLabel}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {c.sos.cards.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-3 rounded-2xl border border-border-whisper bg-card p-4 shadow-xs"
                  >
                    <IconTile name={s.name} tint="peach" size="sm" />
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Adaptive Insights ── */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{c.insights.eyebrow}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {c.insights.heading}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {c.insights.body}
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {c.insights.items.map((ins) => (
              <div key={ins.feedback} className="premium-card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="rounded-full bg-muted px-3 py-1 text-foreground/80">
                    {ins.feedback}
                  </span>
                </div>
                <div className="mt-3 flex items-start gap-2.5">
                  <LandingIcon name="arrow-right" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {ins.adjustment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Library / Parent Tools ── */}
        <section className="surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <Eyebrow>{c.library.eyebrow}</Eyebrow>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {c.library.heading}
                </h2>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  {c.library.body}
                </p>
              </div>
              <Image
                src="/images/illustrations/tinyplan-activity-library.png"
                alt={c.library.imageAlt}
                width={1448}
                height={1086}
                className="mx-auto h-auto w-full max-w-[260px] rounded-2xl lg:ml-auto lg:mr-0"
              />
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {c.library.tabs.map((t) => (
                <div key={t.title} className="premium-card flex items-start gap-4 p-5">
                  <IconTile name={t.name} tint={t.tint} />
                  <div>
                    <h3 className="text-base font-semibold">{t.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Safety & trust ── */}
        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{c.safety.eyebrow}</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {c.safety.heading}
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.safety.points.map((p) => (
              <div key={p.title} className="premium-card p-6">
                <IconTile name={p.name} tint={p.tint} />
                <h3 className="mt-3 text-base font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="landing-anchor px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-xl">
            <div className="hero-card overflow-hidden rounded-[2rem] p-8 text-center sm:p-10">
              <Eyebrow>{c.pricing.eyebrow}</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {c.pricing.heading}
              </h2>
              <div className="mt-6 flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold gradient-text-primary">{c.pricing.price}</span>
                <span className="text-muted-foreground">{c.pricing.priceUnit}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {c.pricing.priceNote}
              </p>

              <ul className="mx-auto mt-7 grid max-w-sm gap-2.5 text-left">
                {c.pricing.includes.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <LandingIcon name="check-circle" className="h-[18px] w-[18px] shrink-0 text-secondary" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href={localizeHref("/quiz", locale)}>
                  <Button size="lg" className="w-full rounded-full">
                    {c.pricing.cta}
                  </Button>
                </Link>
                <Link
                  href={localizeHref("/pricing", locale)}
                  className="mt-4 inline-block text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {c.pricing.seeFull}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="surface-sunken py-20">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <div className="text-center">
              <Eyebrow>{c.faq.eyebrow}</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {c.faq.heading}
              </h2>
            </div>
            <div className="mt-10 space-y-3">
              {c.faq.items.map((f) => (
                <details key={f.q} className="toolkit-card">
                  <summary className="flex items-center justify-between gap-4 p-5">
                    <span className="text-base font-semibold">{f.q}</span>
                    <Chevron />
                  </summary>
                  <div className="toolkit-body px-5 pb-5">
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="surface-hero px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-[44px] sm:leading-[1.1]">
              {c.finalCta.headingLead}{" "}
              <span className="gradient-text-primary">{c.finalCta.headingAccent}</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              {c.finalCta.body}
            </p>
            <div className="mt-8">
              <Link href={localizeHref("/quiz", locale)}>
                <Button size="lg" className="rounded-full px-12">
                  {c.finalCta.cta}
                </Button>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                {c.finalCta.note}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {c.trustChips.map((chip) => (
                <TrustChip key={chip.label} name={chip.name} label={chip.label} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-whisper py-10 pb-24 md:pb-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-6 text-sm text-muted-foreground sm:flex-row">
          <p>{c.footer.rights}</p>
          <div className="flex gap-8">
            <Link href={localizeHref("/privacy", locale)} className="transition-colors hover:text-foreground">
              {c.footer.privacy}
            </Link>
            <Link href={localizeHref("/terms", locale)} className="transition-colors hover:text-foreground">
              {c.footer.terms}
            </Link>
            <a href="mailto:hello@tinyplan.org" className="transition-colors hover:text-foreground">
              {c.footer.contact}
            </a>
          </div>
        </div>
      </footer>

      <StickyMobileCTA />
    </div>
  );
}
