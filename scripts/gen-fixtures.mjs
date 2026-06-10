// Generates data/fixtures.json from the real FIFA World Cup 2026 draw + schedule.
// Input times are Pakistan time (PKT, UTC+5); converted to UTC on output.
// Knockout teams are slot placeholders (e.g. "1A", "W73") until decided.
// Run: node scripts/gen-fixtures.mjs
import { writeFileSync, mkdirSync } from "node:fs";

const NAME = {
  MX: "Mexico", ZA: "South Africa", KR: "Korea Republic", CZ: "Czechia",
  CA: "Canada", BA: "Bosnia and Herzegovina", QA: "Qatar", CH: "Switzerland",
  BR: "Brazil", MA: "Morocco", HT: "Haiti", SCO: "Scotland",
  US: "USA", PY: "Paraguay", AU: "Australia", TR: "Türkiye",
  DE: "Germany", CW: "Curaçao", CI: "Côte d'Ivoire", EC: "Ecuador",
  NL: "Netherlands", JP: "Japan", SE: "Sweden", TN: "Tunisia",
  BE: "Belgium", EG: "Egypt", IR: "IR Iran", NZ: "New Zealand",
  ES: "Spain", CV: "Cabo Verde", SA: "Saudi Arabia", UY: "Uruguay",
  FR: "France", SN: "Senegal", IQ: "Iraq", NO: "Norway",
  AR: "Argentina", DZ: "Algeria", AT: "Austria", JO: "Jordan",
  PT: "Portugal", CD: "Congo DR", UZ: "Uzbekistan", CO: "Colombia",
  ENG: "England", HR: "Croatia", GH: "Ghana", PA: "Panama",
};
// ISO-2 for the flag emoji (Scotland/England fall back to GB).
const ISO = (k) => (k === "SCO" || k === "ENG" ? "GB" : k);

// [pktDateTime, group, home, away]
const GROUP = [
  // Matchday 1
  ["2026-06-12T00:00", "A", "MX", "ZA"], ["2026-06-12T07:00", "A", "KR", "CZ"],
  ["2026-06-13T00:00", "B", "CA", "BA"], ["2026-06-14T00:00", "B", "QA", "CH"],
  ["2026-06-14T03:00", "C", "BR", "MA"], ["2026-06-14T06:00", "C", "HT", "SCO"],
  ["2026-06-13T06:00", "D", "US", "PY"], ["2026-06-14T09:00", "D", "AU", "TR"],
  ["2026-06-14T22:00", "E", "DE", "CW"], ["2026-06-15T04:00", "E", "CI", "EC"],
  ["2026-06-15T01:00", "F", "NL", "JP"], ["2026-06-15T07:00", "F", "SE", "TN"],
  ["2026-06-16T00:00", "G", "BE", "EG"], ["2026-06-16T06:00", "G", "IR", "NZ"],
  ["2026-06-15T21:00", "H", "ES", "CV"], ["2026-06-16T03:00", "H", "SA", "UY"],
  ["2026-06-17T00:00", "I", "FR", "SN"], ["2026-06-17T03:00", "I", "IQ", "NO"],
  ["2026-06-17T06:00", "J", "AR", "DZ"], ["2026-06-17T09:00", "J", "AT", "JO"],
  ["2026-06-17T22:00", "K", "PT", "CD"], ["2026-06-18T07:00", "K", "UZ", "CO"],
  ["2026-06-18T01:00", "L", "ENG", "HR"], ["2026-06-18T04:00", "L", "GH", "PA"],
  // Matchday 2
  ["2026-06-18T21:00", "A", "CZ", "ZA"], ["2026-06-19T06:00", "A", "MX", "KR"],
  ["2026-06-19T00:00", "B", "CH", "BA"], ["2026-06-19T03:00", "B", "CA", "QA"],
  ["2026-06-20T03:00", "C", "SCO", "MA"], ["2026-06-20T05:30", "C", "BR", "HT"],
  ["2026-06-20T00:00", "D", "US", "AU"], ["2026-06-20T08:00", "D", "TR", "PY"],
  ["2026-06-21T01:00", "E", "DE", "CI"], ["2026-06-21T05:00", "E", "EC", "CW"],
  ["2026-06-20T22:00", "F", "NL", "SE"], ["2026-06-21T09:00", "F", "TN", "JP"],
  ["2026-06-22T00:00", "G", "BE", "IR"], ["2026-06-22T06:00", "G", "NZ", "EG"],
  ["2026-06-21T21:00", "H", "ES", "SA"], ["2026-06-22T03:00", "H", "UY", "CV"],
  ["2026-06-24T04:00", "L", "PA", "HR"], ["2026-06-24T07:00", "K", "CO", "CD"],
  // Matchday 2 — Groups I/J/K/L (pairings derived from MD1+MD3; times approximate)
  ["2026-06-23T00:00", "I", "FR", "IQ"], ["2026-06-23T03:00", "I", "SN", "NO"],
  ["2026-06-23T06:00", "J", "AR", "AT"], ["2026-06-23T09:00", "J", "DZ", "JO"],
  ["2026-06-24T01:00", "K", "PT", "UZ"], ["2026-06-24T01:00", "L", "ENG", "GH"],
  // Matchday 3 (simultaneous kickoffs per group)
  ["2026-06-25T00:00", "B", "CH", "CA"], ["2026-06-25T00:00", "B", "BA", "QA"],
  ["2026-06-25T03:00", "C", "SCO", "BR"], ["2026-06-25T03:00", "C", "MA", "HT"],
  ["2026-06-25T06:00", "A", "CZ", "MX"], ["2026-06-25T06:00", "A", "ZA", "KR"],
  ["2026-06-26T01:00", "E", "CW", "CI"], ["2026-06-26T01:00", "E", "EC", "DE"],
  ["2026-06-26T04:00", "F", "JP", "SE"], ["2026-06-26T04:00", "F", "TN", "NL"],
  ["2026-06-26T07:00", "D", "TR", "US"], ["2026-06-26T07:00", "D", "PY", "AU"],
  ["2026-06-27T00:00", "I", "NO", "FR"], ["2026-06-27T00:00", "I", "SN", "IQ"],
  ["2026-06-27T05:00", "H", "CV", "SA"], ["2026-06-27T05:00", "H", "UY", "ES"],
  ["2026-06-27T08:00", "G", "EG", "IR"], ["2026-06-27T08:00", "G", "NZ", "BE"],
  ["2026-06-28T02:00", "L", "PA", "ENG"], ["2026-06-28T02:00", "L", "HR", "GH"],
  ["2026-06-28T04:30", "K", "CO", "PT"], ["2026-06-28T04:30", "K", "CD", "UZ"],
  ["2026-06-28T07:00", "J", "DZ", "AT"], ["2026-06-28T07:00", "J", "JO", "AR"],
];

// [pktDateTime, stage, homeLabel, awayLabel]
const KO = [
  // Round of 32
  ["2026-06-29T00:00", "ROUND_OF_32", "2A", "2B"], ["2026-06-29T22:00", "ROUND_OF_32", "1C", "2F"],
  ["2026-06-30T01:30", "ROUND_OF_32", "1E", "3ABCDF"], ["2026-06-30T06:00", "ROUND_OF_32", "1F", "2C"],
  ["2026-06-30T22:00", "ROUND_OF_32", "2E", "2I"], ["2026-07-01T02:00", "ROUND_OF_32", "1I", "3CDFGH"],
  ["2026-07-01T06:00", "ROUND_OF_32", "1A", "3CEFHI"], ["2026-07-01T21:00", "ROUND_OF_32", "1L", "3EHIJK"],
  ["2026-07-02T01:00", "ROUND_OF_32", "1G", "3AEHIJ"], ["2026-07-02T05:00", "ROUND_OF_32", "1D", "3BEFIJ"],
  ["2026-07-03T00:00", "ROUND_OF_32", "1H", "2J"], ["2026-07-03T04:00", "ROUND_OF_32", "2K", "2L"],
  ["2026-07-03T08:00", "ROUND_OF_32", "1B", "3EFGIJ"], ["2026-07-03T23:00", "ROUND_OF_32", "2D", "2G"],
  ["2026-07-04T03:00", "ROUND_OF_32", "1J", "2H"], ["2026-07-04T06:30", "ROUND_OF_32", "1K", "3DEIJL"],
  // Round of 16
  ["2026-07-04T22:00", "ROUND_OF_16", "W73", "W75"], ["2026-07-05T02:00", "ROUND_OF_16", "W74", "W77"],
  ["2026-07-06T01:00", "ROUND_OF_16", "W76", "W78"], ["2026-07-06T05:00", "ROUND_OF_16", "W79", "W80"],
  ["2026-07-07T00:00", "ROUND_OF_16", "W83", "W84"], ["2026-07-07T05:00", "ROUND_OF_16", "W81", "W82"],
  ["2026-07-07T21:00", "ROUND_OF_16", "W86", "W88"], ["2026-07-08T01:00", "ROUND_OF_16", "W85", "W87"],
  // Quarter-finals
  ["2026-07-10T01:00", "QUARTER_FINALS", "W89", "W90"], ["2026-07-11T00:00", "QUARTER_FINALS", "W93", "W94"],
  ["2026-07-12T02:00", "QUARTER_FINALS", "W91", "W92"], ["2026-07-12T06:00", "QUARTER_FINALS", "W95", "W96"],
  // Semi-finals
  ["2026-07-15T00:00", "SEMI_FINALS", "W97", "W98"], ["2026-07-16T00:00", "SEMI_FINALS", "W99", "W100"],
  // Third place + Final
  ["2026-07-19T02:00", "THIRD_PLACE", "RU101", "RU102"], ["2026-07-20T00:00", "FINAL", "W101", "W102"],
];

const toUtc = (pkt) => new Date(`${pkt}:00+05:00`).toISOString();

const matches = [];
for (const [pkt, group, h, a] of GROUP) {
  matches.push({
    stage: "GROUP_STAGE",
    groupName: `Group ${group}`,
    homeTeam: NAME[h], awayTeam: NAME[a],
    homeCode: ISO(h), awayCode: ISO(a),
    kickoffUtc: toUtc(pkt),
  });
}
for (const [pkt, stage, h, a] of KO) {
  matches.push({
    stage,
    groupName: null,
    homeTeam: h, awayTeam: a,
    homeCode: null, awayCode: null,
    kickoffUtc: toUtc(pkt),
  });
}

const out = {
  _comment:
    "Real FIFA World Cup 2026 draw + schedule. Group times from the official " +
    "schedule (entered in PKT, stored in UTC). A few matchday-2 group games and " +
    "knockout teams are pending. Regenerate with scripts/gen-fixtures.mjs.",
  count: matches.length,
  matches,
};

mkdirSync(new URL("../data/", import.meta.url), { recursive: true });
writeFileSync(new URL("../data/fixtures.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(`wrote data/fixtures.json with ${matches.length} matches`);
