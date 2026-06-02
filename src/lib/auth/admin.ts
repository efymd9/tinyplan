import { redirect } from "next/navigation";
import { getCurrentUser, clerkEnabled, type AuthUser } from "@/lib/auth/magic-link";

/**
 * Admin allowlist from ADMIN_EMAILS (comma-separated), lower-cased so the
 * comparison against the (Clerk-provided) account email is case-insensitive.
 */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

/**
 * Guard for every /admin page. FAILS CLOSED: an empty ADMIN_EMAILS allowlist
 * denies everyone. (Previously each page used `adminEmails.length > 0 && …`,
 * so an unset ADMIN_EMAILS left /admin open to any signed-in user.)
 *
 * Returns the authenticated admin user, or redirects away (never returns).
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect(clerkEnabled ? "/sign-in" : "/auth/login");
  if (!isAdminEmail(user.email)) redirect("/dashboard/today");
  return user;
}
