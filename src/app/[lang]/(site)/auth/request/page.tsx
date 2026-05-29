import { redirect } from "next/navigation";
import { localizeHref } from "@/lib/i18n/href";
import type { Locale } from "@/lib/i18n/config";

export default async function AuthRequestPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(localizeHref("/auth/login", lang as Locale));
}
