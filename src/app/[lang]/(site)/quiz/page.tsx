import type { Metadata } from "next";
import { resolveLocale, type Locale } from "@/lib/i18n/config";
import { QuizShell } from "@/components/quiz/quiz-shell";

const quizMeta: Record<Locale, { title: string; description: string }> = {
  es: {
    title: "Test — TinyPlan",
    description:
      "Responde unas preguntas sencillas y obtén tu plan de juego personalizado de 7 días.",
  },
  en: {
    title: "Quiz — TinyPlan",
    description:
      "Answer a few simple questions to get your personalized 7-day play plan.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const meta = quizMeta[locale];
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${locale}/quiz`,
      languages: {
        es: "/es/quiz",
        en: "/en/quiz",
        "x-default": "/es/quiz",
      },
    },
  };
}

export default function QuizPage() {
  return <QuizShell />;
}
