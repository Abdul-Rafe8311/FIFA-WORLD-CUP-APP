// Clears all matches (cascading predictions/ai/lineups) and inserts the real
// fixtures from data/fixtures.json. Run: node scripts/reseed.mjs
import { readFileSync } from "node:fs";
import postgres from "postgres";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
const line = env.split("\n").find((l) => l.startsWith("DATABASE_URL="));
const url = line.slice("DATABASE_URL=".length).trim().replace(/^"|"$/g, "");
const sql = postgres(url, { prepare: false, max: 1 });

const data = JSON.parse(readFileSync(new URL("../data/fixtures.json", import.meta.url), "utf-8"));

await sql`DELETE FROM matches`;
console.log("cleared matches");

let n = 0;
for (const m of data.matches) {
  await sql`
    INSERT INTO matches (fd_id, stage, group_name, home_team, away_team, home_code, away_code, kickoff_utc, status)
    VALUES (${null}, ${m.stage}, ${m.groupName}, ${m.homeTeam}, ${m.awayTeam},
            ${m.homeCode}, ${m.awayCode}, ${m.kickoffUtc}, 'scheduled')
  `;
  n++;
}
console.log(`inserted ${n} matches`);
await sql.end();
