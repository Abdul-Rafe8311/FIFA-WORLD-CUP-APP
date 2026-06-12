"use client";

import { useRef, useState } from "react";

/**
 * Interactive grid of cells. Hovering a cell lights it up; clicking sends a
 * ripple outward from that cell (cells light up in expanding rings, fading by
 * distance). Sits behind hero content as a background layer.
 */
export default function BackgroundRipple({
  rows = 8,
  cols = 27,
  cellSize = 56,
  className = "",
}: {
  rows?: number;
  cols?: number;
  cellSize?: number;
  className?: string;
}) {
  const [ripple, setRipple] = useState<{ r: number; c: number; key: number } | null>(null);
  const keyRef = useRef(0);

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dist =
        ripple != null ? Math.abs(ripple.r - r) + Math.abs(ripple.c - c) : 0;
      cells.push(
        <div
          key={`${r}-${c}`}
          onClick={() => {
            keyRef.current += 1;
            setRipple({ r, c, key: keyRef.current });
          }}
          className="group/cell relative border-r border-t border-ink-line/60 transition-colors duration-500 hover:bg-pitch/20"
          style={
            ripple
              ? {
                  // ripple wave: each ring lights slightly later and fades out
                  backgroundColor: "rgba(47,128,255,0.18)",
                  animation: `ripple-fade 600ms ease-out ${dist * 55}ms forwards`,
                }
              : undefined
          }
        />
      );
    }
  }

  return (
    <div
      aria-hidden
      className={`pointer-events-auto absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      <div
        key={ripple?.key ?? "init"}
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {cells}
      </div>
      {/* radial fade so the grid melts into the page edges */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,14,13,0.55)_60%,#0a0e0d_100%)]" />
    </div>
  );
}
