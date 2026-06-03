"use client";

// Error boundaries must be Client Components. This wraps every localized page
// under app/[lang]/ — any server throw during render degrades to this branded,
// recoverable fallback instead of a raw 500. error.tsx receives no `params`, so
// we read the locale from the URL (/es|/en prefix) on the client.
import { useEffect } from "react";

type Locale = "es" | "en";

const COPY = {
  es: {
    eyebrow: "Algo se salió del plan",
    title: "Tuvimos un pequeño tropiezo",
    body: "No es culpa tuya. Algo no cargó bien de nuestro lado. Inténtalo de nuevo en un momento.",
    retry: "Intentar de nuevo",
    home: "Volver al inicio",
    ref: "Referencia",
  },
  en: {
    eyebrow: "Something went off-plan",
    title: "We hit a small bump",
    body: "It's not you. Something on our side didn't load right. Give it another try in a moment.",
    retry: "Try again",
    home: "Go home",
    ref: "Reference",
  },
} as const satisfies Record<Locale, Record<string, string>>;

function localeFromPath(): Locale {
  if (typeof window === "undefined") return "es";
  const seg = window.location.pathname.split("/")[1];
  return seg === "en" ? "en" : "es";
}

export default function LocalizedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error);
  }, [error]);

  const locale = localeFromPath();
  const copy = COPY[locale];
  const homeHref = `/${locale}`;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="premium-card rounded-2xl max-w-md w-full p-8 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          {copy.eyebrow}
        </p>
        <h1 className="text-2xl font-bold mb-2">{copy.title}</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">{copy.body}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center h-11 px-6 text-[15px] rounded-xl font-semibold bg-primary text-white hover:bg-primary-hover cta-glow active:scale-[0.97] transition-all duration-150"
          >
            {copy.retry}
          </button>
          <a
            href={homeHref}
            className="inline-flex items-center justify-center h-11 px-6 text-[15px] rounded-xl font-semibold border-[1.5px] border-primary text-primary hover:bg-primary-light active:scale-[0.97] transition-all duration-150"
          >
            {copy.home}
          </a>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-muted-foreground/80 font-mono">
            {copy.ref}: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
