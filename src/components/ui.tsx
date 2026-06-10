"use client";

import { useEffect, useState } from "react";
import { initials } from "@/lib/utils";

export function TopBar({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-line bg-ink/90 px-4 py-3 backdrop-blur">
      <h1 className="text-lg font-extrabold tracking-tight">{title}</h1>
      {right}
    </header>
  );
}

export function Avatar({
  src,
  name,
  size = 36,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
}) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name ?? "avatar"}
        width={size}
        height={size}
        onError={() => setErr(true)}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-ink-soft text-xs font-bold text-pitch"
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </div>
  );
}

/** Renders a UTC instant in the viewer's local timezone. */
export function LocalTime({
  iso,
  mode = "time",
}: {
  iso: string;
  mode?: "time" | "datetime" | "day";
}) {
  const [text, setText] = useState("");
  useEffect(() => {
    const d = new Date(iso);
    const opts: Intl.DateTimeFormatOptions =
      mode === "time"
        ? { hour: "2-digit", minute: "2-digit" }
        : mode === "day"
          ? { weekday: "short", day: "numeric", month: "short" }
          : { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" };
    setText(new Intl.DateTimeFormat(undefined, opts).format(d));
  }, [iso, mode]);
  return <span suppressHydrationWarning>{text || "…"}</span>;
}

/** Live countdown to a UTC kickoff. */
export function Countdown({ iso }: { iso: string }) {
  const [left, setLeft] = useState<number>(() => new Date(iso).getTime() - Date.now());
  useEffect(() => {
    const t = setInterval(() => setLeft(new Date(iso).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [iso]);

  if (left <= 0) return <span className="text-pitch">Kicked off</span>;
  const s = Math.floor(left / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {d > 0 ? `${d}d ` : ""}
      {pad(h)}:{pad(m)}:{pad(sec)}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}
