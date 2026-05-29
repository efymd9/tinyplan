import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/magic-link";
import { getDb } from "@/lib/db";
import { activities } from "@/lib/db/schema";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const all = db.select().from(activities).all();

    return NextResponse.json({ activities: all });
  } catch (err) {
    console.error("Activities fetch error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
