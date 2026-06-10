"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn, flagEmoji } from "@/lib/utils";

/** Shimmer button as a navigation link. */
export function ShimmerLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative z-0 flex min-h-[48px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-ink-card px-6 font-semibold text-white transition-transform active:scale-[0.98]",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-xl">
        <span className="absolute -inset-y-6 -left-24 w-24 -skew-x-12 bg-gradient-to-r from-transparent via-pitch/60 to-transparent blur-md animate-shimmer-slide" />
      </span>
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-xl transition-colors group-hover:bg-pitch/10" />
      {children}
    </Link>
  );
}

/** Infinite horizontal marquee (pauses on hover). Children are duplicated. */
export function Marquee({
  children,
  reverse,
  className,
  durationSec = 32,
}: {
  children: ReactNode;
  reverse?: boolean;
  className?: string;
  durationSec?: number;
}) {
  return (
    <div className={cn("group w-full overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max gap-3 group-hover:[animation-play-state:paused]",
          reverse ? "animate-marquee-rev" : "animate-marquee",
        )}
        style={{ "--duration": `${durationSec}s` } as React.CSSProperties}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

/** A single nation chip used inside the marquee. */
export function NationChip({ code, name }: { code: string; name: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full border border-ink-line bg-ink-card px-4 py-2">
      <span className="text-2xl leading-none">{flagEmoji(code)}</span>
      <span className="whitespace-nowrap text-sm font-semibold text-white/85">{name}</span>
    </div>
  );
}

/** Shimmer button: a light travels around the perimeter. */
export function ShimmerButton({
  children,
  className,
  type = "button",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "group relative z-0 flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-ink-card px-6 font-semibold text-white transition-transform active:scale-[0.98]",
        className,
      )}
    >
      {/* travelling shimmer */}
      <span className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-xl">
        <span className="absolute -inset-y-6 -left-24 w-24 -skew-x-12 bg-gradient-to-r from-transparent via-pitch/60 to-transparent blur-md animate-shimmer-slide" />
      </span>
      {/* inner glow on hover */}
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-pitch/0 transition-colors group-hover:bg-pitch/10" />
      {children}
    </button>
  );
}

// Seamless honeycomb tile (hero-patterns "Hexagons"), pitch-green lines.
const HEX_SVG =
  "%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cpath fill='%232f80ff' fill-opacity='0.5' fill-rule='evenodd' d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/svg%3E";

/**
 * Honeycomb hexagon-pattern background. `fixed` fills the whole viewport
 * behind content; otherwise it fills the nearest positioned ancestor.
 */
export function HexagonBackground({
  className,
  fixed = false,
}: {
  className?: string;
  fixed?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none",
        fixed ? "fixed inset-0 -z-10 opacity-40" : "absolute inset-0 -z-10 opacity-60",
        className,
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,${HEX_SVG}")`,
        backgroundSize: "60px 105px",
        maskImage: "radial-gradient(120% 90% at 50% 0%, #000 35%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(120% 90% at 50% 0%, #000 35%, transparent 80%)",
      }}
    />
  );
}
