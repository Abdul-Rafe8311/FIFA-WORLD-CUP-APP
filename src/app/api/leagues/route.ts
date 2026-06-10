import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { leagues, leagueMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { makeInviteCode } from "@/lib/utils";
import { getBotUserId } from "@/lib/queries";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 40) : "";
  if (name.length < 2) {
    return NextResponse.json({ error: "League name too short" }, { status: 400 });
  }

  // Generate a unique invite code (retry on collision).
  let code = makeInviteCode();
  for (let i = 0; i < 5; i++) {
    const exists = await db
      .select({ id: leagues.id })
      .from(leagues)
      .where(eq(leagues.inviteCode, code))
      .limit(1);
    if (exists.length === 0) break;
    code = makeInviteCode();
  }

  const inserted = await db
    .insert(leagues)
    .values({ name, inviteCode: code, ownerId: session.user.id })
    .returning({ id: leagues.id, inviteCode: leagues.inviteCode });

  const league = inserted[0];

  // Owner joins + the AI Pundit auto-joins every league.
  const memberValues = [{ leagueId: league.id, userId: session.user.id }];
  const botId = await getBotUserId();
  if (botId) memberValues.push({ leagueId: league.id, userId: botId });

  await db.insert(leagueMembers).values(memberValues).onConflictDoNothing();

  return NextResponse.json({ ok: true, id: league.id, inviteCode: league.inviteCode });
}
