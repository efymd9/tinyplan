"use client";

// Last-resort fallback. global-error.tsx replaces the root layout when a throw
// escapes it, so it must render its own <html>/<body> and cannot rely on the
// app's global stylesheet (Tailwind) being present — hence fully inline styles
// in the brand palette. Bilingual via the URL locale prefix (default es).
import { useEffect } from "react";

type Locale = "es" | "en";

const COPY = {
  es: {
    htmlTitle: "Algo salió mal — TinyPlan",
    title: "Algo salió mal",
    body: "Tuvimos un problema inesperado. Inténtalo de nuevo o vuelve al inicio.",
    retry: "Intentar de nuevo",
    home: "Volver al inicio",
  },
  en: {
    htmlTitle: "Something went wrong — TinyPlan",
    title: "Something went wrong",
    body: "We ran into an unexpected problem. Try again, or head back home.",
    retry: "Try again",
    home: "Go home",
  },
} as const satisfies Record<Locale, Record<string, string>>;

function localeFromPath(): Locale {
  if (typeof window === "undefined") return "es";
  const seg = window.location.pathname.split("/")[1];
  return seg === "en" ? "en" : "es";
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  const locale = localeFromPath();
  const copy = COPY[locale];
  const homeHref = `/${locale}`;

  // Brand tokens (mirrors src/app/globals.css) — global-error cannot depend on
  // the app stylesheet, so colors are inlined here.
  const cream = "#FBF7F0";
  const ink = "#2D2B29";
  const coral = "#EF815B";
  const coralHover = "#E06A43";
  const coralLight = "#FCE8DF";
  const muted = "#8A8580";
  const borderWhisper = "#F2ECE4";

  return (
    <html lang={locale}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
          background: cream,
          color: ink,
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <title>{copy.htmlTitle}</title>
        <div
          style={{
            background: "#FFFFFF",
            border: `1px solid ${borderWhisper}`,
            borderRadius: "1rem",
            boxShadow:
              "0 1px 2px rgba(28,25,23,0.04), 0 3px 10px rgba(28,25,23,0.03)",
            maxWidth: "28rem",
            width: "100%",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "4rem",
              height: "4rem",
              borderRadius: "9999px",
              background: coralLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
            }}
            aria-hidden="true"
          >
            <svg
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke={coral}
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              margin: "0 0 0.5rem",
            }}
          >
            {copy.title}
          </h1>
          <p
            style={{
              color: muted,
              lineHeight: 1.6,
              margin: "0 0 1.5rem",
            }}
          >
            {copy.body}
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                appearance: "none",
                border: "none",
                cursor: "pointer",
                height: "2.75rem",
                padding: "0 1.5rem",
                fontSize: "15px",
                fontWeight: 600,
                borderRadius: "0.75rem",
                background: coral,
                color: "#FFFFFF",
                transition: "background 0.15s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = coralHover;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = coral;
              }}
            >
              {copy.retry}
            </button>
            <a
              href={homeHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "2.75rem",
                padding: "0 1.5rem",
                fontSize: "15px",
                fontWeight: 600,
                borderRadius: "0.75rem",
                border: `1.5px solid ${coral}`,
                color: coral,
                textDecoration: "none",
              }}
            >
              {copy.home}
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
