// Penalty mini-game logic. Runs entirely client-side during play (no API
// calls). Server only persists the daily score at the end.

export const ZONES = [
  "TL", "TC", "TR", // top-left, top-center, top-right
  "BL", "BC", "BR", // bottom-left, bottom-center, bottom-right
] as const;

export type Zone = (typeof ZONES)[number];

export const ZONE_LABEL: Record<Zone, string> = {
  TL: "Top Left",
  TC: "Top Centre",
  TR: "Top Right",
  BL: "Bottom Left",
  BC: "Bottom Centre",
  BR: "Bottom Right",
};

export const KICKS_PER_DAY = 5;

/**
 * Keeper dives toward the user's most-used zone with ~70% weight, otherwise
 * random. `history` is the running tally of how often each zone was shot,
 * combining this session and past games.
 */
export function keeperDive(history: Record<Zone, number>): Zone {
  const total = ZONES.reduce((s, z) => s + (history[z] ?? 0), 0);
  if (total > 0 && Math.random() < 0.7) {
    let best: Zone = ZONES[0];
    let bestN = -1;
    for (const z of ZONES) {
      const n = history[z] ?? 0;
      if (n > bestN) {
        bestN = n;
        best = z;
      }
    }
    return best;
  }
  return ZONES[Math.floor(Math.random() * ZONES.length)];
}

export const SAVE_LINES = [
  "Did you mean to pass it to me?",
  "Too easy. Next.",
  "My grandmother dives better in her sleep — and she saved that.",
  "I read that like a children's book.",
  "Was that a shot or a polite suggestion?",
  "Keep them coming, I'm collecting souvenirs.",
  "I've seen scarier penalties in a car park.",
  "You telegraphed that from another postcode.",
  "Gloves stay clean. Try again.",
  "That's mine. And so is the next one.",
  "You blink, I save. Simple.",
  "Bold of you to aim where I was already standing.",
  "Denied. Take a number.",
  "I dive, therefore I am.",
  "That had 'press conference apology' written all over it.",
];

export const GOAL_LINES = [
  "Lucky. Won't happen again.",
  "Fine. One. Don't get cocky.",
  "The sun was in my eyes. Obviously.",
  "I let you have that for your confidence.",
  "Even a broken clock, right?",
  "Okay, decent. Still losing though.",
  "I slipped. Officially.",
  "Enjoy it while it lasts.",
  "One goal does not a hero make.",
  "My defenders left me exposed. Typical.",
  "Charity is a virtue. You're welcome.",
  "That corner was unguardable. This time.",
  "Write it down — it's the last one.",
  "Respect. Now sit back down.",
  "The post owed you one.",
];

export function pickLine(saved: boolean, prevIndex = -1): { text: string; index: number } {
  const pool = saved ? SAVE_LINES : GOAL_LINES;
  let i = Math.floor(Math.random() * pool.length);
  if (i === prevIndex) i = (i + 1) % pool.length;
  return { text: pool[i], index: i };
}

/** Streak bonus: +1 extra point for every 3 consecutive goals reached. */
export function streakBonus(prevStreak: number, scored: boolean): { streak: number; bonus: number } {
  if (!scored) return { streak: 0, bonus: 0 };
  const streak = prevStreak + 1;
  const bonus = streak % 3 === 0 ? 1 : 0;
  return { streak, bonus };
}
