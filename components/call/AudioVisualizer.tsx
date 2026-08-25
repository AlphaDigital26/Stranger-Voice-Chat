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

// The signature component — circular waveform visualizer
// Reacts to remote peer's audio amplitude
// UIUX Design Brief §6: CSS transform/opacity only (no layout-triggering)
export default function AudioVisualizer({
  isActive,
  isSpeaking = false,
  amplitude = 0,
  size = "lg",
  className,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [tick, setTick] = useState(0);

  const sizes = { sm: 120, md: 180, lg: 240 };
  const px = sizes[size];

  // Idle gentle pulse: opacity oscillates 0.4–1.0
  // Active: amplitude drives scale 1.0–1.25
  const idleOpacity = isActive
    ? 0.4 + amplitude * 0.6
    : 0.4 + 0.3 * Math.abs(Math.sin(tick * 0.04));

  const scale = isActive && isSpeaking
    ? 1 + amplitude * 0.18
    : 1;

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
    const distFromCenter = Math.abs(i - center) / center; // 0 at center, 1 at edge
    const base = 1 - distFromCenter * 0.5; // taller at center
    if (!isActive) {
      // Idle: gentle cascade
      const wave = Math.sin(tick * 0.06 + i * 0.8) * 0.3 + 0.7;
      return base * wave;
    }
    // Active: amplitude-driven + individual phase
    const phase = Math.sin(tick * 0.12 + i * 1.2) * 0.3;
    return base * (0.3 + amplitude * 0.7 + phase * amplitude);
  });

  return (
    <div
      className={clsx("flex flex-col items-center justify-center gap-6", className)}
      aria-label={isActive ? (isSpeaking ? "Stranger is speaking" : "Connected, listening") : "Connecting..."}
      aria-live="polite"
    >
      {/* Outer glow ring */}
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: px,
          height: px,
          transition: "transform 80ms ease-out, opacity 80ms ease-out",
          transform: `scale(${scale})`,
          opacity: idleOpacity,
        }}
      >
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(124,92,252,0.35) 0%, rgba(124,92,252,0) 70%)",
            transform: `scale(${1 + (isActive ? amplitude * 0.5 : 0)})`,
            transition: "transform 120ms ease-out",
          }}
        />

        {/* Middle ring */}
        <div
          className="absolute rounded-full border-2 border-[#7C5CFC]/30"
          style={{
            width: px * 0.75,
            height: px * 0.75,
          }}
        />

        {/* Inner circle */}
        <div
          className="relative z-10 rounded-full flex items-center justify-center"
          style={{
            width: px * 0.5,
            height: px * 0.5,
            background: "linear-gradient(135deg, #7C5CFC 0%, #FF6B6B 100%)",
            boxShadow: "0 8px 32px rgba(124, 92, 252, 0.4)",
          }}
        >
          {/* Waveform bars inside circle */}
          <div className="flex items-end justify-center gap-[3px]" style={{ height: px * 0.22 }}>
            {barHeights.map((h, i) => (
              <div
                key={i}
                className="rounded-full bg-white"
                style={{
                  width: 3,
                  height: `${Math.max(20, h * 100)}%`,
                  transition: "height 80ms ease-out",
                  opacity: 0.9,
                  boxShadow: "0 0 8px rgba(255, 255, 255, 0.5)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        {!isActive && (
          <p className="text-[14px] text-[#71717A] animate-pulse-slow">Connecting...</p>
        )}
        {isActive && isSpeaking && (
          <p className="text-[12px] font-medium text-[#7C5CFC]">Speaking</p>
        )}
        {isActive && !isSpeaking && (
          <p className="text-[12px] text-[#71717A]">Listening...</p>
        )}
      </div>
    </div>
  );
}
