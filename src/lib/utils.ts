/** Convert ISO-2 country code to a flag emoji. Falls back to a globe. */
export function flagEmoji(iso2?: string | null): string {
  if (!iso2 || iso2.length !== 2) return "🌐";
  const code = iso2.toUpperCase();
  const A = 0x1f1e6;
  const base = "A".charCodeAt(0);
  return String.fromCodePoint(
    A + (code.charCodeAt(0) - base),
    A + (code.charCodeAt(1) - base),
  );
}

/** Lineup predictions lock 90 minutes before kickoff. */
export const LINEUP_LOCK_MINUTES = 90;

export function isScoreLocked(kickoffUtc: Date | string, now: Date = new Date()): boolean {
  return now.getTime() >= new Date(kickoffUtc).getTime();
}

export function isLineupLocked(kickoffUtc: Date | string, now: Date = new Date()): boolean {
  const lock = new Date(kickoffUtc).getTime() - LINEUP_LOCK_MINUTES * 60 * 1000;
  return now.getTime() >= lock;
}

/** Today's date as yyyy-mm-dd in UTC (penalty daily reset key). */
export function todayUtc(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Random uppercase alphanumeric invite code (no ambiguous chars). */
export function makeInviteCode(len = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/** Tailwind className combiner. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function clampGoals(n: unknown): number {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(15, v));
}

export function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
