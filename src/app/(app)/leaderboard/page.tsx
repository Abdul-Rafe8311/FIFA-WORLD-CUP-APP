import { auth } from "@/lib/auth";
import { db } from "@/db";
import { leagues, leagueMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getGlobalLeaderboard, getCountryLeaderboard } from "@/lib/queries";
import LeaderboardView from "./LeaderboardView";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [global, countries, myLeagues] = await Promise.all([
    getGlobalLeaderboard(100),
    getCountryLeaderboard(),
    db
      .select({ id: leagues.id, name: leagues.name })
      .from(leagueMembers)
      .innerJoin(leagues, eq(leagues.id, leagueMembers.leagueId))
      .where(eq(leagueMembers.userId, userId)),
  ]);

  return (
    <LeaderboardView
      global={global}
      countries={countries}
      myLeagues={myLeagues}
      meId={userId}
      myCountry={session!.user.country ?? null}
    />
  );
}
