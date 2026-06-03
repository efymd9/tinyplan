import { getCurrentUser, clerkEnabled } from "@/lib/auth/magic-link";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { DesktopNav, MobileNav } from "@/components/dashboard/nav";
import { ProfileMenu } from "@/components/dashboard/profile-menu";
import PlanReclaimer from "@/components/dashboard/plan-reclaimer";
import { ManageSubscriptionButton } from "@/components/dashboard/manage-subscription-button";
import { getActivePlan, getDayLogs, getTodayDayNumber } from "@/lib/dashboard/helpers";
import { requireActiveSubscription } from "@/lib/auth/subscription";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { localizeHref } from "@/lib/i18n/href";
import type { Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(clerkEnabled ? "/sign-in" : localizeHref("/auth/login", lang as Locale));
  }

  // Subscription gate. No-op during the soft launch (billing not enforced) — see
  // src/lib/auth/subscription.ts — so current users are never locked out. Once
  // real Stripe billing is configured this redirects non-subscribers to pricing.
  await requireActiveSubscription(user, lang as Locale);

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
      {/* Adopts a pending anonymous plan for the just-signed-in user, once per
          page load. Renders nothing; runs on every dashboard route. */}
      <PlanReclaimer />
      <header className="sticky top-0 z-50 border-b border-border-whisper glass-bar shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={localizeHref("/dashboard/today", lang as Locale)}
            aria-label={lang === "es" ? "Inicio de TinyPlan" : "TinyPlan home"}
          >
            <BrandLogo width={130} priority />
          </Link>
          <div className="flex items-center gap-2">
            <ManageSubscriptionButton />
            <LanguageSwitcher />
            {clerkEnabled ? (
              <UserButton />
            ) : (
              <ProfileMenu email={user.email} />
            )}
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
