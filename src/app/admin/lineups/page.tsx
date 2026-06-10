import { auth } from "@/lib/auth";
import { db } from "@/db";
import { matches, players, matchLineups } from "@/db/schema";
import { and, gte, lt, inArray, asc } from "drizzle-orm";
import { isAdmin } from "@/lib/admin";
import { TopBar } from "@/components/ui";
import { flagEmoji } from "@/lib/utils";
import AdminLineupForm from "./AdminLineupForm";

export const dynamic = "force-dynamic";

export default async function AdminLineupsPage() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return (
      <main className="p-8 text-center">
        <p className="text-4xl">🔒</p>
        <p className="mt-3 font-semibold">Admins only</p>
        <p className="mt-1 text-sm text-white/50">
          Add your email to the ADMIN_EMAILS environment variable.
        </p>
      </main>
    );
  }

  // Today's matches (UTC day window).
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const todays = await db
    .select()
    .from(matches)
    .where(and(gte(matches.kickoffUtc, start), lt(matches.kickoffUtc, end)))
    .orderBy(asc(matches.kickoffUtc));

  const codes = Array.from(
    new Set(todays.flatMap((m) => [m.homeCode, m.awayCode]).filter((c): c is string => Boolean(c))),
  );
  const squad = codes.length
    ? await db.select().from(players).where(inArray(players.teamCode, codes))
    : [];
  const matchIds = todays.map((m) => m.id);
  const existing = matchIds.length
    ? await db.select().from(matchLineups).where(inArray(matchLineups.matchId, matchIds))
    : [];

  return (
    <main className="pb-10">
      <TopBar title="Admin · Lineups" />
      <p className="px-4 pt-3 text-[11px] text-white/45">
        Tick the 11 actual starters per team and save. Saving scores all lineup
        predictions for that team immediately.
      </p>

      {todays.length === 0 ? (
        <p className="p-8 text-center text-sm text-white/40">No matches scheduled today (UTC).</p>
      ) : (
        <div className="space-y-6 p-4">
          {todays.map((m) => (
            <section key={m.id} className="space-y-3">
              <h2 className="text-sm font-bold">
                {flagEmoji(m.homeCode)} {m.homeTeam} vs {m.awayTeam} {flagEmoji(m.awayCode)}
              </h2>
              {[
                { code: m.homeCode, name: m.homeTeam },
                { code: m.awayCode, name: m.awayTeam },
              ]
                .filter((t): t is { code: string; name: string } => Boolean(t.code))
                .map((t) => (
                  <AdminLineupForm
                    key={t.code}
                    matchId={m.id}
                    teamCode={t.code}
                    teamName={t.name}
                    players={squad
                      .filter((p) => p.teamCode === t.code)
                      .map((p) => ({
                        id: p.id,
                        name: p.name,
                        position: p.position,
                        shirtNumber: p.shirtNumber,
                      }))}
                    initial={existing.find((e) => e.matchId === m.id && e.teamCode === t.code)?.playerIds ?? []}
                  />
                ))}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
