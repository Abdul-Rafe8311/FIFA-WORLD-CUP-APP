import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isValidCountry } from "@/lib/countries";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { country?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const country = typeof body.country === "string" ? body.country.toUpperCase() : "";
  if (!isValidCountry(country)) {
    return NextResponse.json({ error: "Invalid country" }, { status: 400 });
  }

  await db.update(users).set({ country }).where(eq(users.id, session.user.id));
  return NextResponse.json({ ok: true, country });
}
