"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

interface AudioVisualizerProps {
  isActive: boolean;       // true = call in progress
  isSpeaking?: boolean;    // remote peer speaking
  amplitude?: number;      // 0–1 amplitude level
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Whiteboard version of the signature visualizer: a hand-drawn marker circle
// with marker bars inside that follow the remote peer's volume.
// CSS transform/opacity only (no layout-triggering properties).
export default function AudioVisualizer({
  isActive,
  isSpeaking = false,
  amplitude = 0,
  size = "lg",
  className,
}: AudioVisualizerProps) {
  const animRef = useRef<number>(0);
  const [tick, setTick] = useState(0);

  const sizes = { sm: 140, md: 190, lg: 230 };
  const px = sizes[size];

  // The circle swells slightly while the stranger talks
  const scale = isActive && isSpeaking ? 1 + amplitude * 0.12 : 1;

  useEffect(() => {
    let frame = 0;
    const loop = () => {
      frame++;
      setTick(frame);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const barCount = 7;
  const barHeights = Array.from({ length: barCount }, (_, i) => {
    const center = (barCount - 1) / 2;
    const base = 1 - (Math.abs(i - center) / center) * 0.5; // taller at center
    if (!isActive) {
      // Idle: gentle cascade
      return base * (Math.sin(tick * 0.06 + i * 0.8) * 0.3 + 0.7) * 0.6;
    }
    const phase = Math.sin(tick * 0.12 + i * 1.2) * 0.3;
    return base * (0.25 + amplitude * 0.75 + phase * amplitude);
  });

  return (
    <div
      className={clsx("relative flex items-center justify-center", className)}
      style={{ width: px, height: px }}
      aria-label={isActive ? (isSpeaking ? "Stranger is speaking" : "Connected, listening") : "Connecting"}
      role="img"
    >
      <svg
        viewBox="0 0 140 140"
        className="absolute inset-0 w-full h-full"
        style={{ transform: `scale(${scale})`, transition: "transform 100ms ease-out" }}
        aria-hidden="true"
      >
        <path
          d="M70 12 C 110 10, 132 40, 128 74 C 124 110, 96 130, 66 128 C 32 126, 10 100, 12 68 C 14 38, 36 14, 74 16"
          fill="none"
          className={isActive ? "stroke-marker" : "stroke-line"}
          strokeWidth={isSpeaking ? 6 : 4.5}
          strokeLinecap="round"
        />
      </svg>

      {/* Marker bars */}
      <div className="relative flex items-center justify-center gap-[6px]" style={{ height: px * 0.32 }} aria-hidden="true">
        {barHeights.map((h, i) => (
          <span
            key={i}
            className={clsx("w-[6px] rounded-full", isActive ? "bg-primary" : "bg-muted/50")}
            style={{ height: `${Math.max(14, Math.min(100, h * 100))}%`, transition: "height 80ms ease-out" }}
          />
        ))}
      </div>
    </div>
  );
}
