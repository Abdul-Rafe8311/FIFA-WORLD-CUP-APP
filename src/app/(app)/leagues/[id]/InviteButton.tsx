"use client";

import { useState } from "react";

export default function InviteButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/leagues/join/${code}`;
    const data = { title: "Join my GoalCast league", text: `Join with code ${code}`, url };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button onClick={share} className="btn-primary px-4 text-sm">
      {copied ? "Copied!" : "Invite"}
    </button>
  );
}
