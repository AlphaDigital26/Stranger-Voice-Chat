"use client";

import { Mic, MicOff, PhoneOff, SkipForward, Flag, UserPlus, Check } from "lucide-react";
import { clsx } from "clsx";

interface ControlBarProps {
  isMuted: boolean;
  onMute: () => void;
  onHangUp: () => void;
  onSkip: () => void;
  onReport: () => void;
  onAddContact: () => void;
  contactRequestSent: boolean;
  contactAdded: boolean;
  callDurationSeconds: number;
  canAddContact: boolean; // true after min duration threshold
}

function formatTimer(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export default function ControlBar({
  isMuted,
  onMute,
  onHangUp,
  onSkip,
  onReport,
  onAddContact,
  contactRequestSent,
  contactAdded,
  callDurationSeconds,
  canAddContact,
}: ControlBarProps) {
  return (
    // Bottom-anchored control bar, pb-safe for iOS home indicator
    // min 44x44px touch targets per Apple HIG + UIUX Brief §8
    <div className="fixed bottom-0 left-0 right-0 z-20 pb-[max(16px,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-[600px] px-4">
        {/* Timer strip */}
        <div className="flex items-center justify-center mb-3">
          <span
            className="text-[13px] font-mono font-medium text-[#A1A1AA] bg-[#1C1C1F]/80 backdrop-blur-sm px-3 py-1 rounded-full border border-[#27272A]"
            aria-live="polite"
            aria-label={`Call duration: ${formatTimer(callDurationSeconds)}`}
          >
            {formatTimer(callDurationSeconds)}
          </span>
        </div>

        {/* Control buttons */}
        <div className="bg-[#1C1C1F]/90 backdrop-blur-md border border-[#27272A] rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.4)] px-4 py-3">
          <div className="flex items-center justify-around gap-2">

            {/* Mute */}
            <button
              onClick={onMute}
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              aria-pressed={isMuted}
              className={clsx(
                "flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center px-2 rounded-[12px] transition-all duration-150",
                isMuted
                  ? "bg-[#EF4444]/20 text-[#EF4444]"
                  : "text-[#F4F4F5] hover:bg-[#27272A]"
              )}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              <span className="text-[10px] font-medium leading-none">{isMuted ? "Unmute" : "Mute"}</span>
            </button>

            {/* Skip */}
            <button
              onClick={onSkip}
              aria-label="Skip to next stranger"
              className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center px-2 rounded-[12px] text-[#A1A1AA] hover:bg-[#27272A] transition-all duration-150"
            >
              <SkipForward size={22} />
              <span className="text-[10px] font-medium leading-none">Skip</span>
            </button>

            {/* Hang Up — center, prominent, red */}
            <button
              onClick={onHangUp}
              aria-label="Hang up call"
              className="flex flex-col items-center gap-1 min-w-[60px] min-h-[60px] justify-center px-3 rounded-[16px] bg-[#EF4444] text-white hover:bg-[#DC2626] active:bg-[#B91C1C] shadow-sm transition-all duration-150"
            >
              <PhoneOff size={24} />
              <span className="text-[10px] font-medium leading-none">Hang Up</span>
            </button>

            {/* Report */}
            <button
              onClick={onReport}
              aria-label="Report this conversation"
              className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center px-2 rounded-[12px] text-[#A1A1AA] hover:bg-[#27272A] hover:text-[#EF4444] transition-all duration-150"
            >
              <Flag size={22} />
              <span className="text-[10px] font-medium leading-none">Report</span>
            </button>

            {/* Add Contact */}
            <button
              onClick={contactAdded ? undefined : onAddContact}
              disabled={!canAddContact || contactAdded}
              aria-label={
                contactAdded
                  ? "Contact added"
                  : contactRequestSent
                  ? "Contact request sent"
                  : "Add as contact"
              }
              className={clsx(
                "flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center px-2 rounded-[12px] transition-all duration-150",
                contactAdded
                  ? "text-[#22C55E]"
                  : contactRequestSent
                  ? "text-[#7C5CFC] opacity-70"
                  : canAddContact
                  ? "text-[#F4F4F5] hover:bg-[#27272A]"
                  : "text-[#71717A] opacity-40 cursor-not-allowed"
              )}
            >
              {contactAdded ? <Check size={22} /> : <UserPlus size={22} />}
              <span className="text-[10px] font-medium leading-none">
                {contactAdded ? "Added" : contactRequestSent ? "Sent" : "Add"}
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
