"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useCallStore } from "@/lib/callStore";
import { INTENT_TAGS } from "@/components/intent/IntentCard";
import Button from "@/components/ui/Button";
import HandTimer from "@/components/ui/HandTimer";
import { SoundWavesDoodle } from "@/components/doodles/Doodles";
import { botIntentFor } from "@/lib/demoBot";

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

  const intent = INTENT_TAGS.find(t => t.slug === selectedIntent) ?? INTENT_TAGS[2];

  useEffect(() => {
    joinQueue();

    // Increment elapsed counter every second
    timerRef.current = setInterval(() => {
      incrementQueueElapsed();
    }, 1000);

    // Until real matchmaking exists (Step 5), match with the demo bot after 3–6 seconds.
    // The bot takes the role that complements yours (you pitch → it listens).
    const delay = 3000 + Math.random() * 3000;
    matchTimerRef.current = setTimeout(() => {
      const SESSION_ID = `bot_${Date.now()}`;
      matchFound(SESSION_ID, botIntentFor(selectedIntent));
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
    <div className="min-h-screen bg-dots flex flex-col items-center justify-center px-4 py-12">
      {status === "searching" ? (
        <div className="flex flex-col items-center gap-7 max-w-[380px] text-center animate-fade-in">
          <span className="font-hand text-[30px] text-marker -rotate-2">
            {queueElapsed > 20 ? "still looking, hang tight…" : "finding someone…"}
          </span>

          {/* Elapsed time inside the hand-drawn circle, with a slowly turning dashed ring and sound waves */}
          <div className="flex items-center gap-2">
            <SoundWavesDoodle size={40} flip className="text-primary" />
            <div className="relative" aria-live="polite" aria-label={`Searching for ${formatElapsed(queueElapsed)}`}>
              <svg viewBox="0 0 220 220" className="absolute -inset-5 w-[calc(100%+40px)] h-[calc(100%+40px)] text-primary/40 anim-spin-slow" aria-hidden="true">
                <circle cx="110" cy="110" r="104" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 12" strokeLinecap="round" />
              </svg>
              <HandTimer value={formatElapsed(queueElapsed)} caption="searching" size={180} />
            </div>
            <SoundWavesDoodle size={40} className="text-primary" />
          </div>

          {/* What we're matching on */}
          <div className={`${intent.note} shadow-note px-6 py-4 note-tilt anim-note-drop`} style={{ "--tilt": "1deg", "--delay": "0.2s" } as React.CSSProperties}>
            <p className="text-[13px] font-bold text-ink/70">Looking for someone to</p>
            <p className="font-hand font-bold text-[30px] leading-none mt-1">{intent.label}</p>
          </div>

          <Button variant="secondary" onClick={handleCancel} id="cancel-queue-btn">
            <X size={16} />
            Cancel
          </Button>

          <p className="text-[14px] text-muted">
            Tip: you can skip anyone you&apos;re matched with, instantly.
          </p>
        </div>
      ) : (
        // Error state
        <div className="flex flex-col items-center gap-5 max-w-[340px] text-center">
          <div className="bg-note-pink shadow-note px-6 py-5 -rotate-2">
            <p className="font-hand font-bold text-[32px] leading-none">Connection failed</p>
          </div>
          <p className="text-[15px] text-muted">We couldn&apos;t connect you right now. Check your internet and try again.</p>
          <div className="flex gap-3 w-full">
            <Button variant="secondary" onClick={handleCancel} className="flex-1" id="queue-back-btn">Back</Button>
            <Button variant="primary" onClick={handleRetry} className="flex-1" id="queue-retry-btn">Retry</Button>
          </div>
        </div>
      )}
    </div>
  );
}
