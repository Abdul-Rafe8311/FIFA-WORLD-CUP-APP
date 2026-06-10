import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { leagues, leagueMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getLeagueStandings } from "@/lib/queries";
import { TopBar, Avatar } from "@/components/ui";
import { flagEmoji } from "@/lib/utils";
import InviteButton from "./InviteButton";

export const dynamic = "force-dynamic";

export default async function LeagueDetail({ params }: { params: { id: string } }) {
  const session = await auth();
  const userId = session!.user.id;

  const rows = await db.select().from(leagues).where(eq(leagues.id, params.id)).limit(1);
  if (rows.length === 0) notFound();
  const league = rows[0];

  // Must be a member to view.
  const member = await db
    .select({ id: leagueMembers.id })
    .from(leagueMembers)
    .where(and(eq(leagueMembers.leagueId, league.id), eq(leagueMembers.userId, userId)))
    .limit(1);
  if (member.length === 0) redirect("/leagues");

  const standings = await getLeagueStandings(league.id);

  return (
    <main>
      <TopBar
        title={league.name}
        right={
          <Link href="/leagues" className="text-sm text-white/50">
            All →
          </Link>
        }
      />
      <div className="space-y-4 p-4">
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-[11px] text-white/45">Invite code</p>
            <p className="text-xl font-black tracking-[0.2em] text-pitch">{league.inviteCode}</p>
          </div>
          <InviteButton code={league.inviteCode} />
        </div>

        <ol className="space-y-2">
          {standings.map((r) => (
            <li
              key={r.id}
              className={
                "flex items-center gap-3 rounded-xl border px-3 py-2 " +
                (r.id === userId ? "border-pitch/50 bg-pitch/5" : "border-ink-line bg-ink-card")
              }
            >
              <span className="w-6 text-center text-sm font-bold text-white/45">{r.rank}</span>
              <Avatar src={r.image} name={r.name} size={32} />
              <div className="flex-1 truncate">
                <span className="font-semibold">{r.name ?? "Player"}</span>
                {r.isBot && <span className="ml-1 text-xs">🤖</span>}
                {r.id === userId && <span className="ml-1 text-xs text-pitch">· you</span>}
              </div>
              <span className="text-lg">{flagEmoji(r.country)}</span>
              <span className="w-12 text-right font-black tabular-nums text-pitch">{r.points}</span>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
