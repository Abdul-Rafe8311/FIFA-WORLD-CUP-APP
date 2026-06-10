import { auth } from "@/lib/auth";
import { getGlobalLeaderboard, getCountryLeaderboard } from "@/lib/queries";
import LeaderboardView from "./LeaderboardView";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [global, countries] = await Promise.all([
    getGlobalLeaderboard(100),
    getCountryLeaderboard(),
  ]);

  return (
    <LeaderboardView
      global={global}
      countries={countries}
      meId={userId}
      myCountry={session!.user.country ?? null}
    />
  );
}
