import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { penaltyScores } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { todayUtc } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { score?: unknown; bestStreak?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // 5 kicks/day -> max realistic score ~10. Clamp defensively.
  const score = Math.max(0, Math.min(10, Math.floor(Number(body.score))));
  const bestStreak = Math.max(0, Math.min(5, Math.floor(Number(body.bestStreak))));
  if (!Number.isFinite(score)) {
    return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  }

  const date = todayUtc();

  // One game per day. Reject if already played today.
  const existing = await db
    .select({ id: penaltyScores.id })
    .from(penaltyScores)
    .where(and(eq(penaltyScores.userId, session.user.id), eq(penaltyScores.date, date)))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "Already played today" }, { status: 409 });
  }

  await db.insert(penaltyScores).values({
    userId: session.user.id,
    date,
    score,
    bestStreak,
  });

  return NextResponse.json({ ok: true, score, bestStreak });
}
