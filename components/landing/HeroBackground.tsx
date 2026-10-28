import { clsx } from "clsx";
import {
  MicDoodle, ChatDoodle, BulbDoodle, SparkleDoodle, QuestionDoodle,
  SoundWavesDoodle, RocketDoodle, TargetDoodle,
} from "@/components/doodles/Doodles";

// Decorative, animated backdrop for the landing hero: drifting colour glows plus
// faint floating doodles. Purely visual (aria-hidden); still for reduced motion.

const DOODLES: Array<{
  Doodle: React.ComponentType<{ size?: number; className?: string }>;
  pos: string;      // absolute position
  size: number;
  color: string;
  delay: string;    // drift offset so they don't move in sync
  mobile?: boolean; // also show on phones
}> = [
  { Doodle: MicDoodle, pos: "top-[12%] left-[3%]", size: 44, color: "text-primary", delay: "0s", mobile: true },
  { Doodle: ChatDoodle, pos: "top-[58%] left-[44%]", size: 48, color: "text-marker", delay: "-6s" },
  { Doodle: BulbDoodle, pos: "bottom-[8%] left-[6%]", size: 40, color: "text-highlight", delay: "-3s" },
  { Doodle: SparkleDoodle, pos: "top-[6%] left-[40%]", size: 26, color: "text-highlight", delay: "-9s", mobile: true },
  { Doodle: QuestionDoodle, pos: "top-[30%] right-[3%]", size: 36, color: "text-primary", delay: "-12s" },
  { Doodle: SoundWavesDoodle, pos: "bottom-[14%] right-[6%]", size: 46, color: "text-primary", delay: "-4s" },
  { Doodle: RocketDoodle, pos: "top-[4%] right-[30%]", size: 34, color: "text-marker", delay: "-15s" },
  { Doodle: TargetDoodle, pos: "bottom-[4%] left-[38%]", size: 36, color: "text-muted", delay: "-8s" },
  { Doodle: SparkleDoodle, pos: "bottom-[30%] right-[2%]", size: 20, color: "text-marker", delay: "-2s", mobile: true },
  { Doodle: SparkleDoodle, pos: "top-[46%] left-[1%]", size: 18, color: "text-highlight", delay: "-11s" },
];

export default function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Soft glows that slowly wander */}
      <div className="hero-glow absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-primary/20 blur-3xl" />
      <div className="hero-glow absolute top-[20%] -right-32 w-[460px] h-[460px] rounded-full bg-marker/15 blur-3xl" style={{ animationDelay: "-7s" }} />
      <div className="hero-glow absolute -bottom-40 left-[30%] w-[380px] h-[380px] rounded-full bg-highlight/10 blur-3xl" style={{ animationDelay: "-14s" }} />

      {/* Faint floating doodles */}
      {DOODLES.map(({ Doodle, pos, size, color, delay, mobile }, i) => (
        <div
          key={i}
          className={clsx("hero-drift absolute opacity-[0.34]", pos, !mobile && "hidden md:block")}
          style={{ animationDelay: delay }}
        >
          <Doodle size={size} className={color} />
        </div>
      ))}
    </div>
  );
}
