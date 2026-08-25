"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useCallStore } from "@/lib/callStore";
import { INTENT_TAGS } from "@/components/intent/IntentCard";
import Button from "@/components/ui/Button";

function formatElapsed(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `0:${sec.toString().padStart(2, "0")}`;
}

export default function QueuePage() {
  const router = useRouter();
  const { selectedIntent, queueElapsed, joinQueue, cancelQueue, matchFound, connectionEstablished, incrementQueueElapsed } = useCallStore();
  const [status, setStatus] = useState<"searching" | "error">("searching");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const matchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const intentLabel = INTENT_TAGS.find(t => t.slug === selectedIntent)?.label ?? "Open Discussion";

  useEffect(() => {
    joinQueue();

    // Increment elapsed counter every second
    timerRef.current = setInterval(() => {
      incrementQueueElapsed();
    }, 1000);

    // Mock match found after 3–8 seconds
    const delay = 3000 + Math.random() * 5000;
    matchTimerRef.current = setTimeout(() => {
      const SESSION_ID = `sess_${Date.now()}`;
      const MATCH_TAGS = ["pitch_idea", "give_feedback", "open_discussion", "founder_chat"] as const;
      const matchTag = MATCH_TAGS[Math.floor(Math.random() * MATCH_TAGS.length)];
      matchFound(SESSION_ID, matchTag);
      // Brief connecting state, then navigate
      setTimeout(() => {
        connectionEstablished();
        router.push(`/call/${SESSION_ID}`);
      }, 600);
    }, delay);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
    cancelQueue();
    router.push("/intent");
  };

  const handleRetry = () => {
    setStatus("searching");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4">
      {status === "searching" ? (
        <div className="flex flex-col items-center gap-8 max-w-[340px] text-center animate-fade-in">

          {/* Searching animation — calm pulse rings */}
          <div className="relative w-40 h-40" aria-hidden="true">
            {/* Outermost ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7C5CFC]/10 to-[#FF6B6B]/10 shadow-[0_0_20px_rgba(124,92,252,0.15)] searching-ring" style={{ animationDelay: "0s" }} />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#7C5CFC]/20 to-[#FF6B6B]/20 shadow-[0_0_15px_rgba(124,92,252,0.2)] searching-ring" style={{ animationDelay: "0.4s" }} />
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#7C5CFC]/35 to-[#FF6B6B]/35 shadow-[0_0_10px_rgba(124,92,252,0.3)] searching-ring" style={{ animationDelay: "0.8s" }} />
            {/* Center waveform bars */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-end gap-[4px] h-10">
                {[0.5, 0.8, 1, 0.8, 0.5, 0.3, 0.5].map((h, i) => (
                  <div
                    key={i}
                    className="w-[4px] rounded-full bg-white shadow-[0_0_6px_rgba(124,92,252,0.6)]"
                    style={{
                      height: `${h * 100}%`,
                      animation: `waveform 1.4s ease-in-out infinite`,
                      animationDelay: `${i * 0.12}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Status text */}
          <div>
            <h1 className="text-[20px] font-bold text-[#18181B] mb-1">
              {queueElapsed > 20 ? "Still looking — hang tight" : "Finding someone to talk to..."}
            </h1>
            <p className="text-[14px] text-[#71717A]">
              Looking for:{" "}
              <span className="font-semibold text-[#7C5CFC]">{intentLabel}</span>
            </p>
          </div>

          {/* Elapsed timer */}
          <div
            className="text-[28px] font-mono font-bold text-[#7C5CFC] tabular-nums"
            aria-live="polite"
            aria-label={`Searching for ${formatElapsed(queueElapsed)}`}
          >
            {formatElapsed(queueElapsed)}
          </div>

          {/* Cancel */}
          <Button variant="secondary" onClick={handleCancel} id="cancel-queue-btn">
            <X size={16} />
            Cancel
          </Button>

          <p className="text-[12px] text-[#71717A]">
            Tip: You can skip anyone you match with instantly.
          </p>
        </div>
      ) : (
        // Error state
        <div className="flex flex-col items-center gap-5 max-w-[320px] text-center">
          <div className="w-14 h-14 rounded-full bg-[#FEF2F2] flex items-center justify-center">
            <X size={24} className="text-[#EF4444]" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-[#18181B] mb-1">Connection failed</h1>
            <p className="text-[14px] text-[#71717A]">We couldn't connect you right now. Please try again.</p>
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="secondary" onClick={handleCancel} className="flex-1" id="queue-back-btn">Back</Button>
            <Button variant="primary" onClick={handleRetry} className="flex-1" id="queue-retry-btn">Retry</Button>
          </div>
        </div>
      )}
    </div>
  );
}
