"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type P = { id: string; name: string; position: string; shirtNumber: number | null };
const POS_ORDER = ["GK", "DEF", "MID", "FWD"] as const;

export default function AdminLineupForm({
  matchId,
  teamCode,
  teamName,
  players,
  initial,
}: {
  matchId: string;
  teamCode: string;
  teamName: string;
  players: P[];
  initial: string[];
}) {
  const router = useRouter();
  const [sel, setSel] = useState<Set<string>>(new Set(initial));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const gk = players.filter((p) => p.position === "GK" && sel.has(p.id)).length;

  function toggle(id: string) {
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 11) next.add(id);
      return next;
    });
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/lineups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, teamCode, playerIds: Array.from(sel) }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed");
      setMsg(`Saved · scored ${j.scored} prediction(s)`);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (players.length === 0) {
    return (
      <div className="card">
        <p className="font-bold">{teamName}</p>
        <p className="mt-1 text-sm text-white/40">No squad seeded for {teamCode}.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-bold">{teamName}</p>
        <span className={cn("tag", sel.size === 11 && gk === 1 ? "bg-pitch/15 text-pitch" : "bg-ink-soft text-white/60")}>
          {sel.size}/11 · {gk} GK
        </span>
      </div>
      <div className="space-y-2">
        {POS_ORDER.map((pos) => {
          const group = players
            .filter((p) => p.position === pos)
            .sort((a, b) => (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99));
          if (group.length === 0) return null;
          return (
            <div key={pos}>
              <p className="mb-1 text-[11px] font-bold uppercase text-white/40">{pos}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                      sel.has(p.id)
                        ? "border-pitch bg-pitch/15 text-pitch"
                        : "border-ink-line bg-ink text-white/70",
                    )}
                  >
                    {p.shirtNumber ?? "–"} {p.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {msg && <p className="mt-2 text-xs text-pitch">{msg}</p>}
      <button
        onClick={save}
        disabled={busy || sel.size !== 11 || gk !== 1}
        className="btn-primary mt-3 w-full disabled:opacity-40"
      >
        {busy ? "Saving…" : "Save actual XI & score"}
      </button>
    </div>
  );
}
