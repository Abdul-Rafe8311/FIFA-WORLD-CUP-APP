"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "What is GoalCast?",
    a: "A free FIFA World Cup 2026 prediction game. Call the scoreline of every match, beat an AI pundit, climb global and country leaderboards, predict starting line-ups, and play a daily penalty shootout.",
  },
  {
    q: "How do points work?",
    a: "An exact scoreline is 3 points, the correct result (win/draw/loss) is 1 point, otherwise 0. Nailing a full starting XI earns bonus points too.",
  },
  {
    q: "Is it really free?",
    a: "Yes — completely free. Sign in with Google or an email, and start predicting.",
  },
  {
    q: "What is the AI Pundit?",
    a: "An AI that predicts every single match with a confident, witty take — and plays against you on the leaderboard. Out-predict it for bragging rights.",
  },
  {
    q: "When do my predictions lock?",
    a: "Score predictions lock exactly at kickoff (editable until then). Starting-XI predictions lock 90 minutes before kickoff, before official line-ups drop.",
  },
  {
    q: "Can I play on my phone?",
    a: "Absolutely. GoalCast is a mobile-first app you can install on your home screen, and times automatically show in your timezone.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <div className="grid gap-10 md:grid-cols-2">
        <h2 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
          Frequently
          <br />
          asked
          <br />
          <span className="text-pitch">questions</span>
        </h2>

        <div>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-ink-line">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-3 py-4 text-left transition-colors hover:text-white"
                >
                  <span
                    className={`text-xl font-bold text-pitch transition-transform ${isOpen ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                  <span className="font-semibold">{f.q}</span>
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"
                  }`}
                >
                  <p className="overflow-hidden pl-8 text-sm text-white/55">{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
