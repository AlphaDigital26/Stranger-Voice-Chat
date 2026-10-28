"use client";

import { useEffect, useState } from "react";
import HandTimer from "@/components/ui/HandTimer";

const PITCH_SECONDS = 60;

function format(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Landing-page demo of the 60-second pitch clock: counts down and loops.
// Stays still at 0:42 for people who prefer reduced motion.
export default function PitchCountdown({ size = 140 }: { size?: number }) {
  const [left, setLeft] = useState(42);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setLeft(s => (s <= 0 ? PITCH_SECONDS : s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  return <HandTimer value={format(left)} progress={left / PITCH_SECONDS} size={size} />;
}
