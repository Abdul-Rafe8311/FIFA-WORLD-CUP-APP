import Link from "next/link";
import { auth } from "@/lib/auth";
import { GoogleSignIn } from "@/components/AuthButtons";

const FEATURES = [
  { icon: "🎯", title: "Predict & climb", text: "Call every scoreline and rise up the leaderboards." },
  { icon: "🤖", title: "Beat the AI Pundit", text: "An AI predicts every match and plays against you." },
  { icon: "🌍", title: "Country vs Country", text: "Your points feed your nation's global ranking." },
  { icon: "👥", title: "Private leagues", text: "Invite friends with a 6-char code." },
  { icon: "🥅", title: "Penalty shootout", text: "Take on an AI keeper in a daily mini-game." },
  { icon: "📋", title: "Predict the XI", text: "Guess the starting eleven before lineups drop." },
  { icon: "✅", title: "Shareable cards", text: "Brag with 'I called it' result cards." },
];

export default async function Landing() {
  const session = await auth();

  return (
    <main className="min-h-[100dvh] px-5 pb-10 pt-12">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pitch text-3xl shadow-lg shadow-pitch/20">
          ⚽
        </div>
        <h1 className="text-4xl font-black tracking-tight">
          Goal<span className="text-pitch">Cast</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-balance text-white/60">
          Predict every World Cup match. Beat the AI. Top your country.
        </p>
      </div>

      {session?.user ? (
        <Link href="/schedule" className="btn-primary mb-8 w-full text-base">
          Open App →
        </Link>
      ) : (
        <div className="mb-8">
          <GoogleSignIn />
          <p className="mt-2 text-center text-xs text-white/40">
            Free to play · World Cup 2026
          </p>
        </div>
      )}

      <div className="space-y-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="card flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-soft text-xl">
              {f.icon}
            </div>
            <div>
              <p className="font-semibold">{f.title}</p>
              <p className="text-sm text-white/55">{f.text}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-[11px] text-white/30">
        GoalCast · Unofficial fan game · Not affiliated with FIFA
      </p>
    </main>
  );
}
