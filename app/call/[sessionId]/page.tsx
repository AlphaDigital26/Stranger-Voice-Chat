"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { clsx } from "clsx";
import AudioVisualizer from "@/components/call/AudioVisualizer";
import ControlBar from "@/components/call/ControlBar";
import TextChatPanel from "@/components/call/TextChatPanel";
import ReportModal from "@/components/call/ReportModal";
import { useCallStore } from "@/lib/callStore";
import { INTENT_TAGS } from "@/components/intent/IntentCard";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/mockAuth";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useTrackVolume,
  useConnectionState,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";

function CallUI({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    currentSession, isMuted, textMessages, isChatOpen, unreadCount,
    contactRequestSent, contactAdded, toggleMute, toggleChat, sendMessage,
    receiveMessage, sendContactRequest, confirmContactAdded, hangUp, skip, endCall,
  } = useCallStore();

  const [reportOpen, setReportOpen] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // LiveKit hooks
  const connectionState = useConnectionState();
  const participants = useParticipants();
  
  // Find the remote participant (anyone who isn't the local user)
  const remoteParticipant = participants.find((p) => !p.isLocal);
  
  // Get their audio track for the visualizer
  const audioTrackPub = remoteParticipant?.getTrackPublication(Track.Source.Microphone);
  const audioTrack = audioTrackPub?.track;
  
  // Get volume (0 to 1) and speaking status
  const volume = useTrackVolume(audioTrack);
  const isSpeaking = remoteParticipant?.isSpeaking || false;
  // Make the visualizer pulse a bit when they are speaking even if volume is low, to ensure it looks alive
  const amplitude = isSpeaking ? Math.max(volume, 0.2) : 0;

  // Call timer
  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      timerRef.current = setInterval(() => setCallSeconds(s => s + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [connectionState]);

  const matchLabel = currentSession
    ? INTENT_TAGS.find(t => t.slug === currentSession.matchIntentTag)?.label
    : "Open Discussion";

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

  const handleReport = async (reason: string, note?: string) => {
    setReportSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setReportSubmitting(false);
    setReportOpen(false);
    endCall("report");
    router.push(`/post-call/${sessionId}?reported=true`);
  };

  const handleSendMessage = (body: string) => {
    sendMessage(body, user?.id || "usr_mock");
    // TODO: Send via LiveKit DataChannel in V2
  };

  const isConnected = connectionState === ConnectionState.Connected;
  const isWaiting = isConnected && !remoteParticipant;

  return (
    <div className="min-h-screen bg-[#121214] flex flex-col overflow-hidden transition-colors duration-500">
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-[#1C1C1F]/80 backdrop-blur-md border-b border-[#27272A]">
        <div className="flex items-center gap-2">
          <div className={clsx("w-2 h-2 rounded-full", isConnected ? "bg-[#22C55E] animate-pulse" : "bg-[#F59E0B]")} aria-hidden="true" />
          <span
            className="text-[13px] font-mono font-medium text-[#A1A1AA] tabular-nums"
            aria-live="polite"
          >
            {isConnected ? `${String(Math.floor(callSeconds / 60)).padStart(2, "0")}:${String(callSeconds % 60).padStart(2, "0")}` : "Connecting..."}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(124,92,252,0.08)] border border-[rgba(124,92,252,0.15)]">
          <span className="text-[11px] font-medium text-[#7C5CFC]">Talking about:</span>
          <span className="text-[11px] font-semibold text-[#7C5CFC]">{matchLabel}</span>
        </div>

        {isMuted && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#FEF2F2]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            <span className="text-[11px] font-medium text-[#EF4444]">Muted</span>
          </div>
        )}
      </div>

      {/* Main call area */}
      <div
        className="flex-1 flex flex-col items-center justify-center gap-4 pb-[160px] px-4"
        aria-live="polite"
      >
        <AudioVisualizer
          isActive={isConnected && !isWaiting}
          isSpeaking={isSpeaking}
          amplitude={amplitude}
          size="lg"
        />

        <p className="text-[14px] text-[#A1A1AA] text-center max-w-[240px]">
          {!isConnected
            ? "Connecting to secure channel..."
            : isWaiting
            ? "Waiting for stranger to join..."
            : isSpeaking
            ? "Stranger is speaking..."
            : isMuted
            ? "You're muted"
            : "You're connected — start talking!"}
        </p>
      </div>

      {/* Text chat panel */}
      <TextChatPanel
        isOpen={isChatOpen}
        onToggle={toggleChat}
        messages={textMessages}
        onSend={handleSendMessage}
        unreadCount={unreadCount}
      />

      {/* Control bar */}
      <ControlBar
        isMuted={isMuted}
        onMute={toggleMute}
        onHangUp={handleHangUp}
        onSkip={handleSkip}
        onReport={() => setReportOpen(true)}
        onAddContact={sendContactRequest}
        contactRequestSent={contactRequestSent}
        contactAdded={contactAdded}
        callDurationSeconds={callSeconds}
        canAddContact={callSeconds >= 10 && !!remoteParticipant}
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

export default function CallPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { toast } = useToast();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      try {
        const resp = await fetch(`/api/livekit/token?room=${sessionId}`);
        const data = await resp.json();
        if (data.token) {
          setToken(data.token);
        } else {
          toast("Failed to get secure room token.", "error");
        }
      } catch (e) {
        toast("Failed to connect to room.", "error");
      }
    })();
  }, [sessionId, toast]);

  if (!token) {
    return (
      <div className="min-h-screen bg-[#121214] flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-[#7C5CFC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: "100dvh", width: "100vw", overflow: "hidden" }}
    >
      <CallUI sessionId={sessionId} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
