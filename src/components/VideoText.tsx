"use client";

import { useEffect, useState } from "react";

/**
 * Renders large text with a looping video showing through the letters.
 * The video is clipped to the text shapes via an SVG <clipPath>.
 * Provide `src` (an mp4 URL or /public path). If the video fails to load,
 * a green gradient fallback fills the text instead.
 */
export default function VideoText({
  text,
  src,
  className = "",
  height = 120,
}: {
  text: string;
  src: string;
  className?: string;
  height?: number;
}) {
  const [failed, setFailed] = useState(false);
  // unique id so multiple instances don't clash
  const [id] = useState(() => "vt-" + Math.random().toString(36).slice(2, 8));
  const width = Math.max(300, text.length * (height * 0.62));

  // probe the video; fall back to gradient on error
  useEffect(() => {
    let active = true;
    const v = document.createElement("video");
    v.onerror = () => active && setFailed(true);
    v.src = src;
    return () => {
      active = false;
    };
  }, [src]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full ${className}`}
      role="img"
      aria-label={text}
    >
      <defs>
        <clipPath id={id}>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={height * 0.82}
            fontWeight={900}
            fontFamily="system-ui, sans-serif"
            letterSpacing="-2"
          >
            {text}
          </text>
        </clipPath>
        {failed && (
          <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00e676" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        )}
      </defs>

      {failed ? (
        <rect width={width} height={height} clipPath={`url(#${id})`} fill={`url(#${id}-grad)`} />
      ) : (
        <foreignObject x="0" y="0" width={width} height={height} clipPath={`url(#${id})`}>
          <video
            autoPlay
            muted
            loop
            playsInline
            onError={() => setFailed(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            src={src}
          />
        </foreignObject>
      )}
    </svg>
  );
}
