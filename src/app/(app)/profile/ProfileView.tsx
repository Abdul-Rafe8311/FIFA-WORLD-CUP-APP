"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar, Avatar } from "@/components/ui";
import { SignOutButton } from "@/components/AuthButtons";
import { flagEmoji } from "@/lib/utils";
import { COUNTRIES, COUNTRY_NAME } from "@/lib/countries";
import type { UserStats } from "@/lib/queries";

export default function ProfileView({
  user,
  stats,
}: {
  user: { name: string | null; email: string | null; image: string | null; country: string | null };
  stats: UserStats;
}) {
  const router = useRouter();
  const [country, setCountry] = useState(user.country ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveCountry(next: string) {
    setCountry(next);
    if (!next) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: next }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  const cells: { label: string; value: string }[] = [
    { label: "Total points", value: String(stats.totalPoints) },
    { label: "Global rank", value: stats.globalRank ? `#${stats.globalRank}` : "—" },
    { label: "Exact scores", value: String(stats.exactCount) },
    { label: "Correct results", value: String(stats.correctCount) },
    { label: "Accuracy", value: `${stats.accuracy}%` },
    { label: "Penalty best", value: String(stats.penaltyBest) },
  ];

  return (
    <>
      <TopBar title="Profile" />
      <div className="space-y-5 p-4">
        <section className="card flex items-center gap-4">
          <Avatar src={user.image} name={user.name} size={56} />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{user.name ?? "Player"}</p>
            <p className="truncate text-sm text-white/45">{user.email}</p>
            {country && (
              <p className="mt-0.5 text-sm">
                {flagEmoji(country)} {COUNTRY_NAME[country] ?? country}
              </p>
            )}
          </div>
        </section>

        <section className="card">
          <label className="mb-2 block text-sm font-bold">
            Your country {saving ? <span className="text-white/40">· saving…</span> : saved ? <span className="text-pitch">· saved ✓</span> : null}
          </label>
          <p className="mb-2 text-[11px] text-white/45">Feeds the country leaderboard.</p>
          <div className="relative">
            <select
              value={country}
              onChange={(e) => saveCountry(e.target.value)}
              className="w-full appearance-none rounded-xl border border-ink-line bg-ink px-3 py-2.5 text-sm outline-none focus:border-pitch"
            >
              <option value="">Select a country…</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
              ▾
            </span>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cells.map((c) => (
            <div key={c.label} className="card text-center">
              <p className="text-2xl font-black text-pitch">{c.value}</p>
              <p className="mt-1 text-[11px] text-white/50">{c.label}</p>
            </div>
          ))}
        </section>

        <SignOutButton />

        <p className="text-center text-[11px] text-white/30">
          Tip: add GoalCast to your home screen for the full app experience.
        </p>
      </div>
    </>
  );
}
