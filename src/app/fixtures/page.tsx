import Link from "next/link";
import fixtures from "@/../data/fixtures.json";
import PublicSchedule, { type PublicMatch } from "@/components/PublicSchedule";

export const metadata = {
  title: "Schedule — FIFA World Cup 2026 | GoalCast",
  description:
    "The full FIFA World Cup 2026 match schedule — all 104 matches with venues and kickoff times in your timezone.",
};

export default function FixturesPage() {
  const matches = (fixtures.matches as PublicMatch[]) ?? [];

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* simple sticky nav back to landing */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-ink-line bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pitch text-base">
              ⚽
            </span>
            <span className="text-lg font-black">
              Goal<span className="text-pitch">Cast</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/leaderboard"
              className="hidden rounded-full px-3 py-2 font-semibold text-white/65 transition-colors hover:bg-white/10 hover:text-white sm:block"
            >
              Leaderboard
            </Link>
            <Link
              href="/login?mode=signup"
              className="rounded-full bg-pitch px-4 py-2 font-bold text-black transition-transform active:scale-95"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>

      <PublicSchedule matches={matches} />
    </div>
  );
}
