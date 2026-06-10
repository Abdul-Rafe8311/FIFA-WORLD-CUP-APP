"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { flagEmoji, cn, isScoreLocked, isLineupLocked } from "@/lib/utils";
import { scoreLineup, countLineupHits } from "@/lib/scoring";
import { LocalTime, Countdown } from "@/components/ui";

type Player = {
  id: string;
  teamCode: string;
  name: string;
  position: string;
  shirtNumber: number | null;
};

export type MatchViewData = {
  match: {
    id: string;
    stage: string;
    groupName: string | null;
    homeTeam: string;
    awayTeam: string;
    homeCode: string | null;
    awayCode: string | null;
    kickoffUtc: string;
    status: string;
    homeScore: number | null;
    awayScore: number | null;
  };
  myPrediction: { id: string; home: number; away: number; points: number | null } | null;
  ai: {
    prediction: { home: number | null; away: number | null; text: string } | null;
    preview: string | null;
    roast: string | null;
  };
  players: Player[];
  myLineups: { teamCode: string; playerIds: string[]; points: number | null }[];
  actualLineups: { teamCode: string; playerIds: string[] }[];
};

export default function MatchView({ data }: { data: MatchViewData }) {
  const { match } = data;
  const [tab, setTab] = useState<"score" | "lineup">("score");
  const scoreLocked = isScoreLocked(match.kickoffUtc);
  const finished = match.status === "finished";

  return (
    <main>
      {/* Header */}
      <header className="border-b border-ink-line bg-gradient-to-b from-ink-card to-ink px-4 py-5">
        <button
          onClick={() => history.back()}
          className="mb-3 text-sm text-white/50 active:text-white"
        >
          ← Back
        </button>
        <p className="mb-3 text-center text-[11px] uppercase tracking-wide text-white/45">
          {match.groupName ?? match.stage.replaceAll("_", " ")}
        </p>
        <div className="flex items-center justify-between">
          <TeamHead name={match.homeTeam} code={match.homeCode} />
          <div className="px-2 text-center">
            {finished ? (
              <div className="text-3xl font-black tabular-nums">
                {match.homeScore}–{match.awayScore}
              </div>
            ) : match.status === "live" ? (
              <div className="text-3xl font-black tabular-nums text-red-400">
                {match.homeScore ?? 0}–{match.awayScore ?? 0}
              </div>
            ) : (
              <div className="text-xs font-semibold text-pitch">
                <Countdown iso={match.kickoffUtc} />
              </div>
            )}
            <div className="mt-1 text-[11px] text-white/45">
              <LocalTime iso={match.kickoffUtc} mode="datetime" />
            </div>
          </div>
          <TeamHead name={match.awayTeam} code={match.awayCode} />
        </div>
      </header>

      {/* Tabs */}
      <div className="grid grid-cols-2 border-b border-ink-line">
        {(["score", "lineup"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "py-3 text-sm font-semibold capitalize transition-colors",
              tab === t ? "border-b-2 border-pitch text-pitch" : "text-white/50",
            )}
          >
            {t === "score" ? "Score" : "Lineup"}
          </button>
        ))}
      </div>

      <div className="space-y-4 p-4">
        {tab === "score" ? (
          <ScoreTab data={data} scoreLocked={scoreLocked} finished={finished} />
        ) : (
          <LineupTab data={data} />
        )}
      </div>
    </main>
  );
}

function TeamHead({ name, code }: { name: string; code: string | null }) {
  return (
    <div className="flex w-24 flex-col items-center gap-1 text-center">
      <span className="text-4xl">{flagEmoji(code)}</span>
      <span className="text-sm font-bold leading-tight">{name}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score tab
// ---------------------------------------------------------------------------
function ScoreTab({
  data,
  scoreLocked,
  finished,
}: {
  data: MatchViewData;
  scoreLocked: boolean;
  finished: boolean;
}) {
  const { match, myPrediction, ai } = data;
  const router = useRouter();
  const [home, setHome] = useState(myPrediction?.home ?? 0);
  const [away, setAway] = useState(myPrediction?.away ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: match.id, home, away }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to save");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {!scoreLocked ? (
        <section className="card">
          <p className="mb-4 text-center text-sm font-semibold text-white/70">
            Your prediction
          </p>
          <div className="flex items-center justify-center gap-4">
            <Stepper label={match.homeTeam} code={match.homeCode} value={home} onChange={setHome} />
            <span className="pb-6 text-2xl font-black text-white/30">:</span>
            <Stepper label={match.awayTeam} code={match.awayCode} value={away} onChange={setAway} />
          </div>
          {error && <p className="mt-3 text-center text-xs text-red-400">{error}</p>}
          <button
            onClick={save}
            disabled={saving}
            className={cn("btn-primary mt-5 w-full", saved && "animate-pop-in")}
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : myPrediction ? "Update prediction" : "Save prediction"}
          </button>
          <p className="mt-2 text-center text-[11px] text-white/40">
            Locks at kickoff · editable until then
          </p>
        </section>
      ) : (
        <section className="card text-center">
          <p className="text-sm font-semibold text-white/70">Your prediction</p>
          {myPrediction ? (
            <p className="mt-2 text-3xl font-black tabular-nums">
              {myPrediction.home}–{myPrediction.away}
            </p>
          ) : (
            <p className="mt-2 text-sm text-white/40">No prediction made — locked</p>
          )}
          {finished && myPrediction && (
            <PointsPill points={myPrediction.points} />
          )}
        </section>
      )}

      {/* AI Pundit block */}
      <section className="card border-pitch/20">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="font-bold">The Pundit</span>
          {ai.prediction && ai.prediction.home != null && (
            <span className="tag ml-auto bg-pitch/15 text-pitch">
              calls it {ai.prediction.home}–{ai.prediction.away}
            </span>
          )}
        </div>
        {ai.prediction?.text && (
          <p className="text-sm text-white/75">{ai.prediction.text}</p>
        )}
        {ai.preview && (
          <p className="mt-2 border-t border-ink-line pt-2 text-sm italic text-white/60">
            {ai.preview}
          </p>
        )}
        {!ai.prediction && !ai.preview && (
          <p className="text-sm text-white/40">The Pundit hasn’t weighed in yet.</p>
        )}
        {finished && ai.roast && (
          <p className="mt-2 border-t border-ink-line pt-2 text-sm text-amber-300/90">
            🎙️ {ai.roast}
          </p>
        )}
      </section>

      {finished && myPrediction && (
        <ShareCard predictionId={myPrediction.id} />
      )}
    </>
  );
}

function Stepper({
  label,
  code,
  value,
  onChange,
}: {
  label: string;
  code: string | null;
  value: number;
  onChange: (n: number) => void;
}) {
  const set = (n: number) => onChange(Math.max(0, Math.min(15, n)));
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-3xl">{flagEmoji(code)}</span>
      <button
        onClick={() => set(value + 1)}
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-soft text-2xl font-bold active:scale-90 active:bg-pitch active:text-black"
      >
        +
      </button>
      <span className="w-14 rounded-xl bg-ink py-2 text-center text-3xl font-black tabular-nums">
        {value}
      </span>
      <button
        onClick={() => set(value - 1)}
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-soft text-2xl font-bold active:scale-90"
      >
        −
      </button>
      <span className="max-w-[5rem] truncate text-[11px] text-white/45">{label}</span>
    </div>
  );
}

function PointsPill({ points }: { points: number | null }) {
  if (points == null) return null;
  const good = points > 0;
  return (
    <div
      className={cn(
        "mx-auto mt-3 inline-flex animate-pop-in items-center gap-1 rounded-full px-3 py-1 text-sm font-bold",
        good ? "bg-pitch/15 text-pitch" : "bg-ink-soft text-white/50",
      )}
    >
      {points === 3 ? "Exact score!" : points === 1 ? "Right result" : "Missed"} +{points} pts
    </div>
  );
}

function ShareCard({ predictionId }: { predictionId: string }) {
  const [busy, setBusy] = useState(false);
  const url = `/api/og/card/${predictionId}`;

  async function share() {
    setBusy(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], "goalcast.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "GoalCast", text: "I called it on GoalCast ⚽" });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "goalcast.png";
        a.click();
        URL.revokeObjectURL(a.href);
      }
    } catch {
      window.open(url, "_blank");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={share} disabled={busy} className="btn-primary w-full">
      {busy ? "Preparing…" : "Share Result Card ✅"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Lineup tab
// ---------------------------------------------------------------------------
function LineupTab({ data }: { data: MatchViewData }) {
  const { match } = data;
  const teams = [
    { code: match.homeCode, name: match.homeTeam },
    { code: match.awayCode, name: match.awayTeam },
  ].filter((t): t is { code: string; name: string } => Boolean(t.code));

  const lineupLocked = isLineupLocked(match.kickoffUtc);

  if (teams.length === 0) {
    return <p className="py-8 text-center text-sm text-white/40">Teams not confirmed yet.</p>;
  }

  return (
    <div className="space-y-6">
      <p className="rounded-xl bg-ink-soft px-3 py-2 text-center text-[11px] text-white/55">
        Pick the starting XI (exactly 1 GK). Locks 90 min before kickoff.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        {teams.map((t) => (
          <TeamLineup
            key={t.code}
            teamCode={t.code}
            teamName={t.name}
            matchId={match.id}
            players={data.players.filter((p) => p.teamCode === t.code)}
            myLineup={data.myLineups.find((l) => l.teamCode === t.code) ?? null}
            actual={data.actualLineups.find((l) => l.teamCode === t.code) ?? null}
            locked={lineupLocked}
          />
        ))}
      </div>
    </div>
  );
}

const POS_ORDER = ["GK", "DEF", "MID", "FWD"] as const;

function TeamLineup({
  teamCode,
  teamName,
  matchId,
  players,
  myLineup,
  actual,
  locked,
}: {
  teamCode: string;
  teamName: string;
  matchId: string;
  players: Player[];
  myLineup: { playerIds: string[]; points: number | null } | null;
  actual: { playerIds: string[] } | null;
  locked: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(myLineup?.playerIds ?? []),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const actualSet = useMemo(() => new Set(actual?.playerIds ?? []), [actual]);
  const gkCount = players.filter((p) => p.position === "GK" && selected.has(p.id)).length;

  function toggle(p: Player) {
    if (locked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(p.id)) {
        next.delete(p.id);
      } else {
        if (next.size >= 11) return next;
        if (p.position === "GK" && gkCount >= 1) return next; // enforce 1 GK
        next.add(p.id);
      }
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/lineup-predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, teamCode, playerIds: Array.from(selected) }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to save");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const showResult = actual != null && myLineup != null;
  const hits = showResult ? countLineupHits(myLineup!.playerIds, actual!.playerIds) : 0;

  if (players.length === 0) {
    return (
      <section className="card">
        <h3 className="font-bold">{teamName}</h3>
        <p className="mt-2 text-sm text-white/40">Squad not loaded yet.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">{teamName}</h3>
        {showResult ? (
          <span className="tag bg-pitch/15 text-pitch">
            {hits}/11 · {scoreLineup(myLineup!.playerIds, actual!.playerIds)} pts
          </span>
        ) : (
          <span className={cn("tag", selected.size === 11 ? "bg-pitch/15 text-pitch" : "bg-ink-soft text-white/60")}>
            {selected.size}/11
          </span>
        )}
      </div>

      <div className="space-y-3">
        {POS_ORDER.map((pos) => {
          const group = players
            .filter((p) => p.position === pos)
            .sort((a, b) => (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99));
          if (group.length === 0) return null;
          return (
            <div key={pos}>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-white/40">{pos}</p>
              <div className="grid grid-cols-1 gap-1.5">
                {group.map((p) => {
                  const isSel = selected.has(p.id);
                  const inActual = actualSet.has(p.id);
                  let stateClass = "border-ink-line bg-ink";
                  if (showResult) {
                    if (isSel && inActual) stateClass = "border-pitch/50 bg-pitch/10 text-pitch";
                    else if (isSel && !inActual) stateClass = "border-red-500/40 bg-red-500/10 text-red-300";
                  } else if (isSel) {
                    stateClass = "border-pitch bg-pitch/10 text-pitch";
                  }
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggle(p)}
                      disabled={locked}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors active:scale-[0.98] disabled:active:scale-100",
                        stateClass,
                      )}
                    >
                      <span className="w-6 shrink-0 text-center text-xs font-bold text-white/40">
                        {p.shirtNumber ?? "–"}
                      </span>
                      <span className="flex-1 font-medium">{p.name}</span>
                      {showResult && isSel && (
                        <span>{inActual ? "✅" : "❌"}</span>
                      )}
                      {showResult && !isSel && inActual && (
                        <span className="text-[11px] text-white/30">started</span>
                      )}
                      {!showResult && isSel && <span className="text-pitch">●</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!locked && !showResult && (
        <>
          {error && <p className="mt-3 text-center text-xs text-red-400">{error}</p>}
          <button
            onClick={save}
            disabled={saving || selected.size !== 11 || gkCount !== 1}
            className={cn("btn-primary mt-4 w-full disabled:opacity-40", saved && "animate-pop-in")}
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : `Save XI (${selected.size}/11)`}
          </button>
        </>
      )}
      {locked && !showResult && (
        <p className="mt-3 text-center text-[11px] text-white/40">
          Lineup predictions are locked.
        </p>
      )}
    </section>
  );
}
