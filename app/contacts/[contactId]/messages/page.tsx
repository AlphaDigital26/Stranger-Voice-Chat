"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { MOCK_CONTACTS, MOCK_MESSAGES, getStrangerName } from "@/lib/mockData";
import { useAuth } from "@/lib/mockAuth";

// NO AD SLOTS on this screen — private communications per AdSense policy
// UIUX Brief §12a: "never inside it or on the messaging thread screen"

export default function MessagesPage() {
  const params = useParams();
  const contactId = params.contactId as string;
  const { user } = useAuth();

  const contact = MOCK_CONTACTS.find(c => c.id === contactId);
  const name = contact ? getStrangerName(contact.contactUserId) : "Stranger";

  const [messages, setMessages] = useState(MOCK_MESSAGES[contactId] ?? []);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages]);

  const send = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const msg = {
      id: `m_${Date.now()}`,
      senderId: user?.id ?? "usr_self",
      body: trimmed,
      createdAt: new Date().toISOString(),
      isOwn: true,
    };
    setMessages(prev => [...prev, msg]);
    setDraft("");

    // Simulate reply
    setTimeout(() => {
      const replies = ["Sounds great!", "Interesting, tell me more.", "I'll think about it.", "Definitely agree.", "Good point!"];
      setMessages(prev => [...prev, {
        id: `m_${Date.now()}_r`,
        senderId: contact?.contactUserId ?? "usr_stranger",
        body: replies[Math.floor(Math.random() * replies.length)],
        createdAt: new Date().toISOString(),
        isOwn: false,
      }]);
    }, 1500 + Math.random() * 2000);
  };

  return (
    // NO AdSlot imported or used — this is a private messaging screen
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E5E5E8] px-4 py-3 flex items-center gap-3">
        <Link href="/contacts" aria-label="Back to contacts" className="p-1 rounded-[8px] text-[#71717A] hover:bg-[#F4F4F5] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C5CFC]/20 to-[#9B82FF]/20 flex items-center justify-center">
          <span className="text-[11px] font-bold text-[#7C5CFC]">S</span>
        </div>
        <div>
          <p className="text-[15px] font-semibold text-[#18181B]">{name}</p>
          <p className="text-[11px] text-[#71717A]">PitchLine contact</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <p className="text-[14px] text-[#71717A] text-center">
              Start the conversation with {name} 👋
            </p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-[16px] text-[14px] leading-snug ${
                  msg.isOwn
                    ? "bg-[#7C5CFC] text-white rounded-br-[4px]"
                    : "bg-white border border-[#E5E5E8] text-[#18181B] rounded-bl-[4px]"
                }`}
              >
                {msg.body}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 bg-white border-t border-[#E5E5E8] px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="flex gap-2 items-center max-w-[640px] mx-auto">
          <input
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={`Message ${name}...`}
            maxLength={2000}
            aria-label="Type a message"
            className="flex-1 px-4 py-2.5 text-[14px] bg-[#F4F4F5] rounded-full border-none outline-none focus:ring-2 focus:ring-[#7C5CFC]/40 placeholder:text-[#71717A]"
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            aria-label="Send message"
            className="w-10 h-10 rounded-full bg-[#7C5CFC] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#6547E0] transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
