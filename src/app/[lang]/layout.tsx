// src/app/[lang]/layout.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { LocaleProvider } from "@/components/i18n/locale-provider";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Per-locale Open Graph defaults. NOTE: Next.js metadata merging is SHALLOW —
// a segment's `openGraph` object REPLACES the parent's entirely (it wiped the
// root layout's siteName/type when this block only set `locale`). So this
// block must be complete: every localized page that does not define its own
// `openGraph` inherits exactly this object (plus the file-convention OG image
// from ./opengraph-image.tsx). Pages that DO define `openGraph` (the landing
// page) must likewise re-specify all fields.
const OG_DEFAULTS: Record<
  Locale,
  { locale: string; alternate: string; title: string; description: string }
> = {
  es: {
    locale: "es_ES",
    alternate: "en_US",
    title: "TinyPlan — Un kit de juego y rutina de 7 días personalizado",
    description:
      "Planes de juego y rutina personalizados para mamás y papás de niños de 2 a 6 años.",
  },
  en: {
    locale: "en_US",
    alternate: "es_ES",
    title: "TinyPlan — A personalized 7-day play & routine toolkit",
    description:
      "Personalized play and routine plans for parents of children aged 2–6.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const og = OG_DEFAULTS[lang as Locale];
  return {
    openGraph: {
      type: "website",
      siteName: "TinyPlan",
      title: og.title,
      description: og.description,
      locale: og.locale,
      alternateLocale: [og.alternate],
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang as Locale);
  return (
    <LocaleProvider locale={lang as Locale} dict={dict}>
      {children}
    </LocaleProvider>
  );
}
