// src/app/[lang]/layout.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { LocaleProvider } from "@/components/i18n/locale-provider";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Per-locale Open Graph locale tags. Pages under this segment inherit these
// (and supply their own title/description + hreflang alternates).
const OG_LOCALE: Record<Locale, { locale: string; alternate: string }> = {
  es: { locale: "es_ES", alternate: "en_US" },
  en: { locale: "en_US", alternate: "es_ES" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const og = OG_LOCALE[lang as Locale];
  return {
    openGraph: {
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
