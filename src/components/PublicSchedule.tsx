"use client";

import { useMemo, useState } from "react";
import { flagEmoji, cn } from "@/lib/utils";
import { TimezoneSelect, useTimezone } from "@/components/Timezone";

export type PublicMatch = {
  stage: string;
  groupName: string | null;
  homeTeam: string;
  awayTeam: string;
  homeCode: string | null;
  awayCode: string | null;
  venue?: string | null;
  kickoffUtc: string;
};

function dateKeyInTz(iso: string, tz: string | undefined): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function dayLabel(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(y, m - 1, d));
}

function timeInTz(iso: string, tz: string | undefined): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const STAGE_LABEL: Record<string, string> = {
  GROUP_STAGE: "Group stage",
  ROUND_OF_32: "Round of 32",
  ROUND_OF_16: "Round of 16",
  QUARTER_FINALS: "Quarter-finals",
  SEMI_FINALS: "Semi-finals",
  THIRD_PLACE: "Third place",
  FINAL: "Final",
};

export default function PublicSchedule({ matches }: { matches: PublicMatch[] }) {
  const { tz, selected } = useTimezone();
  const keyOf = (iso: string) => dateKeyInTz(iso, tz);

  const days = useMemo(() => {
    const set = new Set(matches.map((m) => keyOf(m.kickoffUtc)));
    return Array.from(set).sort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, tz]);

  const groups = useMemo(() => {
    const set = new Set(
      matches.map((m) => m.groupName).filter((g): g is string => Boolean(g)),
    );
    return Array.from(set).sort();
  }, [matches]);

  const todayKey = keyOf(new Date().toISOString());
  const [activeDay, setActiveDay] = useState<string | "all">(
    days.includes(todayKey) ? todayKey : "all",
  );
  const [group, setGroup] = useState<string | "all">("all");

  const filtered = matches.filter((m) => {
    if (activeDay !== "all" && keyOf(m.kickoffUtc) !== activeDay) return false;
    if (group !== "all" && m.groupName !== group) return false;
    return true;
  });

  // Group filtered matches by day for section headers.
  const byDay = useMemo(() => {
    const map = new Map<string, PublicMatch[]>();
    for (const m of filtered) {
      const k = keyOf(m.kickoffUtc);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(m);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, tz]);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-pitch">
            FIFA World Cup 2026
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
            Full match schedule
          </h1>
          <p className="mt-2 text-sm text-white/55">
            All 104 matches with venues — times shown in your selected timezone.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/45">🕑 Times in</span>
          <TimezoneSelect />
        </div>
      </div>

      {/* Day filter */}
      <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <Chip active={activeDay === "all"} onClick={() => setActiveDay("all")}>
          All days
        </Chip>
        {days.map((d) => (
          <Chip key={d} active={activeDay === d} onClick={() => setActiveDay(d)}>
            {d === todayKey ? "Today" : dayLabel(d)}
          </Chip>
        ))}
      </div>

      {/* Group filter */}
      {groups.length > 0 && (
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Chip outline active={group === "all"} onClick={() => setGroup("all")}>
            All groups
          </Chip>
          {groups.map((g) => (
            <Chip key={g} outline active={group === g} onClick={() => setGroup(g)}>
              {g}
            </Chip>
          ))}
        </div>
      )}

      {/* Match list grouped by day */}
      <div className="mt-8 space-y-8">
        {byDay.length === 0 && (
          <p className="py-12 text-center text-sm text-white/40">
            No matches for this filter.
          </p>
        )}
        {byDay.map(([day, ms]) => (
          <section key={day}>
            <h2 className="mb-3 text-sm font-bold text-white/70">
              {day === todayKey ? "Today" : dayLabel(day)}
            </h2>
            <div className="overflow-hidden rounded-2xl border border-ink-line bg-ink-card/40">
              {ms
                .sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc))
                .map((m, i) => (
                  <Row key={i} m={m} tz={tz} />
                ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-pitch/30 bg-gradient-to-br from-pitch/15 to-ink-card p-6 text-center">
        <p className="text-lg font-black">Want to predict these matches?</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-white/60">
          Sign up free to call every scoreline, beat the AI pundit, and climb your
          country leaderboard.
        </p>
        <a
          href="/login?mode=signup"
          className="mt-4 inline-flex rounded-full bg-pitch px-6 py-2.5 text-sm font-bold text-black transition-transform active:scale-95"
        >
          Get started — it&apos;s free
        </a>
      </div>

      <p className="mt-6 text-center text-[11px] text-white/30">
        Timezone: {selected || "device default"} · Venues provisional · Unofficial fan game
      </p>
    </div>
  );
}

function Row({ m, tz }: { m: PublicMatch; tz: string | undefined }) {
  const isGroup = m.stage === "GROUP_STAGE";
  return (
    <div className="flex items-center gap-3 border-b border-ink-line px-4 py-3 transition-colors last:border-b-0 hover:bg-white/[0.02]">
      {/* time */}
      <div className="w-14 shrink-0 text-center">
        <p className="text-sm font-bold text-pitch">{timeInTz(m.kickoffUtc, tz)}</p>
      </div>

      {/* teams */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span>{isGroup ? flagEmoji(m.homeCode) : "⚽"}</span>
          <span className="truncate">{m.homeTeam}</span>
          <span className="text-white/30">vs</span>
          <span>{isGroup ? flagEmoji(m.awayCode) : "⚽"}</span>
          <span className="truncate">{m.awayTeam}</span>
        </div>
        {m.venue && (
          <p className="mt-0.5 truncate text-xs text-white/45">📍 {m.venue}</p>
        )}
      </div>

      {/* stage / group tag */}
      <span className="hidden shrink-0 rounded-full border border-ink-line px-2.5 py-1 text-[11px] font-semibold text-white/50 sm:block">
        {m.groupName ?? STAGE_LABEL[m.stage] ?? m.stage}
      </span>
    </div>
  );
}

function Chip({
  active,
  onClick,
  outline,
  children,
}: {
  active: boolean;
  onClick: () => void;
  outline?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? outline
            ? "border-pitch text-pitch"
            : "border-pitch bg-pitch text-black"
          : "border-ink-line bg-ink-card text-white/60 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
