import { auth } from "@/lib/auth";
import { db } from "@/db";
import { leagues, leagueMembers } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import LeaguesView from "./LeaguesView";

export const dynamic = "force-dynamic";

export default async function LeaguesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const rows = await db
    .select({
      id: leagues.id,
      name: leagues.name,
      inviteCode: leagues.inviteCode,
      ownerId: leagues.ownerId,
      members: sql<number>`(SELECT COUNT(*) FROM ${leagueMembers} m WHERE m.league_id = ${leagues.id})`,
    })
    .from(leagueMembers)
    .innerJoin(leagues, eq(leagues.id, leagueMembers.leagueId))
    .where(eq(leagueMembers.userId, userId));

  return (
    <LeaguesView
      leagues={rows.map((r) => ({ ...r, members: Number(r.members), isOwner: r.ownerId === userId }))}
    />
  );
}
