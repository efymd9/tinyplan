// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { resolveLocale } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TinyPlan",
  description:
    "Planes de juego y rutina personalizados para madres y padres de niños de 2 a 6 años.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const store = await cookies();
  const locale = resolveLocale(store.get("tinyplan_locale")?.value);
  return (
    <html lang={locale} className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <PageViewTracker />
        {children}
      </body>
    </html>
  );
}
