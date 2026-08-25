"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, MessageSquare } from "lucide-react";
import { clsx } from "clsx";
import { TextMessage } from "@/lib/callStore";

interface TextChatPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: TextMessage[];
  onSend: (body: string) => void;
  unreadCount: number;
}

export default function TextChatPanel({
  isOpen,
  onToggle,
  messages,
  onSend,
  unreadCount,
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

  return (
    <>
      {/* Toggle button with unread badge */}
      {!isOpen && (
        <button
          onClick={onToggle}
          aria-label={`Open text chat${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          className="fixed bottom-[100px] right-4 z-20 w-12 h-12 rounded-full bg-white border border-[#E5E5E8] shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center justify-center text-[#71717A] hover:text-[#7C5CFC] transition-colors"
        >
          <MessageSquare size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#7C5CFC] text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Full panel — full-screen overlay on mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-30 flex flex-col bg-white animate-slide-in sm:fixed sm:right-0 sm:top-0 sm:bottom-0 sm:left-auto sm:w-[320px] sm:border-l sm:border-[#E5E5E8] sm:inset-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E8] shrink-0">
            <div className="flex items-center gap-2 text-[#18181B]">
              <MessageSquare size={18} className="text-[#7C5CFC]" />
              <span className="text-[14px] font-semibold">Chat</span>
            </div>
            <button
              onClick={onToggle}
              aria-label="Close chat panel"
              className="p-1 rounded-[8px] text-[#71717A] hover:bg-[#F4F4F5] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[14px] text-[#71717A]">Say hi 👋</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={clsx(
                    "flex",
                    msg.isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={clsx(
                      "max-w-[80%] px-3 py-2 rounded-[12px] text-[14px] leading-snug",
                      msg.isOwn
                        ? "bg-[#7C5CFC] text-white rounded-br-[4px]"
                        : "bg-[#F4F4F5] text-[#18181B] rounded-bl-[4px]"
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
          <div className="shrink-0 px-4 py-3 border-t border-[#E5E5E8] pb-[max(12px,env(safe-area-inset-bottom))]">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                aria-label="Type a chat message"
                maxLength={2000}
                className="flex-1 px-3 py-2 text-[14px] bg-[#F4F4F5] rounded-full border-none outline-none focus:ring-2 focus:ring-[#7C5CFC]/40 placeholder:text-[#71717A]"
              />
              <button
                onClick={handleSend}
                disabled={!draft.trim()}
                aria-label="Send message"
                className="w-9 h-9 rounded-full bg-[#7C5CFC] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#6547E0] transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
