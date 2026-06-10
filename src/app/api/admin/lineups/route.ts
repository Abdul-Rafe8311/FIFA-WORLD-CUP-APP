import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { matches, players, matchLineups, lineupPredictions } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { isAdmin } from "@/lib/admin";
import { scoreLineup } from "@/lib/scoring";

export async function POST(req: Request) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    return NextResponse.json({ error: "Select exactly 11 starters" }, { status: 400 });
  }

  const match = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  if (match.length === 0) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }
  if (teamCode !== match[0].homeCode && teamCode !== match[0].awayCode) {
    return NextResponse.json({ error: "Team not in this match" }, { status: 400 });
  }

  // Validate players belong to the team.
  const chosen = await db
    .select({ id: players.id, position: players.position })
    .from(players)
    .where(and(eq(players.teamCode, teamCode), inArray(players.id, ids)));
  if (chosen.length !== 11) {
    return NextResponse.json({ error: "Invalid player selection" }, { status: 400 });
  }

  // Save / update the actual lineup.
  await db
    .insert(matchLineups)
    .values({ matchId, teamCode, playerIds: ids })
    .onConflictDoUpdate({
      target: [matchLineups.matchId, matchLineups.teamCode],
      set: { playerIds: ids },
    });

  // Immediately score every lineup prediction for this match + team.
  const preds = await db
    .select()
    .from(lineupPredictions)
    .where(
      and(eq(lineupPredictions.matchId, matchId), eq(lineupPredictions.teamCode, teamCode)),
    );

  for (const p of preds) {
    const pts = scoreLineup(p.playerIds, ids);
    await db
      .update(lineupPredictions)
      .set({ points: pts })
      .where(eq(lineupPredictions.id, p.id));
  }

  return NextResponse.json({ ok: true, scored: preds.length });
}
