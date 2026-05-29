import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { StickyMobileCTA } from "@/components/landing/sticky-cta";
import {
  IconTile,
  LandingIcon,
  type IconTileTint,
  type LandingIconName,
} from "@/components/landing/landing-icons";

/* ── Content ──────────────────────────────────────────────── */

const trustChips: { name: LandingIconName; label: string }[] = [
  { name: "calendar", label: "Ages 2–6" },
  { name: "shield", label: "No child diagnosis" },
  { name: "screen-off", label: "No extra screen time" },
  { name: "heart", label: "Parent-first" },
  { name: "refresh", label: "Cancel anytime" },
];

const painCards: {
  name: LandingIconName;
  tint: IconTileTint;
  title: string;
  text: string;
}[] = [
  {
    name: "screen-off",
    tint: "lavender",
    title: "Screens became the default",
    text: "You want fewer screen battles, but need realistic alternatives that actually work.",
  },
  {
    name: "transition",
    tint: "peach",
    title: "Transitions turn emotional",
    text: "Leaving the park, stopping a show, starting bedtime — tiny moments can become huge.",
  },
  {
    name: "lightbulb",
    tint: "gold",
    title: "You run out of play ideas",
    text: "You don’t need 100 ideas. You need the right next idea for today.",
  },
  {
    name: "speech",
    tint: "sage",
    title: "You feel unsure what to say",
    text: "TinyPlan gives you exact words for the moments where you usually freeze.",
  },
];

const previewItems: {
  n: number;
  name: string;
  value: string;
  icon: LandingIconName;
  tint: IconTileTint;
  body?: string;
  steps?: string[];
  open?: boolean;
}[] = [
  {
    n: 1,
    name: "Play Moment",
    value: "Tiny City Choices",
    icon: "blocks",
    tint: "peach",
    body: "A quick build-and-choose game matched to your child’s age and energy.",
  },
  {
    n: 2,
    name: "Parent Skill",
    value: "Small Control",
    icon: "spark",
    tint: "lavender",
    open: true,
    steps: ["Name the limit", "Name the feeling", "Offer two choices"],
  },
  {
    n: 3,
    name: "Scripts",
    value: "What to say if they resist",
    icon: "script",
    tint: "sage",
    body: "First / then / done — plus the exact words to use if your child pushes back.",
  },
  {
    n: 4,
    name: "If It Gets Hard",
    value: "Backup reset",
    icon: "lifebuoy",
    tint: "blush",
    body: "A calmer fallback for when they say no, lose interest, or melt down.",
  },
  {
    n: 5,
    name: "Tiny Check-in",
    value: "Adjust tomorrow",
    icon: "check-circle",
    tint: "gold",
    body: "One tap tells TinyPlan how it went — and shapes tomorrow’s plan.",
  },
];

const toolkitCards: {
  name: LandingIconName;
  tint: IconTileTint;
  title: string;
  text: string;
}[] = [
  {
    name: "blocks",
    tint: "peach",
    title: "Play Moment",
    text: "A realistic activity matched to your child’s age, energy, and the time you actually have.",
  },
  {
    name: "spark",
    tint: "lavender",
    title: "Parent Skill",
    text: "A tiny parenting move to practice today — like Small Control or Predictable Start.",
  },
  {
    name: "script",
    tint: "sage",
    title: "Ready-to-use Scripts",
    text: "Exact words for starting, resistance, big feelings, and transitions.",
  },
  {
    name: "lifebuoy",
    tint: "blush",
    title: "If It Gets Hard",
    text: "A backup plan for when your child says no, loses interest, or melts down.",
  },
  {
    name: "check-circle",
    tint: "gold",
    title: "Tiny Check-in",
    text: "Your feedback helps TinyPlan adjust tomorrow’s plan.",
  },
];

const howItWorks: { name: LandingIconName; title: string; text: string }[] = [
  {
    name: "check-circle",
    title: "Take the 3-minute quiz",
    text: "Tell us your child’s age, your routine, and what feels hardest right now.",
  },
  {
    name: "spark",
    title: "Get your personalized toolkit",
    text: "A 7-day plan built from your answers — play, scripts, skills, and SOS support.",
  },
  {
    name: "refresh",
    title: "Open one small plan a day",
    text: "Check in after each day and TinyPlan adjusts tomorrow to fit real life.",
  },
];

const personalization: {
  name: LandingIconName;
  tint: IconTileTint;
  input: string;
  output: string;
}[] = [
  {
    name: "calendar",
    tint: "sage",
    input: "Child’s age",
    output: "Age-appropriate activities and scripts — no reading-heavy tasks for 2-year-olds.",
  },
  {
    name: "alert",
    tint: "peach",
    input: "Hardest moment",
    output: "Your daily focus and SOS cards are prioritized around that pain point.",
  },
  {
    name: "clock",
    tint: "lavender",
    input: "Time available",
    output: "3-minute, 7-minute, and 15-minute versions of every plan.",
  },
  {
    name: "user",
    tint: "gold",
    input: "Child’s play style",
    output: "A play profile: Curious Builder, Active Explorer, Routine Seeker, or Story Starter.",
  },
  {
    name: "lifebuoy",
    tint: "blush",
    input: "Parent obstacle",
    output: "Backup cards for “child refuses,” “I’m too tired,” or “no materials.”",
  },
  {
    name: "home",
    tint: "sage",
    input: "Materials at home",
    output: "Activities filtered to what your family can actually do.",
  },
];

const growthPath: { day: number; skill: string; text: string }[] = [
  { day: 1, skill: "Small Control", text: "Give one small choice when something can’t change." },
  { day: 2, skill: "Predictable Start", text: "Make the next step clear with first / then / done." },
  { day: 3, skill: "Name Before Fixing", text: "Help feelings settle before trying to solve." },
  { day: 4, skill: "Say Less, Show More", text: "Use fewer words and more simple action." },
  { day: 5, skill: "Start Smaller", text: "Make the first step so easy your child can join." },
  { day: 6, skill: "Calm Boundary", text: "Hold the line without turning it into a lecture." },
  { day: 7, skill: "Repair & Repeat", text: "Notice what worked and build your family rhythm." },
];

const sosCards: { name: LandingIconName; label: string }[] = [
  { name: "screen-off", label: "Screen time ending" },
  { name: "clock", label: "Bedtime battle" },
  { name: "alert", label: "Child says no" },
  { name: "speech", label: "Public meltdown" },
  { name: "transition", label: "Sibling conflict" },
  { name: "heart", label: "Parent needs a moment" },
];

const insights: { feedback: string; adjustment: string }[] = [
  { feedback: "“Too hard”", adjustment: "Tomorrow starts with a shorter version and fewer steps." },
  { feedback: "“Child refused”", adjustment: "Tomorrow includes a gentler entry point and a backup script." },
  { feedback: "“Loved it”", adjustment: "TinyPlan keeps the same play style and adds slight variety." },
  { feedback: "“I’m too tired”", adjustment: "Tomorrow prioritizes no-prep, parent-light activities." },
  {
    feedback: "SOS used twice for bedtime",
    adjustment: "Next week adds more bedtime transition support.",
  },
];

const libraryTabs: {
  name: LandingIconName;
  tint: IconTileTint;
  title: string;
  text: string;
}[] = [
  {
    name: "grid",
    tint: "peach",
    title: "Activities",
    text: "Age-appropriate play moments, no-prep ideas, indoor and outdoor, bedtime, and movement.",
  },
  {
    name: "spark",
    tint: "lavender",
    title: "Parent Skills",
    text: "Small Control, Predictable Start, Calm Boundary, Repair After No, and Start Smaller.",
  },
  {
    name: "script",
    tint: "sage",
    title: "Scripts",
    text: "Exact words for transitions, refusals, ending screen time, and bedtime.",
  },
  {
    name: "timer",
    tint: "gold",
    title: "3-Min Resets",
    text: "Fast tools for hard moments when you have no energy left.",
  },
  {
    name: "lifebuoy",
    tint: "blush",
    title: "SOS Cards",
    text: "Ready-made response flows for the most common difficult situations.",
  },
];

const safetyPoints: { name: LandingIconName; tint: IconTileTint; title: string; text: string }[] = [
  {
    name: "shield",
    tint: "sage",
    title: "No diagnosis",
    text: "TinyPlan does not diagnose, treat, or replace professional support.",
  },
  {
    name: "user",
    tint: "peach",
    title: "Parent-first",
    text: "The app is for the parent. Activities happen offline, with your child.",
  },
  {
    name: "lock",
    tint: "sage",
    title: "No unnecessary child data",
    text: "We ask only what is needed to build your plan — never a child’s name or photo.",
  },
  {
    name: "heart",
    tint: "blush",
    title: "No guilt",
    text: "Realistic small moments, not a picture of perfect parenting.",
  },
  {
    name: "calendar",
    tint: "lavender",
    title: "Age-appropriate",
    text: "Activities change based on age and attention span.",
  },
];

const pricingIncludes = [
  "A daily parent toolkit",
  "Age-appropriate activities",
  "Parent skill lessons",
  "Ready-to-use scripts",
  "SOS coach",
  "Adaptive insights",
  "Weekly check-ins",
];

const faqs: { q: string; a: string }[] = [
  {
    q: "Is TinyPlan for my child or for me?",
    a: "TinyPlan is for parents and caregivers. Your child doesn’t need to use the app — you use it to get offline play ideas, scripts, and support.",
  },
  {
    q: "What ages is it for?",
    a: "TinyPlan is designed for ages 2–6. The quiz changes activities and scripts based on age and attention span.",
  },
  {
    q: "Is this therapy or medical advice?",
    a: "No. TinyPlan does not diagnose, treat, or replace professional advice. It gives practical parent support for everyday routines and hard moments.",
  },
  {
    q: "Do I need special toys?",
    a: "No. TinyPlan can build plans around what you already have: paper, blocks, books, kitchen items, or nothing special.",
  },
  {
    q: "How much time do I need?",
    a: "Most plans include 3-minute, 7-minute, and longer versions, depending on your quiz answers and feedback.",
  },
  {
    q: "Can I cancel?",
    a: "Yes. Start for $1 for 7 days, then $14.99/month. Cancel anytime.",
  },
  {
    q: "Will this add screen time?",
    a: "No. TinyPlan is for the parent. The activities are designed to happen offline.",
  },
];

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

/* ── Page ─────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border-whisper bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="TinyPlan home" className="flex items-center">
            <BrandLogo width={132} priority />
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#what-you-get"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              What you get
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/auth/login"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Log in
            </Link>
            <Link href="/quiz">
              <Button size="sm" className="rounded-full px-5">
                Build my plan
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
                A 7-day parent toolkit
              </p>
              <h1
                className="landing-reveal text-[34px] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[56px]"
                style={{ animationDelay: "60ms" }}
              >
                Know what to do — and what to say —{" "}
                <span className="gradient-text-primary">during the hard moments.</span>
              </h1>
              <p
                className="landing-reveal mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0"
                style={{ animationDelay: "120ms" }}
              >
                TinyPlan builds a 7-day parent toolkit around your child’s age, your
                routine, and what feels hardest right now. Every day you get one play
                moment, one parent skill, ready-to-use scripts, and SOS support.
              </p>
              <div
                className="landing-reveal mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start"
                style={{ animationDelay: "180ms" }}
              >
                <Link href="/quiz" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full rounded-full px-10 sm:w-auto">
                    Build my free plan
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground">
                  Takes 3 minutes.
                  <br className="hidden sm:block" /> No signup to start.
                </p>
              </div>
              <div
                className="landing-reveal mt-7 flex flex-wrap justify-center gap-2 lg:justify-start"
                style={{ animationDelay: "240ms" }}
              >
                {trustChips.map((c) => (
                  <TrustChip key={c.label} name={c.name} label={c.label} />
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
                  alt="A calm parent and child enjoying an offline play moment together"
                  width={1448}
                  height={1086}
                  className="h-auto w-full"
                  priority
                />
              </div>

              {/* Floating: Today's Toolkit */}
              <div className="absolute -left-2 top-6 w-[210px] rounded-2xl border border-border-whisper bg-card/95 p-3.5 shadow-elevated backdrop-blur-sm sm:-left-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Today’s Toolkit
                </p>
                <p className="mt-0.5 text-sm font-semibold">Focus: Calmer transitions</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <IconTile name="spark" tint="lavender" size="sm" />
                  <div className="leading-tight">
                    <p className="text-[11px] text-muted-foreground">Parent Skill</p>
                    <p className="text-xs font-semibold">Small Control</p>
                  </div>
                </div>
              </div>

              {/* Floating: SOS chip */}
              <div className="absolute -right-1 bottom-8 flex items-center gap-2 rounded-2xl border border-border-whisper bg-card/95 px-3.5 py-2.5 shadow-elevated backdrop-blur-sm sm:-right-4">
                <IconTile name="lifebuoy" tint="blush" size="sm" />
                <div className="leading-tight">
                  <p className="text-[11px] text-muted-foreground">SOS ready</p>
                  <p className="text-xs font-semibold">Help in the moment</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Problem recognition ── */}
        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Does this sound familiar?</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              You want calmer days, but real life gets messy fast.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {painCards.map((c) => (
              <div key={c.title} className="premium-card flex items-start gap-4 p-6">
                <IconTile name={c.name} tint={c.tint} />
                <div>
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Product promise + daily toolkit preview ── */}
        <section className="surface-sunken py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <Eyebrow>The daily toolkit</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Here’s what one day looks like
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Real parenting doesn’t need more pressure. It needs a next step. TinyPlan
                turns “what do I do now?” into one small, doable plan — with the exact
                words to go with it.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                {["7–10 min", "Low prep", "Age 5"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-card px-3.5 py-1.5 text-xs font-medium text-foreground/70 shadow-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                Tap any card below to see how a single day unfolds.
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
                        Today’s Toolkit
                      </p>
                      <p className="text-base font-bold">Focus: Calmer transitions</p>
                    </div>
                    <div className="space-y-2.5">
                      {previewItems.map((item) => (
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
            <Eyebrow>What you get every day</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              One complete parent toolkit, every day
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Not just an activity. A small plan for what to do, what to say, and how to
              respond.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {toolkitCards.map((c) => (
              <div key={c.title} className="premium-card p-6">
                <IconTile name={c.name} tint={c.tint} size="lg" />
                <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
              </div>
            ))}
            <div className="flex flex-col justify-center rounded-2xl border border-dashed border-primary/30 bg-primary-light/40 p-6 text-center">
              <p className="text-sm font-medium text-foreground/80">
                Five pieces. One simple plan. Built fresh for each of your 7 days.
              </p>
              <Link href="/quiz" className="mt-4">
                <Button size="sm" variant="outline" className="rounded-full">
                  Build my free plan
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── How it works + personalization ── */}
        <section id="how-it-works" className="landing-anchor surface-sunken py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow>How it works</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built from your answers
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                TinyPlan uses your child’s age, your routine, available time, materials, and
                hardest moments to build a plan you can actually follow.
              </p>
            </div>

            {/* 3-step flow */}
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {howItWorks.map((s, i) => (
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
                  alt="A few simple quiz answers shaping a personalized weekly plan"
                  width={1448}
                  height={1086}
                  className="mx-auto h-auto w-full max-w-sm rounded-2xl"
                />
              </div>
              <ul className="order-1 space-y-3 lg:order-2">
                {personalization.map((p) => (
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
            <Eyebrow>Parent growth path</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              TinyPlan helps you build your parent toolkit
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Each day teaches one small skill you can use beyond the activity — during
              bedtime, screen transitions, refusals, and everyday chaos.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {growthPath.map((g) => (
              <div key={g.day} className="premium-card flex flex-col p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {g.day}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Day {g.day}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold">{g.skill}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{g.text}</p>
              </div>
            ))}
            <div className="flex items-center justify-center rounded-2xl bg-secondary-light p-5 text-center">
              <p className="text-sm font-medium text-secondary">
                Seven small skills that add up to a calmer family rhythm.
              </p>
            </div>
          </div>
        </section>

        {/* ── SOS Coach ── */}
        <section className="surface-sunken py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>SOS coach</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                When the plan falls apart, TinyPlan stays useful
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Ask what to say when screen time ends, bedtime explodes, your child refuses,
                or you are too tired to think.
              </p>

              {/* Mini chat preview */}
              <div className="mt-7 space-y-3 rounded-2xl border border-border-whisper bg-card p-4 shadow-card">
                <div className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-sm">
                    My child is melting down because screen time ended.
                  </p>
                </div>
                <div className="flex items-end gap-2">
                  <IconTile name="lifebuoy" tint="blush" size="sm" />
                  <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-primary-light px-4 py-2.5 text-sm">
                    First, don’t explain yet. Name the want, hold the boundary, then offer
                    one small choice.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                You get the first 30 seconds, exact words, what <em>not</em> to do, a tiny
                next step — and whether to adjust tomorrow.
              </p>
            </div>

            <div>
              <p className="mb-4 text-sm font-semibold text-foreground/70">
                Quick SOS cards, ready when you need them:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {sosCards.map((s) => (
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
            <Eyebrow>Adaptive insights</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your plan learns from what actually happens
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              After each tiny check-in, TinyPlan can make tomorrow shorter, calmer, more
              active, or easier to start.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((ins) => (
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
                <Eyebrow>Library &amp; parent tools</Eyebrow>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  A structured toolkit, not a pile of random games
                </h2>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  Everything is organized so you can find the right support in seconds —
                  whatever today throws at you.
                </p>
              </div>
              <Image
                src="/images/illustrations/tinyplan-activity-library.png"
                alt="An organized library of activities, skills, scripts, and resets"
                width={1448}
                height={1086}
                className="mx-auto h-auto w-full max-w-[260px] rounded-2xl lg:ml-auto lg:mr-0"
              />
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {libraryTabs.map((t) => (
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
            <Eyebrow>Safety &amp; trust</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for real parents. Not medical advice. Not another screen for your child.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {safetyPoints.map((p) => (
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
              <Eyebrow>Pricing</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Your personalized 7-day toolkit is ready after the quiz
              </h2>
              <div className="mt-6 flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold gradient-text-primary">$1</span>
                <span className="text-muted-foreground">for 7 days</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Then $14.99/month. Cancel anytime.
              </p>

              <ul className="mx-auto mt-7 grid max-w-sm gap-2.5 text-left">
                {pricingIncludes.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <LandingIcon name="check-circle" className="h-[18px] w-[18px] shrink-0 text-secondary" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href="/quiz">
                  <Button size="lg" className="w-full rounded-full">
                    Build my free plan
                  </Button>
                </Link>
                <Link
                  href="/pricing"
                  className="mt-4 inline-block text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  See full plan &amp; pricing
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="surface-sunken py-20">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <div className="text-center">
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Questions, answered
              </h2>
            </div>
            <div className="mt-10 space-y-3">
              {faqs.map((f) => (
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
              Less guessing. <span className="gradient-text-primary">More confident parenting.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Start with a free quiz and unlock a personalized 7-day toolkit built around
              your real life.
            </p>
            <div className="mt-8">
              <Link href="/quiz">
                <Button size="lg" className="rounded-full px-12">
                  Build my free plan
                </Button>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Takes 3 minutes. No signup to start.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {trustChips.map((c) => (
                <TrustChip key={c.label} name={c.name} label={c.label} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-whisper py-10 pb-24 md:pb-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-6 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; 2026 TinyPlan. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms of Service
            </Link>
            <a href="mailto:hello@tinyplan.app" className="transition-colors hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>

      <StickyMobileCTA />
    </div>
  );
}
