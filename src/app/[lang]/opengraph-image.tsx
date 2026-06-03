import { ImageResponse } from "next/og";
import { resolveLocale, type Locale } from "@/lib/i18n/config";

// Branded 1200x630 share card. Uses only the system font stack and inline
// palette values (no external fetches / local font files) so it is fast and
// robust to build at any time.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "TinyPlan";

// Palette (from src/app/globals.css)
const CREAM = "#FBF7F0";
const CORAL = "#EF815B";
const INK = "#2D2B29";
const MUTED = "#8A8580";
const ACCENT = "#D8B542";
const ACCENT_LIGHT = "#FFF7DF";

const COPY: Record<Locale, { tagline: string; sub: string; chips: string[] }> = {
  es: {
    tagline: "Un kit de juego y rutina de 7 días, hecho para tu peque",
    sub: "Para mamás y papás de niños de 2 a 6 años",
    chips: ["Juego con propósito", "Qué decir", "Apoyo SOS"],
  },
  en: {
    tagline: "A personalized 7-day play & routine toolkit for your child",
    sub: "For parents of children aged 2 to 6",
    chips: ["Purposeful play", "What to say", "SOS support"],
  },
};

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const c = COPY[locale];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `linear-gradient(155deg, #FEF7F0 0%, ${CREAM} 60%)`,
          padding: "72px 80px",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 22,
              background: CORAL,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(239,129,91,0.32)",
            }}
          >
            <svg width="50" height="50" viewBox="0 0 64 64" fill="none">
              <path
                d="M30 14a3 3 0 0 1 6 0v6h6a3 3 0 0 1 0 6h-6v15a4 4 0 0 0 4 4h2a3 3 0 0 1 0 6h-2a10 10 0 0 1-10-10V26h-4a3 3 0 0 1 0-6h4v-6Z"
                fill="#FFFFFF"
              />
              <circle cx="46.5" cy="44.5" r="4.5" fill={ACCENT_LIGHT} />
              <circle cx="46.5" cy="44.5" r="2.2" fill={ACCENT} />
            </svg>
          </div>
          <span style={{ fontSize: 52, fontWeight: 800, color: INK, letterSpacing: "-0.02em" }}>
            TinyPlan
          </span>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 980 }}>
          <span
            style={{
              fontSize: 66,
              lineHeight: 1.1,
              fontWeight: 800,
              color: INK,
              letterSpacing: "-0.025em",
            }}
          >
            {c.tagline}
          </span>
          <span style={{ fontSize: 32, color: MUTED, fontWeight: 500 }}>{c.sub}</span>
        </div>

        {/* Feature chips */}
        <div style={{ display: "flex", gap: 16 }}>
          {c.chips.map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 26,
                fontWeight: 600,
                color: INK,
                background: "#FFFFFF",
                border: "1px solid #E9E1DA",
                borderRadius: 999,
                padding: "14px 26px",
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: 999, background: CORAL }} />
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
