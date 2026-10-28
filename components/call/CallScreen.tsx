"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import AudioVisualizer from "@/components/call/AudioVisualizer";
import ControlBar from "@/components/call/ControlBar";
import TextChatPanel from "@/components/call/TextChatPanel";
import ReportModal from "@/components/call/ReportModal";
import { useCallStore } from "@/lib/callStore";
import { INTENT_TAGS } from "@/components/intent/IntentCard";
import { useAuth } from "@/lib/mockAuth";
import { SoundWavesDoodle } from "@/components/doodles/Doodles";

interface CallScreenProps {
  sessionId: string;
  isConnected: boolean;
  /** Connected but the other person hasn't joined yet */
  isWaiting: boolean;
  isSpeaking: boolean;
  amplitude: number;
  /** Who is on the other end: "Stranger" for real calls, "Demo bot" for the bot */
  peerName?: string;
  /** Overrides the handwritten status line under the visualizer */
  status?: string;
  /** What the other side is saying, shown as a subtitle note (bot only) */
  caption?: string;
  /** Extra content under the status, e.g. a "tap to hear" button */
  extra?: React.ReactNode;
  /** Called after you send a chat message (the bot uses it to reply) */
  onSendMessage?: (body: string) => void;
}

export default function CallScreen({
  sessionId,
  isConnected,
  isWaiting,
  isSpeaking,
  amplitude,
  peerName = "Stranger",
  status,
  caption,
  extra,
  onSendMessage,
}: CallScreenProps) {
  const router = useRouter();
  const { user } = useAuth();

  const {
    currentSession, isMuted, textMessages, isChatOpen, unreadCount,
    contactRequestSent, contactAdded, toggleMute, toggleChat, sendMessage,
    sendContactRequest, hangUp, skip, endCall,
  } = useCallStore();

  const [reportOpen, setReportOpen] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Call timer
  useEffect(() => {
    if (isConnected) {
      timerRef.current = setInterval(() => setCallSeconds(s => s + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isConnected]);

  const matchIntent =
    INTENT_TAGS.find(t => t.slug === currentSession?.matchIntentTag) ?? INTENT_TAGS[2];

  const handleHangUp = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    hangUp();
    router.push(`/post-call/${sessionId}`);
  };

  const handleSkip = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    skip();
    router.push("/queue");
  };

  // TODO: persist the report reason and note once the reports table exists
  const handleReport = async () => {
    setReportSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setReportSubmitting(false);
    setReportOpen(false);
    endCall("report");
    router.push(`/post-call/${sessionId}?reported=true`);
  };

  const handleSendMessage = (body: string) => {
    sendMessage(body, user?.id || "usr_mock");
    onSendMessage?.(body);
    // TODO: Send via LiveKit DataChannel in V2
  };

  const statusText =
    status ??
    (!isConnected
      ? "connecting securely…"
      : isWaiting
      ? "waiting for the stranger to join…"
      : isSpeaking
      ? "stranger is speaking…"
      : isMuted
      ? "you're muted"
      : "you're connected, say hi!");

  return (
    <div className="min-h-screen bg-dots flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 bg-paper/85 backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-[72px]">
          <span className={clsx("w-2.5 h-2.5 rounded-full", isConnected ? "bg-live animate-pulse" : "bg-warning")} aria-hidden="true" />
          <span className="text-[15px] font-bold tabular-nums" aria-live="polite">
            {isConnected ? `${String(Math.floor(callSeconds / 60)).padStart(2, "0")}:${String(callSeconds % 60).padStart(2, "0")}` : "…"}
          </span>
        </div>

        <span className="font-hand font-bold text-[24px] leading-none text-marker whitespace-nowrap px-1">
          {isMuted ? "you're muted" : "live call"}
        </span>

        <button
          onClick={() => setReportOpen(true)}
          className="min-h-[40px] px-3.5 rounded-[10px] border-2 border-outline bg-surface text-[14px] font-bold hover:bg-danger-soft hover:text-danger hover:border-danger transition-colors"
        >
          Report
        </button>
      </div>

      {/* Main call area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 pt-4 pb-[190px] px-4">
        {/* Who you're talking to */}
        <div
          className={clsx(matchIntent.note, "shadow-note px-6 py-4 note-tilt anim-note-drop max-w-[300px] text-center")}
          style={{ "--tilt": "-2deg" } as React.CSSProperties}
        >
          <p className="text-[13px] font-bold text-ink/70">{peerName} wants to</p>
          <p className="font-hand font-bold text-[30px] leading-none mt-1">{matchIntent.label}</p>
        </div>

        <div className="flex items-center gap-1">
          {/* Sound waves fade in while the other side is talking */}
          <SoundWavesDoodle size={44} flip className={clsx("text-primary transition-opacity duration-300", isSpeaking ? "opacity-100" : "opacity-0")} />
          <AudioVisualizer
            isActive={isConnected && !isWaiting}
            isSpeaking={isSpeaking}
            amplitude={amplitude}
            size="lg"
          />
          <SoundWavesDoodle size={44} className={clsx("text-primary transition-opacity duration-300", isSpeaking ? "opacity-100" : "opacity-0")} />
        </div>

        <p className="font-hand text-[26px] text-primary text-center max-w-[300px] leading-tight" aria-live="polite">
          {statusText}
        </p>

        {/* Subtitles of what the other side just said */}
        {caption && (
          <p
            key={caption}
            className="anim-rise-in max-w-[420px] bg-surface border-2 border-outline rounded-[14px] px-4 py-3 text-[15px] leading-snug text-center"
            aria-live="polite"
          >
            “{caption}”
          </p>
        )}

        {extra}
      </div>

      {/* Text chat panel */}
      <TextChatPanel
        isOpen={isChatOpen}
        onToggle={toggleChat}
        messages={textMessages}
        onSend={handleSendMessage}
      />

      {/* Control bar */}
      <ControlBar
        isMuted={isMuted}
        onMute={toggleMute}
        onHangUp={handleHangUp}
        onSkip={handleSkip}
        onChat={toggleChat}
        unreadCount={unreadCount}
        onAddContact={sendContactRequest}
        contactRequestSent={contactRequestSent}
        contactAdded={contactAdded}
        canAddContact={callSeconds >= 10 && isConnected && !isWaiting}
      />

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
        isSubmitting={reportSubmitting}
      />
    </div>
  );
}
