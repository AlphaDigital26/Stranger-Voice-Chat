"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import CallScreen from "@/components/call/CallScreen";
import { useCallStore } from "@/lib/callStore";
import { useToast } from "@/components/ui/Toast";
import { useDemoBot, botChatReply } from "@/lib/demoBot";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useTrackVolume,
  useConnectionState,
} from "@livekit/components-react";
import { ConnectionState, Track, type RemoteAudioTrack } from "livekit-client";

// Real call: everything comes from the LiveKit room
function LiveKitCall({ sessionId }: { sessionId: string }) {
  const connectionState = useConnectionState();
  const participants = useParticipants();

  // Find the remote participant (anyone who isn't the local user)
  const remoteParticipant = participants.find((p) => !p.isLocal);

  // Get their audio track for the visualizer
  const audioTrackPub = remoteParticipant?.getTrackPublication(Track.Source.Microphone);
  // The microphone source of a remote participant is always a remote audio track
  const audioTrack = audioTrackPub?.track as RemoteAudioTrack | undefined;

  // Get volume (0 to 1) and speaking status
  const volume = useTrackVolume(audioTrack);
  const isSpeaking = remoteParticipant?.isSpeaking || false;
  // Make the visualizer pulse a bit when they are speaking even if volume is low, to ensure it looks alive
  const amplitude = isSpeaking ? Math.max(volume, 0.2) : 0;

  const isConnected = connectionState === ConnectionState.Connected;

  return (
    <CallScreen
      sessionId={sessionId}
      isConnected={isConnected}
      isWaiting={isConnected && !remoteParticipant}
      isSpeaking={isSpeaking}
      amplitude={amplitude}
    />
  );
}

// Demo call: the bot talks, listens and answers chat (no LiveKit room needed)
function BotCall({ sessionId }: { sessionId: string }) {
  const { selectedIntent, isMuted, receiveMessage } = useCallStore();
  const bot = useDemoBot({ myIntent: selectedIntent, isMuted });
  const chatTurn = useRef(0);

  const handleSendMessage = (body: string) => {
    const reply = botChatReply(body, chatTurn.current++);
    setTimeout(() => receiveMessage(reply, "bot_demo"), 1100 + Math.random() * 900);
  };

  const status =
    bot.phase === "connecting"
      ? "connecting you to the demo bot…"
      : bot.phase === "speaking"
      ? "demo bot is speaking…"
      : bot.phase === "blocked"
      ? "your browser paused the bot's voice"
      : bot.phase === "done"
      ? "the bot is done. End the call or skip to try again."
      : isMuted
      ? "you're muted, unmute to answer"
      : bot.canHear
      ? "your turn, talk out loud…"
      : "your turn… (voice replies need Chrome or Edge; the bot moves on in a few seconds)";

  return (
    <CallScreen
      sessionId={sessionId}
      isConnected={bot.isConnected}
      isWaiting={false}
      isSpeaking={bot.isSpeaking}
      amplitude={bot.amplitude}
      peerName="Demo bot"
      status={status}
      caption={bot.caption}
      onSendMessage={handleSendMessage}
      extra={
        bot.phase === "blocked" ? (
          <button
            onClick={bot.unblock}
            className="min-h-[48px] px-5 rounded-[12px] border-2 border-primary bg-primary text-on-primary text-[15px] font-bold hover:bg-primary-hover transition-colors"
          >
            Tap to hear the bot
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-note-orange text-[13px] font-bold">
            Demo bot · not a real person
          </span>
        )
      }
    />
  );
}

export default function CallPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const isBot = sessionId?.startsWith("bot_");
  const { toast } = useToast();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!sessionId || isBot) return;
    (async () => {
      try {
        const resp = await fetch(`/api/livekit/token?room=${sessionId}`);
        const data = await resp.json();
        if (data.token) {
          setToken(data.token);
        } else {
          toast("Failed to get secure room token.", "error");
        }
      } catch {
        toast("Failed to connect to room.", "error");
      }
    })();
  }, [sessionId, isBot, toast]);

  if (isBot) return <BotCall sessionId={sessionId} />;

  if (!token) {
    return (
      <div className="min-h-screen bg-dots flex flex-col items-center justify-center gap-4" role="status">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <p className="font-hand text-[26px] text-primary">opening a secure room…</p>
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
      <LiveKitCall sessionId={sessionId} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
