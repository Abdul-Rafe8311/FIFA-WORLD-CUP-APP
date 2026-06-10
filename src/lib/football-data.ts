// Thin client for football-data.org. FIFA World Cup competition code "WC".
// Free tier: 10 req/min — cron usage stays well under this.

const BASE = "https://api.football-data.org/v4";
const COMPETITION = "WC"; // FIFA World Cup

export type FdMatch = {
  id: number;
  stage: string;
  group: string | null;
  utcDate: string;
  status: string; // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED ...
  homeTeam: { name: string; tla?: string | null };
  awayTeam: { name: string; tla?: string | null };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
};

function token(): string {
  const t = process.env.FOOTBALL_DATA_TOKEN;
  if (!t) throw new Error("FOOTBALL_DATA_TOKEN is not set");
  return t;
}

async function fdFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-Auth-Token": token() },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`football-data ${path} -> ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/** All matches in the competition (used by the seed script). */
export async function fetchAllMatches(): Promise<FdMatch[]> {
  const data = await fdFetch<{ matches: FdMatch[] }>(
    `/competitions/${COMPETITION}/matches`,
  );
  return data.matches ?? [];
}

/** Matches within a UTC date range (yyyy-mm-dd), used by results cron. */
export async function fetchMatchesByDate(
  dateFrom: string,
  dateTo: string,
): Promise<FdMatch[]> {
  const data = await fdFetch<{ matches: FdMatch[] }>(
    `/competitions/${COMPETITION}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
  );
  return data.matches ?? [];
}

/** Normalize football-data status into our schema's status. */
export function normalizeStatus(fd: string): "scheduled" | "live" | "finished" {
  if (fd === "FINISHED" || fd === "AWARDED") return "finished";
  if (fd === "IN_PLAY" || fd === "PAUSED") return "live";
  return "scheduled";
}
