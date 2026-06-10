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

/**
 * Honeycomb hexagon-pattern background. Use `fixed` to fill the whole viewport
 * behind all content, or default (absolute) to fill the nearest positioned
 * ancestor.
 */
export function HexagonBackground({
  className,
  fixed = false,
}: {
  className?: string;
  fixed?: boolean;
}) {
  // A seamless pointy-top hexagon tile.
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none overflow-hidden",
        fixed ? "fixed inset-0 -z-10 opacity-[0.12]" : "absolute inset-0 -z-10 opacity-[0.16]",
        className,
      )}
    >
      <svg width="100%" height="100%">
        <defs>
          <pattern id="hexgrid" width="48" height="83.14" patternUnits="userSpaceOnUse" patternTransform="scale(0.9)">
            <path
              d="M24 0 L48 13.86 L48 41.57 L24 55.43 L0 41.57 L0 13.86 Z
                 M24 55.43 L48 69.28 L48 97 L24 110.86 L0 97 L0 69.28 Z
                 M48 41.57 L72 55.43 L72 83.14 M0 41.57 L-24 55.43 L-24 83.14"
              fill="none"
              stroke="rgba(0,230,118,0.30)"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="hexfade" cx="50%" cy="30%" r="75%">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="hexmask">
            <rect width="100%" height="100%" fill="url(#hexfade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexgrid)" mask="url(#hexmask)" />
      </svg>
    </div>
  );
}
