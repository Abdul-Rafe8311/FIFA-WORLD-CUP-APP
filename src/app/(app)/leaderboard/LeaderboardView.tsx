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
    <div className="overflow-hidden rounded-2xl border border-ink-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-line text-left text-[11px] uppercase tracking-wide text-white/40">
            <th className="w-14 py-3 pl-4 font-semibold">#</th>
            <th className="py-3 font-semibold">Player</th>
            <th className="py-3 font-semibold">Country</th>
            <th className="py-3 pr-4 text-right font-semibold">Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className={cn(
                "border-b border-ink-line/50 transition-colors last:border-0 hover:bg-ink-soft/40",
                r.id === meId && "bg-pitch/5",
              )}
            >
              <td className="py-2.5 pl-4 font-bold text-white/45">{r.rank}</td>
              <td className="py-2.5">
                <div className="flex items-center gap-2.5">
                  <Avatar src={r.image} name={r.name} size={30} />
                  <span className="font-semibold">{r.name ?? "Player"}</span>
                  {r.isBot && <span className="text-xs">🤖</span>}
                  {r.id === meId && <span className="text-xs text-pitch">· you</span>}
                </div>
              </td>
              <td className="py-2.5 text-lg">{flagEmoji(r.country)}</td>
              <td className="py-2.5 pr-4 text-right font-black tabular-nums text-pitch">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CountryList({ rows, myCountry }: { rows: CountryRow[]; myCountry: string | null }) {
  if (rows.length === 0) return <Empty text="No countries ranked yet. Set your country in Profile." />;
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-line text-left text-[11px] uppercase tracking-wide text-white/40">
            <th className="w-14 py-3 pl-4 font-semibold">#</th>
            <th className="py-3 font-semibold">Country</th>
            <th className="py-3 font-semibold">Players</th>
            <th className="py-3 pr-4 text-right font-semibold">Avg pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.country}
              className={cn(
                "border-b border-ink-line/50 transition-colors last:border-0 hover:bg-ink-soft/40",
                r.country === myCountry && "bg-pitch/5",
              )}
            >
              <td className="py-2.5 pl-4 font-bold text-white/45">{r.rank}</td>
              <td className="py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{flagEmoji(r.country)}</span>
                  <span className="font-semibold">{COUNTRY_NAME[r.country] ?? r.country}</span>
                  {r.country === myCountry && <span className="text-xs text-pitch">· you</span>}
                </div>
              </td>
              <td className="py-2.5 text-white/55">{r.members}</td>
              <td className="py-2.5 pr-4 text-right font-black tabular-nums text-pitch">{r.avgPoints.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-white/40">{text}</p>;
}
