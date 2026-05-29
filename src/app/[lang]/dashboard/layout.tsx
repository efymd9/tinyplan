import { getCurrentUser } from "@/lib/auth/magic-link";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DesktopNav, MobileNav } from "@/components/dashboard/nav";
import { ProfileMenu } from "@/components/dashboard/profile-menu";
import { getActivePlan, getDayLogs, getTodayDayNumber } from "@/lib/dashboard/helpers";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/language-switcher";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  let progress: {
    completedCount: number;
    totalDays: number;
    currentDay: number;
    dayStatuses: Array<{ day: number; done: boolean }>;
  } | undefined;

  const plan = getActivePlan(user.id);
  if (plan) {
    const dayLogs = getDayLogs(plan.id);
    const currentDay = getTodayDayNumber(plan.created_at!);
    const logMap = new Map(dayLogs.map((l) => [l.day_number, l.status]));
    const completedCount = dayLogs.filter((l) => l.status === "done").length;
    progress = {
      completedCount,
      totalDays: 7,
      currentDay,
      dayStatuses: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        done: logMap.get(i + 1) === "done",
      })),
    };
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border-whisper glass-bar shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard/today" aria-label="TinyPlan home">
            <BrandLogo width={130} priority />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ProfileMenu email={user.email} />
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        <DesktopNav progress={progress} userEmail={user.email} />
        <main className="flex-1 p-4 md:p-8 pb-safe-bottom md:pb-8">{children}</main>
      </div>

      <MobileNav />
    </div>
  );
}
