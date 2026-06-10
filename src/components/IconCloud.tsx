"use client";

import { useEffect, useRef } from "react";
import { flagEmoji } from "@/lib/utils";

/** Interactive 3D sphere of flag emojis. Auto-rotates; drag to spin. */
export default function IconCloud({
  codes,
  size = 320,
}: {
  codes: string[];
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Fibonacci sphere distribution.
    const n = codes.length;
    const points = codes.map((code, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      return {
        code,
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
      };
    });

    const R = size * 0.4;
    const cx = size / 2;
    const cy = size / 2;

    let rotX = 0.2;
    let rotY = 0;
    let velX = 0;
    let velY = 0.003;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let raf = 0;

    function onDown(e: PointerEvent) {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    }
    function onMove(e: PointerEvent) {
      if (!dragging) return;
      velY = (e.clientX - lastX) * 0.0008;
      velX = -(e.clientY - lastY) * 0.0008;
      lastX = e.clientX;
      lastY = e.clientY;
    }
    function onUp() {
      dragging = false;
    }

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    function frame() {
      if (!ctx) return;
      if (!dragging) {
        velY += (0.003 - velY) * 0.02; // ease back to gentle auto-spin
        velX += (0 - velX) * 0.05;
      }
      rotY += velY;
      rotX += velX;

      ctx.clearRect(0, 0, size, size);

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const projected = points.map((p) => {
        // rotate Y then X
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        return { code: p.code, x: x1, y: y2, z: z2 };
      });

      projected.sort((a, b) => a.z - b.z); // far first

      for (const p of projected) {
        const scale = (p.z + 1.6) / 2.6; // 0.23..1
        const fontSize = 14 + scale * 18;
        ctx.font = `${fontSize}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
        ctx.globalAlpha = 0.35 + scale * 0.65;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(flagEmoji(p.code), cx + p.x * R, cy + p.y * R);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [codes, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, touchAction: "none", cursor: "grab" }}
      className="mx-auto"
    />
  );
}
