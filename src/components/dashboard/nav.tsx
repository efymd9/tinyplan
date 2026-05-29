"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/i18n/locale-provider";
import { localizeHref } from "@/lib/i18n/href";

const navItems = [
  { href: "/dashboard/today", label: "Today", icon: "sun" },
  { href: "/dashboard/week", label: "Week", icon: "calendar" },
  { href: "/dashboard/sos", label: "SOS", icon: "lifebuoy" },
  { href: "/dashboard/library", label: "Library", icon: "book" },
  { href: "/dashboard/progress", label: "Progress", icon: "chart" },
] as const;

const icons: Record<string, string> = {
  sun: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  lifebuoy:
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-6a4 4 0 100-8 4 4 0 000 8zm-7.071-2.929L7.05 10.95m9.9 0l2.121 2.121M4.929 7.071L7.05 9.05m9.9 0l2.121-2.121",
  book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  chart:
    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
};

function NavIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      className={className || "w-5 h-5"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[name]} />
    </svg>
  );
}

interface ProgressInfo {
  completedCount: number;
  totalDays: number;
  currentDay: number;
  dayStatuses: Array<{ day: number; done: boolean }>;
}

export function DesktopNav({ progress, userEmail }: { progress?: ProgressInfo; userEmail?: string }) {
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <nav className="hidden md:flex flex-col gap-1 w-56 shrink-0 p-5 pt-6 border-r border-border-whisper">
      {navItems.map((item) => {
        const href = localizeHref(item.href, locale);
        const active = pathname.startsWith(href);
        return (
          <Link
            key={item.href}
            href={href}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
              active
                ? "bg-primary-light text-primary font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
            }`}
          >
            <NavIcon name={item.icon} className={`w-[18px] h-[18px] ${active ? "stroke-[2]" : ""}`} />
            {item.label}
          </Link>
        );
      })}

      {progress && progress.totalDays > 0 && (
        <div className="mt-6 p-4 bg-surface-sunken rounded-2xl border border-border-whisper">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
            Your week
          </p>
          <div className="flex gap-1">
            {progress.dayStatuses.map((d) => (
              <div
                key={d.day}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  d.done
                    ? "bg-secondary"
                    : d.day === progress.currentDay
                      ? "bg-primary"
                      : "bg-border"
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-medium">
            {progress.completedCount}/{progress.totalDays} meaningful moments
          </p>
        </div>
      )}

      {userEmail && (
        <div className="mt-auto pt-4 border-t border-border-whisper">
          <p className="text-[10px] text-muted-foreground truncate px-1">{userEmail}</p>
        </div>
      )}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-bar border-t border-border-whisper shadow-sticky">
      <div className="flex justify-around py-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const href = localizeHref(item.href, locale);
          const active = pathname.startsWith(href);
          return (
            <Link
              key={item.href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-h-[48px] min-w-[48px] justify-center ${
                active ? "text-primary" : "text-muted-foreground active:scale-95"
              }`}
            >
              {active && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-primary" />
              )}
              <NavIcon name={item.icon} className={`w-[22px] h-[22px] ${active ? "stroke-[2]" : ""}`} />
              <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
