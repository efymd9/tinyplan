// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cookies } from "next/headers";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { resolveLocale } from "@/lib/i18n/config";

// Real auth (Clerk) is only wired up when a publishable key is present. Keeping
// this inline (rather than importing from the auth module) avoids pulling the
// DB layer into the root layout's import graph.
const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Canonical production origin. NEXT_PUBLIC_APP_URL is the https:// site URL
// (the build guard in next.config.ts enforces this in prod); fall back to the
// known production domain so relative metadata still resolves in dev.
const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://tinyplan.org";

// Default (Spanish) brand copy — overridden per-locale in app/[lang]/layout.tsx.
const SITE_NAME = "TinyPlan";
const DEFAULT_TITLE =
  "TinyPlan — Un kit de juego y rutina de 7 días personalizado";
const DEFAULT_DESCRIPTION =
  "Planes de juego y rutina personalizados para mamás y papás de niños de 2 a 6 años. Haz el test de 3 minutos y recibe un kit de 7 días con juego, habilidades y guiones listos para usar.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: DEFAULT_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    locale: "es_ES",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const store = await cookies();
  const locale = resolveLocale(store.get("tinyplan_locale")?.value);
  const tree = (
    <html lang={locale} className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <PageViewTracker />
        {children}
      </body>
    </html>
  );

  return clerkEnabled ? <ClerkProvider>{tree}</ClerkProvider> : tree;
}
