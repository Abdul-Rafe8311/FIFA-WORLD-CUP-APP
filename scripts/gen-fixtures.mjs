// Generates data/fixtures.json: the full 104-match World Cup 2026 structure
// with PLACEHOLDER teams (the draw / exact kickoffs must be corrected manually
// once known, or will be overwritten by the football-data.org seed).
// Run: node scripts/gen-fixtures.mjs
import { writeFileSync, mkdirSync } from "node:fs";

const GROUPS = "ABCDEFGHIJKL".split(""); // 12 groups of 4 (48 teams)
const matches = [];

// Group stage: round-robin (6 matches per group) = 72 matches.
const PAIRS = [
  [1, 2], [3, 4],
  [1, 3], [2, 4],
  [1, 4], [2, 3],
];

// Tournament window placeholders. Three matches/day, 18:00/21:00/00:00 UTC.
let day = new Date(Date.UTC(2026, 5, 11, 16, 0, 0)); // 11 Jun 2026
let slot = 0;
function nextKickoff() {
  const slots = [16, 19, 22];
  const ko = new Date(day);
  ko.setUTCHours(slots[slot % 3], 0, 0, 0);
  slot++;
  if (slot % 3 === 0) day = new Date(day.getTime() + 24 * 60 * 60 * 1000);
  return ko.toISOString();
}

for (const g of GROUPS) {
  for (const [a, b] of PAIRS) {
    matches.push({
      stage: "GROUP_STAGE",
      groupName: `Group ${g}`,
      homeTeam: `${g}${a} (TBD)`,
      awayTeam: `${g}${b} (TBD)`,
      homeCode: null, // ISO-2; fill once the draw is known (e.g. "BR")
      awayCode: null,
      kickoffUtc: nextKickoff(),
    });
  }
}

// Knockouts: R32 (16) -> R16 (8) -> QF (4) -> SF (2) -> 3rd (1) -> Final (1).
const KO = [
  ["ROUND_OF_32", 16],
  ["ROUND_OF_16", 8],
  ["QUARTER_FINALS", 4],
  ["SEMI_FINALS", 2],
  ["THIRD_PLACE", 1],
  ["FINAL", 1],
];
// Knockouts run after the group stage; advance the clock a couple of days.
day = new Date(Date.UTC(2026, 5, 28, 16, 0, 0));
slot = 0;
for (const [stage, count] of KO) {
  for (let i = 1; i <= count; i++) {
    matches.push({
      stage,
      groupName: null,
      homeTeam: `${stage.replaceAll("_", " ")} Home ${i} (TBD)`,
      awayTeam: `${stage.replaceAll("_", " ")} Away ${i} (TBD)`,
      homeCode: null,
      awayCode: null,
      kickoffUtc: nextKickoff(),
    });
  }
}

const out = {
  _comment:
    "PLACEHOLDER fixtures for FIFA World Cup 2026 (104 matches). Teams/codes/kickoffs are placeholders. " +
    "Set homeCode/awayCode to ISO-2 codes (e.g. BR, AR) for flag emojis. The seed script prefers " +
    "football-data.org and only falls back to this file. Regenerate with scripts/gen-fixtures.mjs.",
  count: matches.length,
  matches,
};

mkdirSync(new URL("../data/", import.meta.url), { recursive: true });
writeFileSync(new URL("../data/fixtures.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(`wrote data/fixtures.json with ${matches.length} matches`);
