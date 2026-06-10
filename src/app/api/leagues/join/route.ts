import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { leagues, leagueMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if (code.length !== 6) {
    return NextResponse.json({ error: "Enter a valid 6-character code" }, { status: 400 });
  }

  const league = await db
    .select({ id: leagues.id })
    .from(leagues)
    .where(eq(leagues.inviteCode, code))
    .limit(1);

  if (league.length === 0) {
    return NextResponse.json({ error: "No league found for that code" }, { status: 404 });
  }

  await db
    .insert(leagueMembers)
    .values({ leagueId: league[0].id, userId: session.user.id })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true, id: league[0].id });
}
