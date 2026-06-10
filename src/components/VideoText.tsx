"use client";

import { useEffect, useState } from "react";

/**
 * Large text with a looping video showing through the letters (clipped to the
 * glyphs via an SVG clipPath). If no working video is provided, it renders a
 * clean green-gradient wordmark instead.
 */
export default function VideoText({
  text,
  src,
  className = "",
  height = 120,
}: {
  text: string;
  src?: string;
  className?: string;
  height?: number;
}) {
  const [ok, setOk] = useState(false);
  const [id] = useState(() => "vt-" + Math.random().toString(36).slice(2, 8));

  // Only switch to video mode once the file actually loads.
  useEffect(() => {
    if (!src) return;
    let active = true;
    const v = document.createElement("video");
    v.onloadeddata = () => active && setOk(true);
    v.onerror = () => active && setOk(false);
    v.src = src;
    v.load();
    return () => {
      active = false;
    };
  }, [src]);

  // Gradient wordmark (default / fallback).
  if (!ok) {
    return (
      <h1
        className={`bg-gradient-to-br from-white via-pitch to-emerald-400 bg-clip-text text-center font-black leading-none tracking-tight text-transparent ${className}`}
        style={{ fontSize: height }}
      >
        {text}
      </h1>
    );
  }

  // Video-through-text.
  const width = Math.max(320, text.length * height * 0.6);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`w-full ${className}`} role="img" aria-label={text}>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={height * 0.8}
            fontWeight={900}
            fontFamily="system-ui, sans-serif"
          >
            {text}
          </text>
        </clipPath>
      </defs>
      <foreignObject x={0} y={0} width={width} height={height} clipPath={`url(#${id})`}>
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          src={src}
        />
      </foreignObject>
    </svg>
  );
}
