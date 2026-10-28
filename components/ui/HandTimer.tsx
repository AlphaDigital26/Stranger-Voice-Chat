import { clsx } from "clsx";

interface HandTimerProps {
  /** Text in the middle, e.g. "0:42" */
  value: string;
  /** Small handwritten caption under the value */
  caption?: string;
  /** 0–1: draws that much of the circle in marker red over a faint full circle */
  progress?: number;
  size?: number;
  className?: string;
}

const CIRCLE =
  "M70 12 C 110 10, 132 40, 128 74 C 124 110, 96 130, 66 128 C 32 126, 10 100, 12 68 C 14 38, 36 14, 74 16";

// Hand-drawn marker circle timer (Direction F's take on the Pitch Clock)
export default function HandTimer({ value, caption, progress, size = 140, className }: HandTimerProps) {
  const hasProgress = typeof progress === "number";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      role="img"
      aria-label={caption ? `${value} ${caption}` : value}
      className={clsx("shrink-0", className)}
    >
      {hasProgress && (
        <path d={CIRCLE} fill="none" className="stroke-line" strokeWidth="5" strokeLinecap="round" />
      )}
      <path
        d={CIRCLE}
        fill="none"
        className="stroke-marker"
        strokeWidth="5"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={hasProgress ? 1 : undefined}
        strokeDashoffset={hasProgress ? 1 - Math.max(0, Math.min(1, progress)) : undefined}
        style={hasProgress ? { transition: "stroke-dashoffset 1s linear" } : undefined}
      />
      <text x="70" y={caption ? 76 : 82} textAnchor="middle" className="fill-ink font-sans tabular-nums" fontWeight="800" fontSize="34">
        {value}
      </text>
      {caption && (
        <text x="70" y="98" textAnchor="middle" className="fill-primary font-hand" fontSize="16">
          {caption}
        </text>
      )}
    </svg>
  );
}
