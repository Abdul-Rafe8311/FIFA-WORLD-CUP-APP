import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { matches, players, lineupPredictions } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { isLineupLocked } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { matchId?: string; teamCode?: string; playerIds?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { matchId, teamCode } = body;
  if (!matchId || typeof matchId !== "string" || !teamCode || typeof teamCode !== "string") {
    return NextResponse.json({ error: "matchId and teamCode required" }, { status: 400 });
  }

  const ids = Array.isArray(body.playerIds)
    ? Array.from(new Set(body.playerIds.filter((x): x is string => typeof x === "string")))
    : [];
  if (ids.length !== 11) {
    return NextResponse.json({ error: "Select exactly 11 players" }, { status: 400 });
  }

  const match = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  if (match.length === 0) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }
  if (teamCode !== match[0].homeCode && teamCode !== match[0].awayCode) {
    return NextResponse.json({ error: "Team not in this match" }, { status: 400 });
  }
  if (isLineupLocked(match[0].kickoffUtc)) {
    return NextResponse.json(
      { error: "Lineup predictions lock 90 minutes before kickoff" },
      { status: 403 },
    );
  }

  // Validate players belong to the team and exactly one GK is selected.
  const chosen = await db
    .select()
    .from(players)
    .where(and(eq(players.teamCode, teamCode), inArray(players.id, ids)));

  if (chosen.length !== 11) {
    return NextResponse.json({ error: "Invalid player selection" }, { status: 400 });
  }
  const gkCount = chosen.filter((p) => p.position === "GK").length;
  if (gkCount !== 1) {
    return NextResponse.json({ error: "Select exactly 1 goalkeeper" }, { status: 400 });
  }

  await db
    .insert(lineupPredictions)
    .values({
      userId: session.user.id,
      matchId,
      teamCode,
      playerIds: ids,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [lineupPredictions.userId, lineupPredictions.matchId, lineupPredictions.teamCode],
      set: { playerIds: ids, updatedAt: new Date() },
    });

  return NextResponse.json({ ok: true });
}
