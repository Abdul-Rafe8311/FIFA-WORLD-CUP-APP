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

/** Subtle hexagon-pattern background layer (absolute, behind content). */
export function HexagonBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-[0.18]", className)}
    >
      <svg width="100%" height="100%">
        <defs>
          <pattern id="hexes" width="56" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
            <path
              d="M28 0 L56 16 L56 48 M28 0 L0 16 L0 48 M0 16 L28 32 L56 16 M28 32 L28 48"
              fill="none"
              stroke="rgba(0,230,118,0.35)"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="hexfade" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="hexmask">
            <rect width="100%" height="100%" fill="url(#hexfade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexes)" mask="url(#hexmask)" />
      </svg>
    </div>
  );
}
