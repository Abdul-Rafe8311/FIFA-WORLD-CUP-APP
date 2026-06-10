import { flagEmoji } from "@/lib/utils";

/** Bento feature section with animated skeleton mockups + captions. */
export default function FeatureSkeletons() {
  const cells = [
    {
      title: "Predict every scoreline",
      desc: "Two taps to lock in a result. Editable until kickoff, then it's set in stone.",
      mock: <PredictMock />,
    },
    {
      title: "Beat the AI Pundit",
      desc: "An AI calls every match with a cocky take — and races you on the leaderboard.",
      mock: <PunditMock />,
    },
    {
      title: "Climb global & country ranks",
      desc: "Earn points, rise up the world table, and carry your nation up the rankings.",
      mock: <LeaderboardMock />,
    },
    {
      title: "Daily penalty shootout",
      desc: "Take on an AI keeper that learns your habits. Five kicks, every day.",
      mock: <PenaltyMock />,
    },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-ink-line bg-ink-card/30">
      <div className="grid grid-cols-1 divide-y divide-ink-line md:grid-cols-2 md:divide-y-0 xl:grid-cols-4">
        {cells.map((c, i) => (
          <div
            key={c.title}
            className={`group flex flex-col p-6 transition-colors hover:bg-white/[0.02] ${
              i > 0 ? "md:border-l md:border-ink-line" : ""
            } ${i === 2 ? "md:border-t md:border-ink-line xl:border-t-0" : ""} ${
              i === 3 ? "md:border-t md:border-ink-line xl:border-t-0" : ""
            }`}
          >
            <div className="flex h-44 items-center justify-center overflow-hidden">{c.mock}</div>
            <h3 className="mt-5 font-bold">{c.title}</h3>
            <p className="mt-1 text-sm text-white/55">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar({ w, c = "bg-white/10" }: { w: string; c?: string }) {
  return <div className={`h-2 rounded-full ${c}`} style={{ width: w }} />;
}

function PredictMock() {
  return (
    <div className="w-full max-w-[220px] animate-float rounded-2xl border border-ink-line bg-ink p-3 shadow-xl">
      <div className="mb-2 flex justify-between text-[10px] text-white/35">
        <span>Group C</span>
        <span className="text-pitch">21:00</span>
      </div>
      {[
        { f: "BR", n: "Brazil", s: 2 },
        { f: "AR", n: "Argentina", s: 1 },
      ].map((r) => (
        <div key={r.n} className="mb-1.5 flex items-center gap-2">
          <span className="text-lg">{flagEmoji(r.f)}</span>
          <span className="flex-1 text-xs font-semibold">{r.n}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pitch text-sm font-black text-black">
            {r.s}
          </span>
        </div>
      ))}
      <div className="mt-2 rounded-lg bg-pitch py-1.5 text-center text-[11px] font-bold text-black">
        Saved ✓
      </div>
    </div>
  );
}

function PunditMock() {
  return (
    <div className="flex w-full max-w-[230px] flex-col gap-2">
      <Bubble side="left">🤖 I call it <b>2–1</b> Brazil. Book it.</Bubble>
      <Bubble side="right">I say 1–1.</Bubble>
      <Bubble side="left">Bold. Wrong, but bold.</Bubble>
    </div>
  );
}

function Bubble({ side, children }: { side: "left" | "right"; children: React.ReactNode }) {
  return (
    <div className={side === "right" ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-xs ${
          side === "right" ? "bg-pitch text-black" : "border border-ink-line bg-ink text-white/80"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function LeaderboardMock() {
  const rows = [
    { c: "BR", w: "92%", me: true },
    { c: "GB", w: "78%", bot: true },
    { c: "FR", w: "64%" },
    { c: "ES", w: "52%" },
  ];
  return (
    <div className="w-full max-w-[230px] space-y-2">
      {rows.map((r, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${
            r.me ? "border-pitch/50 bg-pitch/10" : "border-ink-line bg-ink"
          }`}
        >
          <span className="w-3 text-center text-[10px] font-bold text-white/40">{i + 1}</span>
          <span>{flagEmoji(r.c)}</span>
          <div className="flex-1">
            <Bar w={r.w} c={r.me ? "bg-pitch" : "bg-white/15"} />
          </div>
          {r.bot && <span className="text-[10px]">🤖</span>}
        </div>
      ))}
    </div>
  );
}

function PenaltyMock() {
  return (
    <div className="relative grid aspect-[3/2] w-full max-w-[200px] grid-cols-3 grid-rows-2 gap-1 rounded-lg border-[3px] border-white/60 p-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="relative rounded bg-white/5">
          {i === 5 && <span className="absolute inset-0 flex items-center justify-center text-base">🧤</span>}
        </div>
      ))}
      <span className="absolute bottom-2 left-2 animate-ball-kick text-lg">⚽</span>
    </div>
  );
}
