import "./_env";
import { readFileSync } from "node:fs";
import { db } from "../src/db";
import { matches } from "../src/db/schema";
import { sql } from "drizzle-orm";

type SeedMatch = {
  fdId?: number | null;
  stage: string;
  groupName: string | null;
  homeTeam: string;
  awayTeam: string;
  homeCode: string | null;
  awayCode: string | null;
  kickoffUtc: string;
};

function stageFromFd(stage: string): string {
  return stage; // football-data already uses GROUP_STAGE, LAST_16, etc.
}

async function fromFootballData(): Promise<SeedMatch[] | null> {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch("https://api.football-data.org/v4/competitions/WC/matches", {
      headers: { "X-Auth-Token": token },
    });
    if (!res.ok) {
      console.warn(`football-data returned ${res.status}; falling back to fixtures.json`);
      return null;
    }
    const data = (await res.json()) as { matches?: any[] };
    if (!data.matches?.length) return null;
    return data.matches.map((m) => ({
      fdId: m.id,
      stage: stageFromFd(m.stage),
      groupName: m.group ?? null,
      homeTeam: m.homeTeam?.name ?? "TBD",
      awayTeam: m.awayTeam?.name ?? "TBD",
      homeCode: null, // football-data has no ISO-2; set manually if desired
      awayCode: null,
      kickoffUtc: m.utcDate,
    }));
  } catch (e) {
    console.warn("football-data fetch failed; falling back to fixtures.json:", e);
    return null;
  }
}

function fromFile(): SeedMatch[] {
  const raw = JSON.parse(readFileSync(new URL("../data/fixtures.json", import.meta.url), "utf-8"));
  return (raw.matches as SeedMatch[]).map((m) => ({ ...m, fdId: null }));
}

async function main() {
  let source = await fromFootballData();
  let label = "football-data.org";
  if (!source) {
    source = fromFile();
    label = "data/fixtures.json";
  }
  console.log(`Seeding ${source.length} matches from ${label}…`);

  let inserted = 0;
  for (const m of source) {
    await db
      .insert(matches)
      .values({
        fdId: m.fdId ?? null,
        stage: m.stage,
        groupName: m.groupName,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeCode: m.homeCode,
        awayCode: m.awayCode,
        kickoffUtc: new Date(m.kickoffUtc),
        status: "scheduled",
      })
      .onConflictDoUpdate({
        target: matches.fdId,
        set: {
          stage: m.stage,
          groupName: m.groupName,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          kickoffUtc: new Date(m.kickoffUtc),
        },
      })
      .catch(async () => {
        // fdId is null (file source) -> no conflict target; plain insert.
        await db.insert(matches).values({
          fdId: null,
          stage: m.stage,
          groupName: m.groupName,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          homeCode: m.homeCode,
          awayCode: m.awayCode,
          kickoffUtc: new Date(m.kickoffUtc),
          status: "scheduled",
        });
      });
    inserted++;
  }
  console.log(`Done. Upserted ${inserted} matches.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
