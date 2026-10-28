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
  const initials = name.match(/#\d{1,2}/)?.[0] ?? "?";

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
    <div className="min-h-screen bg-dots flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface border-b-2 border-outline px-4 py-3 flex items-center gap-3">
        <Link href="/contacts" aria-label="Back to contacts" className="w-10 h-10 flex items-center justify-center rounded-[10px] hover:bg-paper-2 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="w-10 h-10 bg-note-yellow flex items-center justify-center font-hand font-bold text-[18px] -rotate-3" aria-hidden="true">
          {initials}
        </span>
        <div>
          <p className="text-[16px] font-bold">{name}</p>
          <p className="text-[12px] text-muted">PitchLine contact</p>
        </div>
      </div>

      {/* Messages — yours on blue notes, theirs on yellow */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-[640px] mx-auto flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="font-hand text-[26px] text-muted text-center">
                say hi to {name}…
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 text-[15px] leading-snug text-ink shadow-note ${
                    msg.isOwn ? "bg-note-blue" : "bg-note-yellow"
                  } ${i % 2 === 0 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"}`}
                >
                  {msg.body}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 bg-surface border-t-2 border-outline px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="flex gap-2 items-center max-w-[640px] mx-auto">
          <input
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={`Message ${name}…`}
            maxLength={2000}
            aria-label="Type a message"
            className="flex-1 min-w-0 px-4 py-2.5 text-[15px] bg-surface border-2 border-line rounded-[12px] outline-none focus:border-primary placeholder:text-muted"
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            aria-label="Send message"
            className="w-11 h-11 shrink-0 rounded-[12px] bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary-hover transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
