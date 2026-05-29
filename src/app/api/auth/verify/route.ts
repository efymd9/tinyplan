import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyMagicLinkToken, createSessionToken, sessionCookieOptions } from "@/lib/auth/magic-link";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const { email } = await verifyMagicLinkToken(token);

    const db = getDb();
    const existing = db.select().from(users).where(eq(users.email, email)).get();

    let userId: string;
    let subscriptionStatus: "free" | "trial" | "active" | "cancelled";

    if (existing) {
      userId = existing.id;
      subscriptionStatus = (existing.subscription_status as typeof subscriptionStatus) || "free";
    } else {
      userId = uuid();
      subscriptionStatus = "free";
      const now = Math.floor(Date.now() / 1000);
      db.insert(users)
        .values({
          id: userId,
          email,
          locale: "en",
          subscription_status: subscriptionStatus,
          created_at: now,
          updated_at: now,
        })
        .run();
    }

    const sessionToken = await createSessionToken({
      id: userId,
      email,
      subscriptionStatus,
    });

    const cookieStore = await cookies();
    cookieStore.set("tinyplan-session", sessionToken, sessionCookieOptions(30 * 24 * 60 * 60));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Auth verify error:", err);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
