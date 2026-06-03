import type { Metadata } from "next";
import { resolveLocale, type Locale } from "@/lib/i18n/config";
import { PricingClient } from "./pricing-client";

const pricingMeta: Record<Locale, { title: string; description: string }> = {
  es: {
    title: "Precios — TinyPlan",
    description:
      "Desbloquea tu kit de herramientas para padres de 7 días: $1 por 7 días, luego $14.99/mes. Cancela cuando quieras.",
  },
  en: {
    title: "Pricing — TinyPlan",
    description:
      "Unlock your 7-day parent toolkit: $1 for 7 days, then $14.99/month. Cancel anytime.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const meta = pricingMeta[locale];
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${locale}/pricing`,
      languages: {
        es: "/es/pricing",
        en: "/en/pricing",
        "x-default": "/es/pricing",
      },
    },
  };
}

export default function PricingPage() {
  return <PricingClient />;
}
