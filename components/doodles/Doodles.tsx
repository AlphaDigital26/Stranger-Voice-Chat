import { clsx } from "clsx";

// Hand-drawn marker doodles (Direction F). Stroke uses currentColor, so colour them with text-* classes.
// Every stroke has pathLength={1} so CSS can "draw" it:
//   draw   → draws once on page load   (.doodle-draw in globals.css)
//   scroll → draws as it scrolls in    (.doodle-scroll, browsers with scroll-driven animations)
// Without either, or with reduced motion, the doodle is simply shown.

interface DoodleProps {
  size?: number;
  className?: string;
  draw?: boolean;
  scroll?: boolean;
  /** Accessible name. Omit for decorative doodles (they get aria-hidden). */
  label?: string;
  style?: React.CSSProperties;
}

function Svg({
  size = 48,
  className,
  draw,
  scroll,
  label,
  style,
  viewBox = "0 0 48 48",
  strokeWidth = 2.5,
  children,
}: DoodleProps & { viewBox?: string; strokeWidth?: number; children: React.ReactNode }) {
  // Keep the viewBox's aspect ratio: `size` is the width
  const [, , vw, vh] = viewBox.split(" ").map(Number);
  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={Math.round((size * vh) / vw)}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx("shrink-0", draw && "doodle-draw", scroll && "doodle-scroll", className)}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </svg>
  );
}

export function MicDoodle(p: DoodleProps) {
  return (
    <Svg {...p}>
      <rect x="17" y="6" width="14" height="24" rx="7" pathLength={1} />
      <path d="M11 22c0 7.5 5.8 13 13 13s13-5.5 13-13" pathLength={1} />
      <path d="M24 35v7M17 42.5h14" pathLength={1} />
    </Svg>
  );
}

export function BulbDoodle(p: DoodleProps) {
  return (
    <Svg {...p}>
      <path d="M24 8c-7.7 0-13 5.6-13 12.4 0 4.6 2.4 7.6 5 10 1.4 1.3 2 3 2 5V37h12v-1.6c0-2 .7-3.7 2-5 2.6-2.4 5-5.4 5-10C37 13.6 31.7 8 24 8z" pathLength={1} />
      <path d="M19.5 41.5h9M21.5 45h5" pathLength={1} />
      <path d="M24 2.5v1.5M5 20H3.5M44.5 20H43M9.5 7l1.3 1.3M38.5 7l-1.3 1.3" pathLength={1} />
    </Svg>
  );
}

export function ChatDoodle(p: DoodleProps) {
  return (
    <Svg {...p}>
      <path d="M6 8h24a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H15l-7 6v-6H6a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3z" pathLength={1} />
      <path d="M37 17h5a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-2v6l-6-6H24a3 3 0 0 1-3-3v-2" pathLength={1} />
    </Svg>
  );
}

export function RocketDoodle(p: DoodleProps) {
  return (
    <Svg {...p}>
      <path d="M24 4c7 5 10 13 8 24H16C14 17 17 9 24 4z" pathLength={1} />
      <circle cx="24" cy="16" r="3.5" pathLength={1} />
      <path d="M16.5 22L10 30.5l6.5-1M31.5 22l6.5 8.5-6.5-1" pathLength={1} />
      <path d="M20 32c0 5 2 8 4 11 2-3 4-6 4-11" pathLength={1} />
    </Svg>
  );
}

export function PeopleDoodle(p: DoodleProps) {
  return (
    <Svg {...p}>
      <circle cx="17" cy="16" r="6" pathLength={1} />
      <path d="M5 41c0-7 5.4-12.5 12-12.5S29 34 29 41" pathLength={1} />
      <circle cx="33" cy="18" r="5" pathLength={1} />
      <path d="M31 28.8c.7-.2 1.4-.3 2-.3 5.5 0 10 4.4 10 10.5" pathLength={1} />
    </Svg>
  );
}

export function MegaphoneDoodle(p: DoodleProps) {
  return (
    <Svg {...p}>
      <path d="M7 19v10h7l18 9V10L14 19H7z" pathLength={1} />
      <path d="M14 29l3 10h5l-2.5-8" pathLength={1} />
      <path d="M38 18c2 1.5 3 3.6 3 6s-1 4.5-3 6" pathLength={1} />
    </Svg>
  );
}

export function TargetDoodle(p: DoodleProps) {
  return (
    <Svg {...p}>
      <circle cx="22" cy="26" r="16" pathLength={1} />
      <circle cx="22" cy="26" r="9" pathLength={1} />
      <circle cx="22" cy="26" r="2.5" pathLength={1} />
      <path d="M22 26L40 8M33.5 7.5H40.5V14.5" pathLength={1} />
    </Svg>
  );
}

export function InfinityDoodle(p: DoodleProps) {
  return (
    <Svg {...p}>
      <path d="M24 24c-4-5-7-8-11-8a8 8 0 0 0 0 16c4 0 7-3 11-8s7-8 11-8a8 8 0 0 1 0 16c-4 0-7-3-11-8z" pathLength={1} />
    </Svg>
  );
}

export function ShieldDoodle(p: DoodleProps) {
  return (
    <Svg {...p}>
      <path d="M24 5l15 6v11c0 10-6.5 17-15 21C15.5 39 9 32 9 22V11l15-6z" pathLength={1} />
      <path d="M17.5 24l5 5 9-10" pathLength={1} />
    </Svg>
  );
}

export function NoCameraDoodle(p: DoodleProps) {
  return (
    <Svg {...p}>
      <rect x="5" y="14" width="26" height="20" rx="4" pathLength={1} />
      <path d="M31 21l11-6v18l-11-6" pathLength={1} />
      <path d="M5 6l38 36" pathLength={1} />
    </Svg>
  );
}

export function FlagDoodle(p: DoodleProps) {
  return (
    <Svg {...p}>
      <path d="M10 44V6" pathLength={1} />
      <path d="M10 8c6-4 11 4 18 0s9-2 10-1v17c-1-1-4-2-10 1s-12-4-18 0" pathLength={1} />
    </Svg>
  );
}

export function SkipDoodle(p: DoodleProps) {
  return (
    <Svg {...p}>
      <path d="M7 12l13 12-13 12V12z" pathLength={1} />
      <path d="M22 12l13 12-13 12V12z" pathLength={1} />
      <path d="M41 11v26" pathLength={1} />
    </Svg>
  );
}

export function SparkleDoodle(p: DoodleProps) {
  return (
    <Svg {...p}>
      <path d="M24 4c1 10 4 14 16 20-12 6-15 10-16 20-1-10-4-14-16-20 12-6 15-10 16-20z" pathLength={1} />
    </Svg>
  );
}

export function QuestionDoodle(p: DoodleProps) {
  return (
    <Svg {...p}>
      <path d="M15 16c0-5.5 4-9.5 9.5-9.5S34 10.5 34 16c0 6.5-8.5 7.5-8.5 14" pathLength={1} />
      <path d="M25.5 39.5v.5" strokeWidth={4} pathLength={1} />
    </Svg>
  );
}

/** Three arcs radiating out like sound; arcs pulse one after another (.sound-waves) */
export function SoundWavesDoodle(p: DoodleProps & { flip?: boolean }) {
  const { flip, className, ...rest } = p;
  return (
    <Svg {...rest} className={clsx("sound-waves", flip && "-scale-x-100", className)}>
      <path d="M10 18c3 3.5 3 8.5 0 12" pathLength={1} />
      <path d="M18 12c6 6.5 6 17.5 0 24" pathLength={1} />
      <path d="M26 6c9 9.5 9 26.5 0 36" pathLength={1} />
    </Svg>
  );
}

/** Loopy hand-drawn arrow pointing right */
export function CurlyArrow({ size = 120, ...p }: DoodleProps) {
  return (
    <Svg {...p} size={size} viewBox="0 0 120 60" strokeWidth={2.5}>
      <path d="M4 38c16 12 36 10 44-3 6-10-3-19-10-12-8 8 4 22 24 20 17-2 32-12 46-27" pathLength={1} />
      <path d="M96 12l12 4-3 12" pathLength={1} />
    </Svg>
  );
}

/** Wide wavy underline */
export function Squiggle({ size = 160, ...p }: DoodleProps) {
  return (
    <Svg {...p} size={size} viewBox="0 0 160 16" strokeWidth={3}>
      <path d="M3 9c10-8 20 8 30 0s20 8 30 0 20 8 30 0 20 8 30 0 20 8 30 0" pathLength={1} />
    </Svg>
  );
}
