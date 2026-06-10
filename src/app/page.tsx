import Link from "next/link";
import { auth } from "@/lib/auth";
import { Marquee, NationChip, ShimmerLink, HexagonBackground } from "@/components/magic";
import IconCloud from "@/components/IconCloud";
import { WC_NATIONS } from "@/lib/wc-nations";

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
  const codes = WC_NATIONS.map((n) => n.code);

  return (
    <main className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:pt-14">
      {/* Hero */}
      <section className="relative mx-auto max-w-3xl text-center">
        <HexagonBackground />
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-pitch text-4xl shadow-xl shadow-pitch/25">
          ⚽
        </div>
        <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl">
          Goal<span className="bg-gradient-to-r from-pitch to-emerald-400 bg-clip-text text-transparent">Cast</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-balance text-lg text-white/65">
          Predict every World Cup match. Beat the AI. Top your country.
        </p>

        <div className="mx-auto mt-8 max-w-sm space-y-3">
          {session?.user ? (
            <ShimmerLink href="/schedule">Open App →</ShimmerLink>
          ) : (
            <>
              <ShimmerLink href="/login?mode=signup">Sign Up — it&apos;s free</ShimmerLink>
              <Link href="/login?mode=login" className="btn-ghost w-full">
                Log In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Icon cloud of nations */}
      <section className="mt-10 flex flex-col items-center">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
          48 nations · one trophy
        </p>
        <IconCloud codes={codes} size={300} />
      </section>

      {/* Marquee of nations */}
      <section className="mt-4 space-y-3">
        <Marquee durationSec={36}>
          {WC_NATIONS.slice(0, 18).map((n) => (
            <NationChip key={n.code} code={n.code} name={n.name} />
          ))}
        </Marquee>
        <Marquee durationSec={42} reverse>
          {WC_NATIONS.slice(18).map((n) => (
            <NationChip key={n.code} code={n.code} name={n.name} />
          ))}
        </Marquee>
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
          <div className="card flex flex-col items-start justify-center gap-2 border-pitch/30 bg-pitch/5 sm:col-span-2 lg:col-span-1">
            <p className="text-lg font-bold">Ready to play?</p>
            <p className="text-sm text-white/60">Sign in and lock in your first prediction.</p>
            {session?.user ? (
              <Link href="/schedule" className="btn-primary mt-1 w-full">
                Open App →
              </Link>
            ) : (
              <Link href="/login?mode=signup" className="btn-primary mt-1 w-full">
                Get started
              </Link>
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
