import Link from "next/link";
import { auth } from "@/lib/auth";
import { Marquee, NationChip, ShimmerLink, HexagonBackground } from "@/components/magic";
import IconCloud from "@/components/IconCloud";
import { WC_NATIONS } from "@/lib/wc-nations";
import { flagEmoji } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Landing() {
  const session = await auth();
  const loggedIn = Boolean(session?.user);
  const primaryHref = loggedIn ? "/schedule" : "/login?mode=signup";
  const codes = WC_NATIONS.map((n) => n.code);

  return (
    <div className="relative w-full overflow-x-hidden">
      <TopNav loggedIn={loggedIn} />

      {/* ===== HERO ===== */}
      <section className="relative mx-auto max-w-6xl px-5 pt-16 text-center sm:pt-24">
        <HexagonBackground className="opacity-[0.14]" />
        <Link
          href="#features"
          className="inline-flex items-center gap-2 rounded-full border border-ink-line bg-ink-card px-4 py-1.5 text-xs font-semibold text-white/70"
        >
          ⚽ FIFA World Cup 2026 · 104 matches
          <span className="text-pitch">See features →</span>
        </Link>

        <h1 className="mx-auto mt-6 max-w-4xl text-balance text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
          Predict every match.
          <br />
          <span className="bg-gradient-to-r from-pitch via-emerald-400 to-pitch bg-clip-text text-transparent">
            Beat the AI. Top your country.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-white/60">
          GoalCast is the World Cup 2026 prediction game. Call the scores, out-think an
          AI pundit, climb global & country leaderboards, and play a daily penalty
          shootout.
        </p>

        <div className="mx-auto mt-8 flex max-w-md flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <div className="w-full sm:w-auto">
            <ShimmerLink href={primaryHref} className="sm:px-8">
              {loggedIn ? "Open App →" : "Get started — it's free"}
            </ShimmerLink>
          </div>
          <Link
            href={loggedIn ? "/leaderboard" : "/login?mode=login"}
            className="btn-ghost w-full sm:w-auto sm:px-8"
          >
            {loggedIn ? "View leaderboard" : "Log in"}
          </Link>
        </div>

        <SocialProof />

        {/* Hero visual: 3D flag cloud */}
        <div className="relative mt-8 flex justify-center">
          <div className="pointer-events-none absolute inset-0 -z-10 mx-auto h-72 w-72 rounded-full bg-pitch/10 blur-3xl" />
          <IconCloud codes={codes} size={300} />
        </div>
      </section>

      {/* ===== NATIONS MARQUEE ===== */}
      <section className="mt-6 border-y border-ink-line bg-ink-card/40 py-6">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-white/35">
          48 nations · one trophy
        </p>
        <Marquee durationSec={40}>
          {WC_NATIONS.map((n) => (
            <NationChip key={n.code} code={n.code} name={n.name} />
          ))}
        </Marquee>
      </section>

      {/* ===== FEATURES (bento) ===== */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <SectionHeading
          eyebrow="Everything inside"
          title="A whole World Cup in your pocket"
          subtitle="Predictions, an AI rival, leaderboards, lineups and a mini-game — all free."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* AI Pundit — wide */}
          <FeatureCard
            className="md:col-span-2"
            icon="🤖"
            title="Beat the AI Pundit"
            text="An AI predicts every single match with a cocky, witty take — and plays against you on the leaderboard. Out-predict it for bragging rights."
          >
            <div className="rounded-xl border border-ink-line bg-ink p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                🤖 The Pundit <span className="tag ml-auto bg-pitch/15 text-pitch">calls it 2–1</span>
              </div>
              <p className="text-sm italic text-white/60">
                “{flagEmoji("BR")} Brazil have too much flair up top. {flagEmoji("AR")} Argentina
                grit it out but fall just short. Book it.”
              </p>
            </div>
          </FeatureCard>

          {/* Penalty */}
          <FeatureCard icon="🥅" title="Penalty shootout" text="Take on an AI keeper that learns your habits. 5 kicks a day.">
            <MiniGoal />
          </FeatureCard>

          {/* Leaderboard */}
          <FeatureCard icon="🏆" title="Global & country ranks" text="Earn points, climb the world table, and carry your nation up the country leaderboard.">
            <MiniLeaderboard />
          </FeatureCard>

          {/* Lineups — wide */}
          <FeatureCard
            className="md:col-span-2"
            icon="📋"
            title="Predict the Starting XI"
            text="Guess the 11 starters before official lineups drop. Nail them for bonus points — locks 90 minutes before kickoff so nobody can copy."
          >
            <div className="flex flex-wrap gap-1.5">
              {["GK", "DEF", "DEF", "MID", "MID", "FWD"].map((p, i) => (
                <span key={i} className="rounded-lg border border-pitch/40 bg-pitch/10 px-2.5 py-1 text-xs font-semibold text-pitch">
                  {p}
                </span>
              ))}
              <span className="rounded-lg border border-ink-line px-2.5 py-1 text-xs text-white/40">+5 more</span>
            </div>
          </FeatureCard>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="border-y border-ink-line bg-ink-card/30 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading eyebrow="How it works" title="Three taps to glory" />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { n: "1", t: "Sign up free", d: "Continue with Google or email in seconds." },
              { n: "2", t: "Predict the scores", d: "Lock in your scoreline before each kickoff." },
              { n: "3", t: "Climb the ranks", d: "Earn points, beat the AI, top your country." },
            ].map((s) => (
              <div key={s.n} className="card">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-pitch text-lg font-black text-black">
                  {s.n}
                </div>
                <p className="text-lg font-bold">{s.t}</p>
                <p className="mt-1 text-sm text-white/55">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["104", "Matches"],
            ["48", "Nations"],
            ["1", "AI rival"],
            ["3pts", "Per exact score"],
          ].map(([v, l]) => (
            <div key={l} className="card text-center">
              <p className="text-4xl font-black text-pitch">{v}</p>
              <p className="mt-1 text-sm text-white/55">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-pitch/30 bg-gradient-to-br from-pitch/15 to-ink-card px-6 py-14 text-center">
          <HexagonBackground className="opacity-[0.12]" />
          <h2 className="text-3xl font-black sm:text-5xl">Ready to out-predict everyone?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/65">
            Join now, make your first prediction, and start climbing before the
            tournament kicks off.
          </p>
          <div className="mx-auto mt-7 max-w-xs">
            <ShimmerLink href={primaryHref}>{loggedIn ? "Open App →" : "Get started — free"}</ShimmerLink>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-ink-line py-8 text-center text-[11px] text-white/30">
        <p className="mb-1 text-sm font-black text-white/70">
          Goal<span className="text-pitch">Cast</span>
        </p>
        GoalCast · Unofficial fan game · Not affiliated with FIFA
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
function TopNav({ loggedIn }: { loggedIn: boolean }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-ink-line bg-ink/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pitch text-base">⚽</span>
          <span className="text-lg font-black">
            Goal<span className="text-pitch">Cast</span>
          </span>
        </Link>
        <div className="hidden items-center gap-6 text-sm text-white/60 sm:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <Link href="/leaderboard" className="hover:text-white">Leaderboard</Link>
        </div>
        <div className="flex items-center gap-2">
          {loggedIn ? (
            <Link href="/schedule" className="btn-primary px-4 text-sm">Open App</Link>
          ) : (
            <>
              <Link href="/login?mode=login" className="hidden px-3 text-sm font-semibold text-white/70 hover:text-white sm:block">
                Log in
              </Link>
              <Link href="/login?mode=signup" className="btn-primary px-4 text-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function SocialProof() {
  const avatars = ["BR", "AR", "FR", "ES", "GB"];
  return (
    <div className="mt-7 flex items-center justify-center gap-3">
      <div className="flex -space-x-2">
        {avatars.map((c) => (
          <span
            key={c}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-ink-soft text-sm"
          >
            {flagEmoji(c)}
          </span>
        ))}
      </div>
      <div className="text-left text-xs">
        <div className="text-pitch">★★★★★</div>
        <div className="text-white/50">Predictors from every nation</div>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-pitch">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-white/55">{subtitle}</p>}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
  className,
  children,
}: {
  icon: string;
  title: string;
  text: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`card flex flex-col gap-4 transition-colors hover:border-pitch/30 ${className ?? ""}`}>
      <div>
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-ink-soft text-xl">{icon}</div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-1 text-sm text-white/55">{text}</p>
      </div>
      {children && <div className="mt-auto">{children}</div>}
    </div>
  );
}

function MiniGoal() {
  return (
    <div className="grid aspect-[3/2] grid-cols-3 grid-rows-2 gap-1 rounded-lg border-2 border-white/60 p-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`rounded ${i === 2 ? "bg-pitch/30" : "bg-white/5"}`}>
          {i === 2 && <div className="flex h-full items-center justify-center text-sm">⚽</div>}
          {i === 5 && <div className="flex h-full items-center justify-center text-sm">🧤</div>}
        </div>
      ))}
    </div>
  );
}

function MiniLeaderboard() {
  const rows = [
    { c: "BR", n: "You", p: 27, me: true },
    { c: "GB", n: "The Pundit", p: 24, bot: true },
    { c: "FR", n: "Léa", p: 21 },
  ];
  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${
            r.me ? "border-pitch/50 bg-pitch/5" : "border-ink-line bg-ink"
          }`}
        >
          <span className="w-4 text-center font-bold text-white/40">{i + 1}</span>
          <span>{flagEmoji(r.c)}</span>
          <span className="flex-1 font-semibold">
            {r.n} {r.bot && "🤖"}
          </span>
          <span className="font-black text-pitch">{r.p}</span>
        </div>
      ))}
    </div>
  );
}
