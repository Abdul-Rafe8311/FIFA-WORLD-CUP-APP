import { auth } from "@/lib/auth";
import { db } from "@/db";
import { matches, predictions, aiContent } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { asc } from "drizzle-orm";
import ScheduleView from "./ScheduleView";
import type { MatchCardData } from "@/components/MatchCard";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const session = await auth();
  const userId = session!.user.id;

  const allMatches = await db.select().from(matches).orderBy(asc(matches.kickoffUtc));
  const myPreds = await db
    .select()
    .from(predictions)
    .where(eq(predictions.userId, userId));
  const previews = await db
    .select()
    .from(aiContent)
    .where(eq(aiContent.type, "preview"));

  const predByMatch = new Map(myPreds.map((p) => [p.matchId, p]));
  const previewByMatch = new Map(previews.map((p) => [p.matchId, p.text]));

  const data: MatchCardData[] = allMatches.map((m) => {
    const p = predByMatch.get(m.id);
    return {
      id: m.id,
      stage: m.stage,
      groupName: m.groupName,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeCode: m.homeCode,
      awayCode: m.awayCode,
      kickoffUtc: m.kickoffUtc.toISOString(),
      status: m.status,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      myHome: p?.homePred ?? null,
      myAway: p?.awayPred ?? null,
      aiPreview: previewByMatch.get(m.id) ?? null,
    };
  });

  return <ScheduleView matches={data} />;
}
