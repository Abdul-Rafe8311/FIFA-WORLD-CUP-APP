import { db } from "@/db";
import { users, predictions, lineupPredictions, leagueMembers } from "@/db/schema";
import { sql, eq, and } from "drizzle-orm";

export type LeaderRow = {
  id: string;
  name: string | null;
  image: string | null;
  country: string | null;
  isBot: boolean;
  points: number;
  rank: number;
};

/** Total points per user = sum(prediction.points) + sum(lineupPrediction.points). */
export async function getGlobalLeaderboard(limit = 100): Promise<LeaderRow[]> {
  const rows = (await db.execute(sql`
    SELECT u.id, u.name, u.image, u.country, u.is_bot,
      COALESCE(p.pts, 0) + COALESCE(l.pts, 0) AS points
    FROM ${users} u
    LEFT JOIN (
      SELECT user_id, SUM(points) AS pts FROM ${predictions}
      WHERE points IS NOT NULL GROUP BY user_id
    ) p ON p.user_id = u.id
    LEFT JOIN (
      SELECT user_id, SUM(points) AS pts FROM ${lineupPredictions}
      WHERE points IS NOT NULL GROUP BY user_id
    ) l ON l.user_id = u.id
    ORDER BY points DESC, u.created_at ASC
    LIMIT ${limit}
  `)) as unknown as Array<{
    id: string;
    name: string | null;
    image: string | null;
    country: string | null;
    is_bot: boolean;
    points: number;
  }>;

  return rows.map((r, i) => ({
    id: r.id,
    name: r.name,
    image: r.image,
    country: r.country,
    isBot: r.is_bot,
    points: Number(r.points),
    rank: i + 1,
  }));
}

export type CountryRow = {
  country: string;
  avgPoints: number;
  totalPoints: number;
  members: number;
  rank: number;
};

/** Country leaderboard: average total points per user, grouped by country. */
export async function getCountryLeaderboard(): Promise<CountryRow[]> {
  const rows = (await db.execute(sql`
    SELECT u.country,
      SUM(COALESCE(p.pts, 0) + COALESCE(l.pts, 0)) AS total,
      COUNT(DISTINCT u.id) AS members
    FROM ${users} u
    LEFT JOIN (
      SELECT user_id, SUM(points) AS pts FROM ${predictions}
      WHERE points IS NOT NULL GROUP BY user_id
    ) p ON p.user_id = u.id
    LEFT JOIN (
      SELECT user_id, SUM(points) AS pts FROM ${lineupPredictions}
      WHERE points IS NOT NULL GROUP BY user_id
    ) l ON l.user_id = u.id
    WHERE u.country IS NOT NULL AND u.is_bot = false
    GROUP BY u.country
    ORDER BY (SUM(COALESCE(p.pts,0)+COALESCE(l.pts,0))::float / NULLIF(COUNT(DISTINCT u.id),0)) DESC
  `)) as unknown as Array<{ country: string; total: number; members: number }>;

  return rows.map((r, i) => {
    const total = Number(r.total);
    const members = Number(r.members);
    return {
      country: r.country,
      totalPoints: total,
      members,
      avgPoints: members ? total / members : 0,
      rank: i + 1,
    };
  });
}

export type UserStats = {
  totalPoints: number;
  globalRank: number | null;
  exactCount: number;
  correctCount: number;
  predicted: number;
  accuracy: number;
  penaltyBest: number;
};

export async function getUserStats(userId: string): Promise<UserStats> {
  const board = await getGlobalLeaderboard(100000);
  const idx = board.findIndex((r) => r.id === userId);
  const me = idx >= 0 ? board[idx] : null;

  const predRows = await db
    .select({ points: predictions.points })
    .from(predictions)
    .where(and(eq(predictions.userId, userId), sql`${predictions.points} IS NOT NULL`));

  const exactCount = predRows.filter((p) => p.points === 3).length;
  const correctCount = predRows.filter((p) => p.points === 1).length;
  const scored = predRows.length;

  const penalty = (await db.execute(sql`
    SELECT COALESCE(MAX(score), 0) AS best FROM penalty_scores WHERE user_id = ${userId}
  `)) as unknown as Array<{ best: number }>;

  return {
    totalPoints: me?.points ?? 0,
    globalRank: me ? idx + 1 : null,
    exactCount,
    correctCount,
    predicted: scored,
    accuracy: scored ? Math.round(((exactCount + correctCount) / scored) * 100) : 0,
    penaltyBest: Number(penalty[0]?.best ?? 0),
  };
}

/** Standings for the members of a single league. */
export async function getLeagueStandings(leagueId: string): Promise<LeaderRow[]> {
  const rows = (await db.execute(sql`
    SELECT u.id, u.name, u.image, u.country, u.is_bot,
      COALESCE(p.pts, 0) + COALESCE(l.pts, 0) AS points
    FROM ${leagueMembers} lm
    JOIN ${users} u ON u.id = lm.user_id
    LEFT JOIN (
      SELECT user_id, SUM(points) AS pts FROM ${predictions}
      WHERE points IS NOT NULL GROUP BY user_id
    ) p ON p.user_id = u.id
    LEFT JOIN (
      SELECT user_id, SUM(points) AS pts FROM ${lineupPredictions}
      WHERE points IS NOT NULL GROUP BY user_id
    ) l ON l.user_id = u.id
    WHERE lm.league_id = ${leagueId}
    ORDER BY points DESC, u.created_at ASC
  `)) as unknown as Array<{
    id: string;
    name: string | null;
    image: string | null;
    country: string | null;
    is_bot: boolean;
    points: number;
  }>;

  return rows.map((r, i) => ({
    id: r.id,
    name: r.name,
    image: r.image,
    country: r.country,
    isBot: r.is_bot,
    points: Number(r.points),
    rank: i + 1,
  }));
}

export async function getBotUserId(): Promise<string | null> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.isBot, true))
    .limit(1);
  return rows[0]?.id ?? null;
}
