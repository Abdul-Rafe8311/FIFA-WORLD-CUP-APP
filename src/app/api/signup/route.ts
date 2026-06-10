import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  let body: { name?: unknown; email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    if (existing[0].passwordHash) {
      return NextResponse.json({ error: "Email already registered — log in instead" }, { status: 409 });
    }
    // Account exists from Google sign-in: attach a password to it.
    const hash = await bcrypt.hash(password, 10);
    await db
      .update(users)
      .set({ passwordHash: hash, name: name || undefined })
      .where(eq(users.id, existing[0].id));
    return NextResponse.json({ ok: true });
  }

  const hash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ email, name: name || null, passwordHash: hash });
  return NextResponse.json({ ok: true });
}
