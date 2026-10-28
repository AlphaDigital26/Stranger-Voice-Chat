"use client";

import { Mic, MicOff, SkipForward, UserPlus, Check, MessageSquare } from "lucide-react";
import { clsx } from "clsx";

interface ControlBarProps {
  isMuted: boolean;
  onMute: () => void;
  onHangUp: () => void;
  onSkip: () => void;
  onChat: () => void;
  unreadCount: number;
  onAddContact: () => void;
  contactRequestSent: boolean;
  contactAdded: boolean;
  canAddContact: boolean; // true after min duration threshold
}

const tile =
  "relative flex flex-col items-center justify-center gap-1 min-h-[60px] rounded-[12px] border-2 border-outline bg-surface text-ink text-[13px] font-bold transition-colors duration-150";

export default function ControlBar({
  isMuted,
  onMute,
  onHangUp,
  onSkip,
  onChat,
  unreadCount,
  onAddContact,
  contactRequestSent,
  contactAdded,
  canAddContact,
}: ControlBarProps) {
  return (
    // Bottom-anchored, pb for the iOS home indicator; every target is at least 60px tall
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-paper/90 backdrop-blur-sm pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-[520px] px-4 flex flex-col gap-2">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={onMute}
            aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            aria-pressed={isMuted}
            className={clsx(tile, isMuted ? "bg-danger-soft text-danger border-danger" : "hover:bg-paper-2")}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            {isMuted ? "Unmute" : "Mute"}
          </button>

          <button
            onClick={onChat}
            aria-label={`Open text chat${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            className={clsx(tile, "hover:bg-paper-2")}
          >
            <MessageSquare size={20} />
            Chat
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1 rounded-full bg-marker text-white text-[11px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

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
              tile,
              contactAdded
                ? "bg-live-soft text-live border-live"
                : contactRequestSent
                ? "bg-note-blue"
                : canAddContact
                ? "hover:bg-paper-2"
                : "opacity-40 cursor-not-allowed"
            )}
          >
            {contactAdded ? <Check size={20} /> : <UserPlus size={20} />}
            {contactAdded ? "Added" : contactRequestSent ? "Sent" : "Contact"}
          </button>

          <button
            onClick={onSkip}
            aria-label="Skip to next stranger"
            className={clsx(tile, "hover:bg-paper-2")}
          >
            <SkipForward size={20} />
            Skip
          </button>
        </div>

        <button
          onClick={onHangUp}
          className="w-full min-h-[56px] rounded-[12px] border-2 border-outline bg-danger-strong text-white text-[16px] font-extrabold hover:bg-danger-hover transition-colors"
        >
          End call
        </button>
      </div>
    </div>
  );
}
