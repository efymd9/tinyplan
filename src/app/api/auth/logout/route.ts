import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sessionCookieOptions } from "@/lib/auth/magic-link";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.set("tinyplan-session", "", sessionCookieOptions(0));
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
