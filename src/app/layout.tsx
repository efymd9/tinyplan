import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TinyPlan — A simple weekly plan for calmer, more meaningful days",
  description:
    "Personalized 7-day play & routine plans for parents of children aged 2–6. Screen-free activities, parent scripts, and calm routines built around your family.",
  keywords: [
    "parenting",
    "play plan",
    "screen-free activities",
    "toddler activities",
    "preschool routine",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <PageViewTracker />
        {children}
      </body>
    </html>
  );
}
