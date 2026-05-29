import { redirect } from "next/navigation";
import { localizeHref } from "@/lib/i18n/href";
import type { Locale } from "@/lib/i18n/config";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(localizeHref("/dashboard/today", lang as Locale));
}
