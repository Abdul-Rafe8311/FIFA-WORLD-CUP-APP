"use client";

import { useMemo, useState } from "react";
import MatchCard, { type MatchCardData } from "@/components/MatchCard";
import { TopBar } from "@/components/ui";
import { cn } from "@/lib/utils";
import { TimezoneSelect, useTimezone } from "@/components/Timezone";

/** yyyy-mm-dd for an instant, in the given IANA timezone (or device default). */
function dateKeyInTz(iso: string, tz: string | undefined): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function labelFor(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export default function ScheduleView({ matches }: { matches: MatchCardData[] }) {
  const { tz } = useTimezone();
  const localDateKey = (iso: string) => dateKeyInTz(iso, tz);
  const todayKey = localDateKey(new Date().toISOString());

  const days = useMemo(() => {
    const set = new Set(matches.map((m) => localDateKey(m.kickoffUtc)));
    return Array.from(set).sort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, tz]);

  const groups = useMemo(() => {
    const set = new Set(
      matches.map((m) => m.groupName).filter((g): g is string => Boolean(g)),
    );
    return Array.from(set).sort();
  }, [matches]);

  const initialDay = days.includes(todayKey) ? todayKey : days[0] ?? todayKey;
  const [activeDay, setActiveDay] = useState(initialDay);
  const [group, setGroup] = useState<string | "all">("all");

  const todayMatches = matches.filter((m) => localDateKey(m.kickoffUtc) === todayKey);

  const dayMatches = matches.filter((m) => {
    if (localDateKey(m.kickoffUtc) !== activeDay) return false;
    if (group !== "all" && m.groupName !== group) return false;
    return true;
  });

  if (matches.length === 0) {
    return (
      <>
        <TopBar title="Schedule" />
        <div className="p-6 text-center text-white/50">
          <p className="text-4xl">📭</p>
          <p className="mt-3 font-semibold">No fixtures yet</p>
          <p className="mt-1 text-sm">Run the seed script to load the World Cup schedule.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Schedule" right={<TimezoneSelect />} />

      {todayMatches.length > 0 && (
        <section className="px-4 pt-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-pitch">
            <span className="h-2 w-2 animate-pulse-soft rounded-full bg-pitch" /> Today
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {todayMatches.map((m) => (
              <MatchCard key={m.id} m={m} />
            ))}
          </div>
        </section>
      )}

      <section className="px-4 pt-5">
        <h2 className="mb-2 text-sm font-bold text-white/70">All fixtures</h2>

        <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                activeDay === d
                  ? "border-pitch bg-pitch text-black"
                  : "border-ink-line bg-ink-card text-white/60",
              )}
            >
              {d === todayKey ? "Today" : labelFor(d)}
            </button>
          ))}
        </div>

        {groups.length > 0 && (
          <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
            <FilterChip active={group === "all"} onClick={() => setGroup("all")}>
              All groups
            </FilterChip>
            {groups.map((g) => (
              <FilterChip key={g} active={group === g} onClick={() => setGroup(g)}>
                {g}
              </FilterChip>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 pb-4 sm:grid-cols-2 xl:grid-cols-3">
          {dayMatches.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-white/40">
              No matches for this filter.
            </p>
          ) : (
            dayMatches.map((m) => <MatchCard key={m.id} m={m} />)
          )}
        </div>
      </section>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active ? "border-pitch text-pitch" : "border-ink-line text-white/50",
      )}
    >
      {children}
    </button>
  );
}
