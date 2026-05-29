import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { quizSessions } from "@/lib/db/schema";
import { buildTagProfile } from "@/lib/quiz/tags";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Answers required" }, { status: 400 });
    }

    const tagProfile = buildTagProfile(answers);
    const id = uuid();

    const db = getDb();
    const now = Math.floor(Date.now() / 1000);
    db.insert(quizSessions)
      .values({
        id,
        answers_json: JSON.stringify(answers),
        tags_json: JSON.stringify(tagProfile),
        play_profile: tagProfile.play_profile,
        completed: 1,
        created_at: now,
        updated_at: now,
      })
      .run();

    return NextResponse.json({
      sessionId: id,
      tagProfile,
    });
  } catch (err) {
    console.error("Quiz submit error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
