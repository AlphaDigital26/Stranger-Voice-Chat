import { clsx } from "clsx";
import { Mic, MessageSquare, UserPlus, SkipForward } from "lucide-react";
import { SoundWavesDoodle } from "@/components/doodles/Doodles";

// Illustrative previews of the real call and chat screens for the landing page.
// Example content only; marked aria-hidden inside so screen readers get the caption instead.

function Phone({ children, tilt = 0 }: { children: React.ReactNode; tilt?: number }) {
  return (
    <div
      className="note-tilt relative w-[270px] h-[540px] rounded-[40px] border-[3px] border-outline bg-dots shadow-note overflow-hidden"
      style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
    >
      {/* Notch */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-outline" />
      <div className="h-full pt-10 px-4 pb-4 flex flex-col" aria-hidden="true">{children}</div>
    </div>
  );
}

const BAR_DELAYS = [0, 0.25, 0.5, 0.15, 0.4, 0.1, 0.35];

export function CallMockup() {
  return (
    <Phone tilt={-2}>
      <div className="flex items-center justify-between text-[12px] font-bold">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-live animate-pulse" />02:14</span>
        <span className="font-hand text-[18px] text-marker leading-none">live call</span>
        <span className="px-2 py-0.5 border-2 border-outline rounded-[8px] bg-surface">Report</span>
      </div>

      <div className="mt-5 self-center bg-note-yellow shadow-note px-4 py-2.5 -rotate-2 text-center">
        <p className="text-[10px] font-bold text-ink/70">Stranger wants to</p>
        <p className="font-hand font-bold text-[22px] leading-none">Pitch my idea</p>
      </div>

      <div className="mt-6 flex items-center justify-center gap-1">
        <SoundWavesDoodle size={30} flip className="text-primary" />
        <div className="relative w-[120px] h-[120px] flex items-center justify-center">
          <svg viewBox="0 0 140 140" className="absolute inset-0 w-full h-full">
            <path d="M70 12 C 110 10, 132 40, 128 74 C 124 110, 96 130, 66 128 C 32 126, 10 100, 12 68 C 14 38, 36 14, 74 16" fill="none" className="stroke-marker" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <div className="flex items-center gap-[4px] h-10">
            {BAR_DELAYS.map((d, i) => (
              <span key={i} className="w-[5px] h-full rounded-full bg-primary origin-center animate-waveform" style={{ animationDelay: `${d}s` }} />
            ))}
          </div>
        </div>
        <SoundWavesDoodle size={30} className="text-primary" />
      </div>

      <p className="mt-3 text-center font-hand text-[20px] text-primary">stranger is speaking…</p>

      <div className="mt-auto grid grid-cols-4 gap-1.5">
        {[
          { Icon: Mic, label: "Mute" },
          { Icon: MessageSquare, label: "Chat" },
          { Icon: UserPlus, label: "Contact" },
          { Icon: SkipForward, label: "Skip" },
        ].map(({ Icon, label }) => (
          <span key={label} className="flex flex-col items-center gap-0.5 py-2 rounded-[10px] border-2 border-outline bg-surface text-[9px] font-bold">
            <Icon size={14} />{label}
          </span>
        ))}
      </div>
      <span className="mt-1.5 py-2.5 rounded-[10px] border-2 border-outline bg-danger-strong text-white text-center text-[12px] font-extrabold">End call</span>
    </Phone>
  );
}

const CHAT: Array<{ own: boolean; text: string }> = [
  { own: false, text: "So who pays, the dog owner or the walker?" },
  { own: true, text: "Owners, ₹99 a walk. Walkers keep 80%." },
  { own: false, text: "Have you asked 10 owners if they'd pay that?" },
  { own: true, text: "Not yet… adding it to my list!" },
];

export function ChatMockup() {
  return (
    <Phone tilt={2}>
      <div className="flex items-center justify-between border-b-2 border-outline pb-2">
        <span className="font-hand font-bold text-[24px] leading-none">chat</span>
        <span className="text-[11px] font-bold text-muted">during the call</span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {CHAT.map((m, i) => (
          <div key={i} className={clsx("flex reveal", m.own ? "justify-end" : "justify-start")}>
            <p
              className={clsx(
                "max-w-[85%] px-3 py-2 text-[12px] leading-snug shadow-note",
                m.own ? "bg-note-blue" : "bg-note-yellow",
                i % 2 === 0 ? "rotate-[0.8deg]" : "-rotate-[0.8deg]"
              )}
            >
              {m.text}
            </p>
          </div>
        ))}
        {/* Stranger is typing */}
        <div className="flex justify-start">
          <p className="anim-typing bg-note-yellow shadow-note px-3 py-2 text-[16px] font-extrabold leading-none tracking-widest">
            <span>•</span><span>•</span><span>•</span>
          </p>
        </div>
      </div>

      <div className="mt-auto flex gap-1.5">
        <span className="flex-1 px-3 py-2 text-[11px] text-muted border-2 border-line rounded-[10px] bg-surface">Type a message…</span>
        <span className="w-9 rounded-[10px] bg-primary" />
      </div>
    </Phone>
  );
}
