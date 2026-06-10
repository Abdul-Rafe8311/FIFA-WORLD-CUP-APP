import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { leagues, leagueMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TopBar } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function JoinByCode({ params }: { params: { code: string } }) {
  const session = await auth();
  const userId = session!.user.id;
  const code = params.code.toUpperCase().slice(0, 6);

  const rows = await db
    .select({ id: leagues.id, name: leagues.name })
    .from(leagues)
    .where(eq(leagues.inviteCode, code))
    .limit(1);

  if (rows.length === 0) {
    return (
      <main>
        <TopBar title="Join league" />
        <div className="p-6 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 font-semibold">No league found for “{code}”</p>
          <Link href="/leagues" className="btn-primary mt-4 inline-flex">
            Back to leagues
          </Link>
        </div>
      </main>
    );
  }

  await db
    .insert(leagueMembers)
    .values({ leagueId: rows[0].id, userId })
    .onConflictDoNothing();

  redirect(`/leagues/${rows[0].id}`);
}
