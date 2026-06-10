"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopBar, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  ZONES,
  ZONE_LABEL,
  KICKS_PER_DAY,
  keeperDive,
  pickLine,
  streakBonus,
  type Zone,
} from "@/lib/penalty";

type Row = { id: string; name: string | null; image: string | null; score: number };
type Played = { score: number; bestStreak: number };

const ZONE_STORE = "goalcast-penalty-zones";

function loadHistory(): Record<Zone, number> {
  const base = Object.fromEntries(ZONES.map((z) => [z, 0])) as Record<Zone, number>;
  if (typeof window === "undefined") return base;
  try {
    const raw = JSON.parse(localStorage.getItem(ZONE_STORE) ?? "{}");
    for (const z of ZONES) base[z] = Number(raw[z]) || 0;
  } catch {
    /* ignore */
  }
  return base;
}

export default function PenaltyGame({
  playedToday,
  daily,
  allTime,
  meId,
}: {
  playedToday: Played | null;
  daily: Row[];
  allTime: Row[];
  meId: string;
}) {
  const router = useRouter();
  const [done, setDone] = useState<Played | null>(playedToday);
  const [kicksLeft, setKicksLeft] = useState(KICKS_PER_DAY);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [shotZone, setShotZone] = useState<Zone | null>(null);
  const [keeperZone, setKeeperZone] = useState<Zone | null>(null);
  const [message, setMessage] = useState<string>("Pick a corner. Beat the keeper.");
  const [resolving, setResolving] = useState(false);
  const [lastScored, setLastScored] = useState<boolean | null>(null);
  const [board, setBoard] = useState<"daily" | "allTime">("daily");

  const history = useRef<Record<Zone, number>>(
    Object.fromEntries(ZONES.map((z) => [z, 0])) as Record<Zone, number>,
  );
  const lineIdx = useRef(-1);

  useEffect(() => {
    history.current = loadHistory();
  }, []);

  async function submit(finalScore: number, finalBest: number) {
    try {
      await fetch("/api/penalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: finalScore, bestStreak: finalBest }),
      });
    } catch {
      /* ignore network errors; show local result anyway */
    }
    setDone({ score: finalScore, bestStreak: finalBest });
    router.refresh();
  }

  function shoot(zone: Zone) {
    if (resolving || kicksLeft <= 0 || done) return;
    setResolving(true);
    setShotZone(zone);

    // Keeper decides based on the running history, THEN we record this shot.
    const dive = keeperDive(history.current);
    history.current[zone] = (history.current[zone] ?? 0) + 1;
    try {
      localStorage.setItem(ZONE_STORE, JSON.stringify(history.current));
    } catch {
      /* ignore */
    }

    setTimeout(() => setKeeperZone(dive), 250);

    setTimeout(() => {
      const scored = dive !== zone;
      setLastScored(scored);
      const line = pickLine(!scored, lineIdx.current);
      lineIdx.current = line.index;

      let nextScore = score;
      let nextStreak = streak;
      let nextBest = bestStreak;
      if (scored) {
        const { streak: s, bonus } = streakBonus(streak, true);
        nextStreak = s;
        nextScore = score + 1 + bonus;
        nextBest = Math.max(bestStreak, s);
        setMessage(`GOAL! ${bonus ? "Streak bonus +1! " : ""}${line.text}`);
      } else {
        nextStreak = 0;
        setMessage(`SAVED! ${line.text}`);
      }
      setScore(nextScore);
      setStreak(nextStreak);
      setBestStreak(nextBest);

      const left = kicksLeft - 1;
      setKicksLeft(left);

      setTimeout(() => {
        setShotZone(null);
        setKeeperZone(null);
        setLastScored(null);
        setResolving(false);
        if (left <= 0) {
          setMessage("Full time!");
          submit(nextScore, nextBest);
        } else {
          setMessage("Next kick — pick a corner.");
        }
      }, 1100);
    }, 600);
  }

  return (
    <>
      <TopBar title="Penalty Shootout" />
      <div className="space-y-5 p-4">
        {done ? (
          <section className="card animate-pop-in text-center">
            <p className="text-sm text-white/60">Today&apos;s result</p>
            <p className="my-2 text-5xl font-black text-pitch">{done.score}</p>
            <p className="text-sm text-white/60">
              Best streak {done.bestStreak} · come back tomorrow for 5 more kicks.
            </p>
          </section>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold">
                Score <span className="text-pitch">{score}</span>
              </span>
              <span className="text-white/60">Streak {streak} 🔥</span>
              <span className="font-bold">
                Kicks <span className="text-pitch">{kicksLeft}</span>/{KICKS_PER_DAY}
              </span>
            </div>

            <Goal
              shotZone={shotZone}
              keeperZone={keeperZone}
              scored={lastScored}
              disabled={resolving}
              onShoot={shoot}
            />

            <p
              className={cn(
                "min-h-[2.5rem] rounded-xl px-3 py-2 text-center text-sm font-semibold",
                lastScored === true && "bg-pitch/15 text-pitch animate-pop-in",
                lastScored === false && "bg-red-500/15 text-red-300 animate-shake",
                lastScored === null && "bg-ink-soft text-white/70",
              )}
            >
              {message}
            </p>
          </>
        )}

        {/* Leaderboards */}
        <section>
          <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-ink-line">
            {(["daily", "allTime"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBoard(b)}
                className={cn(
                  "py-2 text-sm font-semibold transition-colors",
                  board === b ? "bg-pitch text-black" : "bg-ink-card text-white/60",
                )}
              >
                {b === "daily" ? "Today" : "All-time"}
              </button>
            ))}
          </div>
          <Board rows={board === "daily" ? daily : allTime} meId={meId} />
        </section>
      </div>
    </>
  );
}

function Goal({
  shotZone,
  keeperZone,
  scored,
  disabled,
  onShoot,
}: {
  shotZone: Zone | null;
  keeperZone: Zone | null;
  scored: boolean | null;
  disabled: boolean;
  onShoot: (z: Zone) => void;
}) {
  return (
    <div className="relative mx-auto aspect-[3/2] w-full max-w-sm rounded-lg border-[6px] border-white/85 bg-[repeating-linear-gradient(90deg,transparent,transparent_14px,rgba(255,255,255,0.06)_15px),repeating-linear-gradient(0deg,transparent,transparent_14px,rgba(255,255,255,0.06)_15px)] p-1.5">
      <div className="grid h-full grid-cols-3 grid-rows-2 gap-1.5">
        {ZONES.map((z) => {
          const isShot = shotZone === z;
          const isKeeper = keeperZone === z;
          return (
            <button
              key={z}
              disabled={disabled}
              onClick={() => onShoot(z)}
              aria-label={ZONE_LABEL[z]}
              className={cn(
                "relative flex items-center justify-center rounded-md border border-white/10 transition-colors active:scale-95",
                disabled ? "cursor-default" : "hover:bg-pitch/10 active:bg-pitch/20",
                isShot && scored === true && "bg-pitch/30",
                isShot && scored === false && "bg-red-500/30",
              )}
            >
              {isKeeper && <span className="absolute text-3xl drop-shadow">🧤</span>}
              {isShot && <span className="absolute text-2xl">⚽</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Board({ rows, meId }: { rows: Row[]; meId: string }) {
  if (rows.length === 0)
    return <p className="py-6 text-center text-sm text-white/40">No scores yet. Be the first!</p>;
  return (
    <ol className="space-y-2">
      {rows.map((r, i) => (
        <li
          key={r.id}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-3 py-2",
            r.id === meId ? "border-pitch/50 bg-pitch/5" : "border-ink-line bg-ink-card",
          )}
        >
          <span className="w-5 text-center text-sm font-bold text-white/45">{i + 1}</span>
          <Avatar src={r.image} name={r.name} size={28} />
          <span className="flex-1 truncate font-semibold">
            {r.name ?? "Player"}
            {r.id === meId && <span className="ml-1 text-xs text-pitch">· you</span>}
          </span>
          <span className="font-black tabular-nums text-pitch">{r.score}</span>
        </li>
      ))}
    </ol>
  );
}
