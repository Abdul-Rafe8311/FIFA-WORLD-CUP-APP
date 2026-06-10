import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { readFileSync } from "node:fs";
import { db } from "../src/db";
import { players } from "../src/db/schema";
import { eq } from "drizzle-orm";

type SquadPlayer = { name: string; position: string; shirtNumber: number | null };
type SquadFile = Record<string, SquadPlayer[] | unknown>;

const VALID_POS = new Set(["GK", "DEF", "MID", "FWD"]);

async function main() {
  const raw = JSON.parse(
    readFileSync(new URL("../data/squads.json", import.meta.url), "utf-8"),
  ) as SquadFile;

  let teams = 0;
  let inserted = 0;

  for (const [code, listUnknown] of Object.entries(raw)) {
    if (code.startsWith("_")) continue; // skip comment/format keys
    if (!Array.isArray(listUnknown)) continue;
    const list = listUnknown as SquadPlayer[];
    const teamCode = code.toUpperCase();

    // Replace this team's squad wholesale so re-runs are idempotent.
    await db.delete(players).where(eq(players.teamCode, teamCode));

    for (const p of list) {
      if (!p?.name || !VALID_POS.has(p.position)) {
        console.warn(`Skipping invalid player in ${teamCode}:`, p);
        continue;
      }
      await db.insert(players).values({
        teamCode,
        name: p.name,
        position: p.position,
        shirtNumber: p.shirtNumber ?? null,
      });
      inserted++;
    }
    teams++;
    console.log(`  ${teamCode}: ${list.length} players`);
  }

  console.log(`Done. Seeded ${inserted} players across ${teams} teams.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
