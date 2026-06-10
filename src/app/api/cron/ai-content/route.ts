import { NextResponse } from "next/server";
import { db } from "@/db";
import { matches, aiContent, predictions } from "@/db/schema";
import { and, gte, lt, eq } from "drizzle-orm";
import { generatePrediction, generatePreview } from "@/lib/groq";
import { getBotUserId } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function unauthorized(req: Request): boolean {
  const key = new URL(req.url).searchParams.get("key");
  return !process.env.CRON_SECRET || key !== process.env.CRON_SECRET;
}

export async function GET(req: Request) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Today's matches (UTC). Generate content the morning of match day.
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const todays = await db
    .select()
    .from(matches)
    .where(and(gte(matches.kickoffUtc, start), lt(matches.kickoffUtc, end)));

  const botId = await getBotUserId();
  const results: { match: string; did: string[] }[] = [];

  for (const m of todays) {
    const existing = await db.select().from(aiContent).where(eq(aiContent.matchId, m.id));
    const hasPrediction = existing.some((e) => e.type === "prediction");
    const hasPreview = existing.some((e) => e.type === "preview");
    const did: string[] = [];

    if (!hasPrediction) {
      try {
        const pred = await generatePrediction({
          home: m.homeTeam,
          away: m.awayTeam,
          group: m.groupName,
          stage: m.stage,
        });
        await db
          .insert(aiContent)
          .values({
            matchId: m.id,
            type: "prediction",
            text: pred.reasoning,
            homePred: pred.home,
            awayPred: pred.away,
          })
          .onConflictDoNothing();

        // Insert the Pundit's pick as a real prediction row so it's scored.
        if (botId) {
          await db
            .insert(predictions)
            .values({
              userId: botId,
              matchId: m.id,
              homePred: pred.home,
              awayPred: pred.away,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [predictions.userId, predictions.matchId],
              set: { homePred: pred.home, awayPred: pred.away, updatedAt: new Date() },
            });
        }
        did.push("prediction");
      } catch (e) {
        did.push(`prediction-error:${e instanceof Error ? e.message : "?"}`);
      }
    }

    if (!hasPreview) {
      try {
        const preview = await generatePreview({
          home: m.homeTeam,
          away: m.awayTeam,
          group: m.groupName,
          stage: m.stage,
        });
        await db
          .insert(aiContent)
          .values({ matchId: m.id, type: "preview", text: preview })
          .onConflictDoNothing();
        did.push("preview");
      } catch (e) {
        did.push(`preview-error:${e instanceof Error ? e.message : "?"}`);
      }
    }

    if (did.length) results.push({ match: `${m.homeTeam} v ${m.awayTeam}`, did });
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}
