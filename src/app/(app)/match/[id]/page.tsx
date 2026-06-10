import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  matches,
  predictions,
  aiContent,
  players,
  lineupPredictions,
  matchLineups,
} from "@/db/schema";
import { eq, and, or, inArray } from "drizzle-orm";
import MatchView, { type MatchViewData } from "./MatchView";

export const dynamic = "force-dynamic";

export default async function MatchPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const userId = session!.user.id;

  const matchRows = await db.select().from(matches).where(eq(matches.id, params.id)).limit(1);
  if (matchRows.length === 0) notFound();
  const match = matchRows[0];

  const codes = [match.homeCode, match.awayCode].filter((c): c is string => Boolean(c));

  const [myPred, ai, squad, myLineups, actualLineups] = await Promise.all([
    db
      .select()
      .from(predictions)
      .where(and(eq(predictions.userId, userId), eq(predictions.matchId, match.id)))
      .limit(1),
    db.select().from(aiContent).where(eq(aiContent.matchId, match.id)),
    codes.length
      ? db.select().from(players).where(inArray(players.teamCode, codes))
      : Promise.resolve([]),
    db
      .select()
      .from(lineupPredictions)
      .where(
        and(eq(lineupPredictions.userId, userId), eq(lineupPredictions.matchId, match.id)),
      ),
    db.select().from(matchLineups).where(eq(matchLineups.matchId, match.id)),
  ]);

  const aiPrediction = ai.find((a) => a.type === "prediction");
  const aiPreview = ai.find((a) => a.type === "preview");
  const aiRoast = ai.find((a) => a.type === "roast");

  const data: MatchViewData = {
    match: {
      id: match.id,
      stage: match.stage,
      groupName: match.groupName,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeCode: match.homeCode,
      awayCode: match.awayCode,
      kickoffUtc: match.kickoffUtc.toISOString(),
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    },
    myPrediction: myPred[0]
      ? {
          id: myPred[0].id,
          home: myPred[0].homePred,
          away: myPred[0].awayPred,
          points: myPred[0].points,
        }
      : null,
    ai: {
      prediction: aiPrediction
        ? { home: aiPrediction.homePred, away: aiPrediction.awayPred, text: aiPrediction.text }
        : null,
      preview: aiPreview?.text ?? null,
      roast: aiRoast?.text ?? null,
    },
    players: squad.map((p) => ({
      id: p.id,
      teamCode: p.teamCode,
      name: p.name,
      position: p.position,
      shirtNumber: p.shirtNumber,
    })),
    myLineups: myLineups.map((l) => ({
      teamCode: l.teamCode,
      playerIds: l.playerIds,
      points: l.points,
    })),
    actualLineups: actualLineups.map((l) => ({ teamCode: l.teamCode, playerIds: l.playerIds })),
  };

  return <MatchView data={data} />;
}
