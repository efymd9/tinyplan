import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createMagicLinkToken } from "@/lib/auth/magic-link";
import { getEmailProvider, magicLinkEmail } from "@/lib/email";
import { resolveLocale } from "@/lib/i18n/config";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const locale = resolveLocale((await cookies()).get("tinyplan_locale")?.value);

    const token = await createMagicLinkToken(email);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const magicUrl = `${baseUrl}/${locale}/auth/verify?token=${token}`;

    const provider = getEmailProvider();
    const { subject, html } = magicLinkEmail(magicUrl, locale);
    await provider.send({ to: email, subject, html });

    console.log(`[DEV] Magic link for ${email}: ${magicUrl}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Auth request error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
