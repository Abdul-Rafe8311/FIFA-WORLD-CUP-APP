"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TopBar } from "@/components/ui";

type LeagueRow = {
  id: string;
  name: string;
  inviteCode: string;
  members: number;
  isOwner: boolean;
};

export default function LeaguesView({ leagues }: { leagues: LeagueRow[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function create() {
    if (name.trim().length < 2) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed");
      router.push(`/leagues/${j.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setBusy(false);
    }
  }

  async function join() {
    if (code.trim().length !== 6) {
      setError("Enter a 6-character code");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/leagues/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed");
      router.push(`/leagues/${j.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setBusy(false);
    }
  }

  async function copyInvite(c: string) {
    const url = `${window.location.origin}/leagues/join/${c}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
    setCopied(c);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <>
      <TopBar title="Leagues" />
      <div className="space-y-5 p-4">
        <section className="card">
          <h2 className="mb-2 text-sm font-bold">Create a league</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="League name"
            maxLength={40}
            className="w-full rounded-xl border border-ink-line bg-ink px-3 py-2.5 text-sm outline-none focus:border-pitch"
          />
          <button onClick={create} disabled={busy} className="btn-primary mt-3 w-full">
            Create league
          </button>
        </section>

        <section className="card">
          <h2 className="mb-2 text-sm font-bold">Join with a code</h2>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="w-full rounded-xl border border-ink-line bg-ink px-3 py-2.5 text-center text-lg font-bold tracking-[0.3em] outline-none focus:border-pitch"
          />
          <button onClick={join} disabled={busy} className="btn-ghost mt-3 w-full">
            Join league
          </button>
        </section>

        {error && <p className="text-center text-sm text-red-400">{error}</p>}

        <section>
          <h2 className="mb-2 text-sm font-bold text-white/70">My leagues</h2>
          {leagues.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/40">
              No leagues yet — create one above.
            </p>
          ) : (
            <ul className="space-y-2">
              {leagues.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center gap-3 rounded-xl border border-ink-line bg-ink-card px-4 py-3"
                >
                  <Link href={`/leagues/${l.id}`} className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{l.name}</p>
                    <p className="text-[11px] text-white/45">
                      {l.members} members · code {l.inviteCode}
                    </p>
                  </Link>
                  <button
                    onClick={() => copyInvite(l.inviteCode)}
                    className="rounded-lg bg-ink-soft px-2.5 py-1.5 text-xs font-semibold"
                  >
                    {copied === l.inviteCode ? "Copied!" : "Invite"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
