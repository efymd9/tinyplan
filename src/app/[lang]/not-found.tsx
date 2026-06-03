// Branded 404 for pages under app/[lang]/ that call notFound(). not-found.js
// receives no params, so we read the locale from the proxy-set cookie (server
// component), defaulting to es.
import Link from "next/link";
import { cookies } from "next/headers";
import { resolveLocale } from "@/lib/i18n/config";
import { localizeHref } from "@/lib/i18n/href";

const COPY = {
  es: {
    code: "404",
    title: "No encontramos esta página",
    body: "El enlace puede estar roto o la página se movió. Volvamos a un lugar conocido.",
    home: "Volver al inicio",
    quiz: "Empezar el test",
  },
  en: {
    code: "404",
    title: "We couldn't find that page",
    body: "The link may be broken or the page may have moved. Let's get you back somewhere familiar.",
    home: "Go home",
    quiz: "Start the quiz",
  },
} as const;

export default async function LangNotFound() {
  const store = await cookies();
  const locale = resolveLocale(store.get("tinyplan_locale")?.value);
  const copy = COPY[locale];

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="premium-card rounded-2xl max-w-md w-full p-8 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-secondary-light flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-8 h-8 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <p className="text-5xl font-bold text-secondary/30 mb-2 tracking-tight">
          {copy.code}
        </p>
        <h1 className="text-2xl font-bold mb-2">{copy.title}</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">{copy.body}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={localizeHref("/", locale)}
            className="inline-flex items-center justify-center h-11 px-6 text-[15px] rounded-xl font-semibold bg-primary text-white hover:bg-primary-hover cta-glow active:scale-[0.97] transition-all duration-150"
          >
            {copy.home}
          </Link>
          <Link
            href={localizeHref("/quiz", locale)}
            className="inline-flex items-center justify-center h-11 px-6 text-[15px] rounded-xl font-semibold border-[1.5px] border-primary text-primary hover:bg-primary-light active:scale-[0.97] transition-all duration-150"
          >
            {copy.quiz}
          </Link>
        </div>
      </div>
    </div>
  );
}
