import { clsx } from "clsx";

// Hand-lettered wordmark with a marker underline (Direction F)
export default function Logo({ className, small }: { className?: string; small?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5", className)}>
      <span className={clsx("font-hand font-bold leading-none text-primary", small ? "text-[24px]" : "text-[30px]")}>PitchLine</span>
      <svg width={small ? 26 : 34} height={small ? 8 : 10} viewBox="0 0 40 12" aria-hidden="true">
        <path d="M2 8 Q12 2 20 7 T38 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-marker" />
      </svg>
    </span>
  );
}
