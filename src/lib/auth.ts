import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      country?: string | null;
      isBot?: boolean;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = typeof creds?.email === "string" ? creds.email.trim().toLowerCase() : "";
        const password = typeof creds?.password === "string" ? creds.password : "";
        if (!email || !password) return null;

        const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const u = rows[0];
        if (!u || !u.passwordHash) return null; // no account or Google-only account

        const ok = await bcrypt.compare(password, u.passwordHash);
        if (!ok) return null;

        return { id: u.id, name: u.name, email: u.email, image: u.image };
      },
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async signIn({ user, account }) {
      // Credentials accounts are already validated in authorize().
      if (account?.provider === "credentials") return true;
      if (!user.email) return false;
      // Upsert OAuth (Google) users into our custom users table.
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, user.email))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(users).values({
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
        });
      } else {
        await db
          .update(users)
          .set({ name: user.name ?? null, image: user.image ?? null })
          .where(eq(users.email, user.email));
      }
      return true;
    },
    async jwt({ token, trigger }) {
      // Attach our DB user fields. Re-read on update trigger (e.g. country change).
      if (token.email && (!token.uid || trigger === "update")) {
        const rows = await db
          .select()
          .from(users)
          .where(eq(users.email, token.email))
          .limit(1);
        if (rows[0]) {
          token.uid = rows[0].id;
          token.country = rows[0].country;
          token.isBot = rows[0].isBot;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? "";
        session.user.country = (token.country as string | null) ?? null;
        session.user.isBot = (token.isBot as boolean) ?? false;
      }
      return session;
    },
  },
  pages: {},
});
