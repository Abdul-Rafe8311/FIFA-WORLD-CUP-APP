"use client";

import { useState } from "react";
import { TopBar, Avatar } from "@/components/ui";
import { flagEmoji, cn } from "@/lib/utils";
import { COUNTRY_NAME } from "@/lib/countries";
import type { LeaderRow, CountryRow } from "@/lib/queries";

export default function LeaderboardView({
  global,
  countries,
  meId,
  myCountry,
}: {
  global: LeaderRow[];
  countries: CountryRow[];
  meId: string;
  myCountry: string | null;
}) {
  const [tab, setTab] = useState<"global" | "countries">("global");

  return (
    <>
      <TopBar title="Leaderboard" />
      <div className="grid grid-cols-2 border-b border-ink-line">
        {(
          [
            ["global", "Global"],
            ["countries", "Countries"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "py-3 text-sm font-semibold transition-colors",
              tab === k ? "border-b-2 border-pitch text-pitch" : "text-white/50",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "global" && <GlobalList rows={global} meId={meId} />}
        {tab === "countries" && <CountryList rows={countries} myCountry={myCountry} />}
      </div>
    </>
  );
}

function GlobalList({ rows, meId }: { rows: LeaderRow[]; meId: string }) {
  if (rows.length === 0) return <Empty text="No players ranked yet." />;
  return (
    <ol className="space-y-2">
      {rows.map((r) => (
        <li
          key={r.id}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-3 py-2",
            r.id === meId ? "border-pitch/50 bg-pitch/5" : "border-ink-line bg-ink-card",
          )}
        >
          <span className="w-6 text-center text-sm font-bold text-white/45">{r.rank}</span>
          <Avatar src={r.image} name={r.name} size={32} />
          <div className="flex-1 truncate">
            <span className="font-semibold">{r.name ?? "Player"}</span>
            {r.isBot && <span className="ml-1 align-middle text-xs">🤖</span>}
            {r.id === meId && <span className="ml-1 text-xs text-pitch">· you</span>}
          </div>
          <span className="text-lg">{flagEmoji(r.country)}</span>
          <span className="w-12 text-right font-black tabular-nums text-pitch">{r.points}</span>
        </li>
      ))}
    </ol>
  );
}

function CountryList({ rows, myCountry }: { rows: CountryRow[]; myCountry: string | null }) {
  if (rows.length === 0) return <Empty text="No countries ranked yet. Set your country in Profile." />;
  return (
    <ol className="space-y-2">
      {rows.map((r) => (
        <li
          key={r.country}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-3 py-2",
            r.country === myCountry ? "border-pitch/50 bg-pitch/5" : "border-ink-line bg-ink-card",
          )}
        >
          <span className="w-6 text-center text-sm font-bold text-white/45">{r.rank}</span>
          <span className="text-2xl">{flagEmoji(r.country)}</span>
          <div className="flex-1 truncate">
            <p className="font-semibold">{COUNTRY_NAME[r.country] ?? r.country}</p>
            <p className="text-[11px] text-white/45">{r.members} player{r.members === 1 ? "" : "s"}</p>
          </div>
          <span className="w-16 text-right font-black tabular-nums text-pitch">
            {r.avgPoints.toFixed(1)}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-white/40">{text}</p>;
}
