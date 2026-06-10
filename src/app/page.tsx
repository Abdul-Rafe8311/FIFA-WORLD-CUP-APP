import Link from "next/link";
import { auth } from "@/lib/auth";
import { GoogleSignIn } from "@/components/AuthButtons";

export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: "🎯", title: "Predict & climb", text: "Call every scoreline and rise up the leaderboards." },
  { icon: "🤖", title: "Beat the AI Pundit", text: "An AI predicts every match and plays against you." },
  { icon: "🌍", title: "Country vs Country", text: "Your points feed your nation's global ranking." },
  { icon: "🥅", title: "Penalty shootout", text: "Take on an AI keeper in a daily mini-game." },
  { icon: "📋", title: "Predict the XI", text: "Guess the starting eleven before lineups drop." },
  { icon: "✅", title: "Shareable cards", text: "Brag with 'I called it' result cards." },
];

export default async function Landing() {
  const session = await auth();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:pt-16">
      {/* Hero */}
      <section className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-pitch text-4xl shadow-xl shadow-pitch/25">
          ⚽
        </div>
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
          Goal<span className="text-pitch">Cast</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-balance text-lg text-white/65">
          Predict every World Cup match. Beat the AI. Top your country.
        </p>

        <div className="mx-auto mt-8 max-w-sm">
          {session?.user ? (
            <Link href="/schedule" className="btn-primary w-full text-base">
              Open App →
            </Link>
          ) : (
            <>
              <GoogleSignIn />
              <p className="mt-2 text-center text-xs text-white/40">
                Free to play · World Cup 2026
              </p>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto mt-12 max-w-5xl sm:mt-16">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="card flex items-start gap-3 transition-colors hover:border-pitch/30"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-soft text-xl">
                {f.icon}
              </div>
              <div>
                <p className="font-semibold">{f.title}</p>
                <p className="text-sm text-white/55">{f.text}</p>
              </div>
            </div>
          ))}
          {/* Final CTA card fills the grid nicely on desktop */}
          <div className="card flex flex-col items-start justify-center gap-2 border-pitch/30 bg-pitch/5 sm:col-span-2 lg:col-span-1">
            <p className="text-lg font-bold">Ready to play?</p>
            <p className="text-sm text-white/60">Sign in and lock in your first prediction.</p>
            {session?.user ? (
              <Link href="/schedule" className="btn-primary mt-1 w-full">
                Open App →
              </Link>
            ) : (
              <div className="mt-1 w-full">
                <GoogleSignIn />
              </div>
            )}
          </div>
        </div>
      </section>

      <p className="mt-12 text-center text-[11px] text-white/30">
        GoalCast · Unofficial fan game · Not affiliated with FIFA
      </p>
    </main>
  );
}
