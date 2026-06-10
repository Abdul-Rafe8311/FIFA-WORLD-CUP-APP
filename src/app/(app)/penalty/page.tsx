import { auth } from "@/lib/auth";
import { db } from "@/db";
import { penaltyScores, users } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { todayUtc } from "@/lib/utils";
import PenaltyGame from "./PenaltyGame";

export const dynamic = "force-dynamic";

export default async function PenaltyPage() {
  const session = await auth();
  const userId = session!.user.id;
  const date = todayUtc();

  const todayRow = await db
    .select()
    .from(penaltyScores)
    .where(and(eq(penaltyScores.userId, userId), eq(penaltyScores.date, date)))
    .limit(1);

  const daily = (await db.execute(sql`
    SELECT u.id, u.name, u.image, ps.score
    FROM ${penaltyScores} ps JOIN ${users} u ON u.id = ps.user_id
    WHERE ps.date = ${date}
    ORDER BY ps.score DESC, ps.best_streak DESC
    LIMIT 50
  `)) as unknown as Array<{ id: string; name: string | null; image: string | null; score: number }>;

  const allTime = (await db.execute(sql`
    SELECT u.id, u.name, u.image, SUM(ps.score) AS score
    FROM ${penaltyScores} ps JOIN ${users} u ON u.id = ps.user_id
    GROUP BY u.id, u.name, u.image
    ORDER BY score DESC
    LIMIT 50
  `)) as unknown as Array<{ id: string; name: string | null; image: string | null; score: number }>;

  return (
    <PenaltyGame
      playedToday={todayRow.length > 0 ? { score: todayRow[0].score, bestStreak: todayRow[0].bestStreak } : null}
      daily={daily.map((d) => ({ ...d, score: Number(d.score) }))}
      allTime={allTime.map((d) => ({ ...d, score: Number(d.score) }))}
      meId={userId}
    />
  );
}
