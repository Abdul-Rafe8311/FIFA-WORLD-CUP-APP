import Link from "next/link";
import { flagEmoji } from "@/lib/utils";
import { LocalTime, Countdown } from "@/components/ui";

export type MatchCardData = {
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
  myHome?: number | null;
  myAway?: number | null;
  aiPreview?: string | null;
};

function StatusBadge({ m }: { m: MatchCardData }) {
  if (m.status === "finished") {
    return <span className="tag bg-ink-soft text-white/70">FT {m.homeScore}–{m.awayScore}</span>;
  }
  if (m.status === "live") {
    return <span className="tag bg-red-500/20 text-red-400">● LIVE {m.homeScore ?? 0}–{m.awayScore ?? 0}</span>;
  }
  return (
    <span className="tag bg-pitch/15 text-pitch">
      <Countdown iso={m.kickoffUtc} />
    </span>
  );
}

export default function MatchCard({ m }: { m: MatchCardData }) {
  const hasPred = m.myHome != null && m.myAway != null;
  return (
    <Link
      href={`/match/${m.id}`}
      className="card block transition-colors transition-transform hover:border-pitch/30 active:scale-[0.99]"
    >
      <div className="mb-2 flex items-center justify-between text-[11px] text-white/45">
        <span>{m.groupName ?? m.stage.replaceAll("_", " ")}</span>
        <span><LocalTime iso={m.kickoffUtc} mode="time" /></span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{flagEmoji(m.homeCode)}</span>
            <span className="font-semibold">{m.homeTeam}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{flagEmoji(m.awayCode)}</span>
            <span className="font-semibold">{m.awayTeam}</span>
          </div>
        </div>
        <StatusBadge m={m} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink-line pt-2 text-[11px]">
        {hasPred ? (
          <span className="tag bg-pitch/10 text-pitch">
            Your pick {m.myHome}–{m.myAway}
          </span>
        ) : m.status === "scheduled" ? (
          <span className="text-white/45">Tap to predict →</span>
        ) : (
          <span className="text-white/30">No prediction</span>
        )}
      </div>

      {m.aiPreview && (
        <p className="mt-2 line-clamp-2 text-[11px] italic text-white/45">
          🤖 {m.aiPreview}
        </p>
      )}
    </Link>
  );
}
