import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const existing = await db.select().from(users).where(eq(users.isBot, true)).limit(1);
  if (existing.length > 0) {
    console.log("Bot already exists:", existing[0].id);
    return;
  }
  const inserted = await db
    .insert(users)
    .values({
      name: "The Pundit",
      email: "pundit@goalcast.app",
      isBot: true,
      country: "EN",
    })
    .returning({ id: users.id });
  console.log("Created bot user The Pundit:", inserted[0].id);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
