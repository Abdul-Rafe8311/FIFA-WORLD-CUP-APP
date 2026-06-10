import { NextResponse } from "next/server";
import { db } from "@/db";
import { matches, predictions, aiContent } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { fetchMatchesByDate, normalizeStatus } from "@/lib/football-data";
import { scorePrediction } from "@/lib/scoring";
import { generateRoast } from "@/lib/groq";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function unauthorized(req: Request): boolean {
  const key = new URL(req.url).searchParams.get("key");
  return !process.env.CRON_SECRET || key !== process.env.CRON_SECRET;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  let fdMatches;
  try {
    fdMatches = await fetchMatchesByDate(ymd(yesterday), ymd(now));
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "fetch failed" },
      { status: 502 },
    );
  }

  const summary: { match: string; action: string }[] = [];

  for (const fd of fdMatches) {
    const status = normalizeStatus(fd.status);
    const home = fd.score.fullTime.home;
    const away = fd.score.fullTime.away;

    // Match our row by football-data id.
    const rows = await db.select().from(matches).where(eq(matches.fdId, fd.id)).limit(1);
    if (rows.length === 0) continue;
    const m = rows[0];

    // Update status/scores (idempotent).
    await db
      .update(matches)
      .set({ status, homeScore: home, awayScore: away })
      .where(eq(matches.id, m.id));

    if (status !== "finished" || home == null || away == null) continue;

    // Score any unscored predictions for this match.
    const unscored = await db
      .select()
      .from(predictions)
      .where(and(eq(predictions.matchId, m.id), isNull(predictions.points)));

    for (const p of unscored) {
      const pts = scorePrediction(p.homePred, p.awayPred, home, away);
      await db.update(predictions).set({ points: pts }).where(eq(predictions.id, p.id));
    }
    if (unscored.length) {
      summary.push({ match: `${m.homeTeam} v ${m.awayTeam}`, action: `scored ${unscored.length}` });
    }

    // Generate the roast once.
    const existing = await db.select().from(aiContent).where(eq(aiContent.matchId, m.id));
    const hasRoast = existing.some((e) => e.type === "roast");
    if (!hasRoast) {
      const punditPred = existing.find((e) => e.type === "prediction");
      const punditRight =
        punditPred && punditPred.homePred != null && punditPred.awayPred != null
          ? scorePrediction(punditPred.homePred, punditPred.awayPred, home, away) > 0
          : false;
      try {
        const roast = await generateRoast({
          home: m.homeTeam,
          away: m.awayTeam,
          homeScore: home,
          awayScore: away,
          punditWasRight: punditRight,
        });
        await db
          .insert(aiContent)
          .values({ matchId: m.id, type: "roast", text: roast })
          .onConflictDoNothing();
        summary.push({ match: `${m.homeTeam} v ${m.awayTeam}`, action: "roast" });
      } catch {
        /* roast is best-effort */
      }
    }
  }

  return NextResponse.json({ ok: true, fixtures: fdMatches.length, summary });
}
