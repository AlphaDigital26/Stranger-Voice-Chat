"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import { clsx } from "clsx";
import { TextMessage } from "@/lib/callStore";

interface TextChatPanelProps {
  isOpen: boolean;
  onToggle: () => void; // opened from the control bar's Chat button
  messages: TextMessage[];
  onSend: (body: string) => void;
}

export default function TextChatPanel({
  isOpen,
  onToggle,
  messages,
  onSend,
}: TextChatPanelProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft("");
  };

  if (!isOpen) return null;

  // Full-screen on mobile, side panel on desktop
  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-dots animate-slide-in sm:left-auto sm:w-[360px] sm:border-l-2 sm:border-outline">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-outline bg-surface shrink-0">
        <span className="font-hand font-bold text-[28px] leading-none">chat</span>
        <button
          onClick={onToggle}
          aria-label="Close chat panel"
          className="w-11 h-11 flex items-center justify-center rounded-[10px] text-ink hover:bg-paper-2 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages — yours on blue notes, theirs on yellow */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-hand text-[26px] text-muted">say hi…</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id} className={clsx("flex", msg.isOwn ? "justify-end" : "justify-start")}>
              <div
                className={clsx(
                  "max-w-[80%] px-3.5 py-2.5 text-[15px] leading-snug text-ink shadow-note",
                  msg.isOwn ? "bg-note-blue" : "bg-note-yellow",
                  i % 2 === 0 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"
                )}
              >
                {msg.body}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t-2 border-outline bg-surface pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message…"
            aria-label="Type a chat message"
            maxLength={2000}
            className="flex-1 min-w-0 px-3 py-2.5 text-[15px] bg-surface border-2 border-line rounded-[12px] outline-none focus:border-primary placeholder:text-muted"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            aria-label="Send message"
            className="w-11 h-11 shrink-0 rounded-[12px] bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
