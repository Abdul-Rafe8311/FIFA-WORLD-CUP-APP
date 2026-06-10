import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { matches, predictions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isScoreLocked, clampGoals } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { matchId?: string; home?: unknown; away?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { matchId } = body;
  if (!matchId || typeof matchId !== "string") {
    return NextResponse.json({ error: "matchId required" }, { status: 400 });
  }

  const home = clampGoals(body.home);
  const away = clampGoals(body.away);

  const match = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  if (match.length === 0) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }
  if (isScoreLocked(match[0].kickoffUtc)) {
    return NextResponse.json({ error: "Predictions are locked at kickoff" }, { status: 403 });
  }

  await db
    .insert(predictions)
    .values({
      userId: session.user.id,
      matchId,
      homePred: home,
      awayPred: away,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [predictions.userId, predictions.matchId],
      set: { homePred: home, awayPred: away, updatedAt: new Date() },
    });

  return NextResponse.json({ ok: true, home, away });
}
