"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, RotateCcw, Tags } from "lucide-react";
import { useCallStore } from "@/lib/callStore";
import Button from "@/components/ui/Button";
import HandTimer from "@/components/ui/HandTimer";
import { SoundWavesDoodle, QuestionDoodle } from "@/components/doodles/Doodles";
import { getTag, tagNote } from "@/lib/tags";
import { joinQueue as joinMatchQueue, pollMatch, leaveQueue as leaveMatchQueue, MatchingNotSetUpError } from "@/lib/matching";
import { DEMO_MODE, SIMULATED_CALL_PREFIX, demoMatchDelayMs } from "@/lib/demo";

const WAIT_SECONDS = 45;   // after this, offer Retry or Choose another tag
const POLL_MS = 2000;
const MATCHED_PAUSE_MS = 1400; // show "found someone!" briefly before the call opens

// In demo mode nothing is queued on the server, so there's nothing to leave
const leaveQueue = () => { if (!DEMO_MODE) leaveMatchQueue(); };

type Status = "searching" | "matched" | "no-match" | "not-set-up" | "error";

function formatElapsed(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

export default function QueuePage() {
  const router = useRouter();
  const {
    selectedTag, countryFilter, languageFilter, queueElapsed,
    joinQueue, cancelQueue, matchFound, connectionEstablished, incrementQueueElapsed,
  } = useCallStore();
  const [status, setStatus] = useState<Status>("searching");
  const [attempt, setAttempt] = useState(0);
  const matchedRef = useRef(false);

  const tag = getTag(selectedTag);

  useEffect(() => {
    if (!tag) {
      router.replace("/intent");
      return;
    }

    let cancelled = false;
    let seconds = 0;
    matchedRef.current = false;
    joinQueue();

    const stop = () => {
      cancelled = true;
      clearInterval(tick);
    };

    // Count up; at 45 s give up on this round and let the person decide
    const tick = setInterval(() => {
      seconds += 1;
      incrementQueueElapsed();
      if (seconds >= WAIT_SECONDS && !matchedRef.current) {
        stop();
        leaveQueue();
        setStatus("no-match");
      }
    }, 1000);

    // Demo mode: "find" a simulated stranger on the same tag after a few seconds
    if (DEMO_MODE) {
      let openTimer: ReturnType<typeof setTimeout> | undefined;
      const findTimer = setTimeout(() => {
        if (cancelled) return;
        matchedRef.current = true;
        stop();
        setStatus("matched");
        const callId = `${SIMULATED_CALL_PREFIX}${Date.now()}`;
        openTimer = setTimeout(() => {
          matchFound(callId, tag.slug);
          connectionEstablished();
          router.push(`/call/${callId}`);
        }, MATCHED_PAUSE_MS);
      }, demoMatchDelayMs());
      return () => {
        clearTimeout(findTimer);
        clearTimeout(openTimer);
        stop();
      };
    }

    (async () => {
      try {
        let callId = await joinMatchQueue(tag.slug, countryFilter, languageFilter);
        while (!cancelled && !callId) {
          await new Promise(r => setTimeout(r, POLL_MS));
          if (cancelled) return;
          callId = await pollMatch();
        }
        if (cancelled || !callId) return;

        matchedRef.current = true;
        stop();
        matchFound(callId, tag.slug);
        connectionEstablished();
        router.push(`/call/${callId}`);
      } catch (e) {
        if (cancelled) return;
        stop();
        setStatus(e instanceof MatchingNotSetUpError ? "not-set-up" : "error");
      }
    })();

    return () => {
      // Leaving the page while still waiting: take this device out of the queue
      if (!matchedRef.current) leaveQueue();
      stop();
    };
    // Re-run only when the person retries; tag and filters are fixed for this screen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const handleCancel = () => {
    cancelQueue();
    router.push("/intent");
  };

  const handleRetry = () => {
    setStatus("searching");
    setAttempt(a => a + 1);
  };

  // Practice option when nobody is around (labelled demo bot, not a real person)
  const handleDemoBot = () => {
    if (!tag) return;
    const botId = `bot_${Date.now()}`;
    matchFound(botId, tag.slug);
    connectionEstablished();
    router.push(`/call/${botId}`);
  };

  if (!tag) return null;

  const tagNoteClass = tagNote(tag.slug);

  return (
    <div className="min-h-screen bg-dots flex flex-col items-center justify-center px-4 py-12">
      {status === "searching" && (
        <div className="flex flex-col items-center gap-7 max-w-[400px] text-center animate-fade-in">
          <span className="font-hand text-[30px] text-marker -rotate-2">
            {queueElapsed > 25 ? "still looking, hang tight…" : "finding someone…"}
          </span>

          {/* Elapsed time inside the hand-drawn circle; the marker ring empties as the 45 s run out */}
          <div className="flex items-center gap-2">
            <SoundWavesDoodle size={40} flip className="text-primary" />
            <div className="relative" aria-live="polite" aria-label={`Searching for ${formatElapsed(queueElapsed)}`}>
              <svg viewBox="0 0 220 220" className="absolute -inset-5 w-[calc(100%+40px)] h-[calc(100%+40px)] text-primary/40 anim-spin-slow" aria-hidden="true">
                <circle cx="110" cy="110" r="104" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 12" strokeLinecap="round" />
              </svg>
              <HandTimer
                value={formatElapsed(queueElapsed)}
                caption="searching"
                progress={Math.max(0, 1 - queueElapsed / WAIT_SECONDS)}
                size={180}
              />
            </div>
            <SoundWavesDoodle size={40} className="text-primary" />
          </div>

          {/* What we're matching on */}
          <div className={`${tagNoteClass} shadow-note px-6 py-4 note-tilt anim-note-drop`} style={{ "--tilt": "1deg", "--delay": "0.2s" } as React.CSSProperties}>
            <p className="text-[13px] font-bold text-ink/70">Looking for someone on</p>
            <p className="font-hand font-bold text-[32px] leading-none mt-1">#{tag.label}</p>
            {(countryFilter || languageFilter) && (
              <p className="mt-1 text-[12px] font-bold text-ink/70">{[countryFilter, languageFilter].filter(Boolean).join(" · ")}</p>
            )}
          </div>

          <Button variant="secondary" onClick={handleCancel} id="cancel-queue-btn">
            <X size={16} />
            Cancel
          </Button>

          <p className="text-[14px] text-muted">
            You&apos;ll only be connected with someone who picked #{tag.label}.
          </p>
        </div>
      )}

      {status === "matched" && (
        <div className="flex flex-col items-center gap-6 max-w-[400px] text-center animate-fade-in" role="status">
          <span className="font-hand text-[34px] text-live -rotate-2">found someone!</span>
          <HandTimer value="✓" caption="matched" progress={1} size={160} />
          <div className={`${tagNoteClass} shadow-note px-6 py-4 note-tilt anim-note-drop`} style={{ "--tilt": "-1deg" } as React.CSSProperties}>
            <p className="text-[13px] font-bold text-ink/70">You&apos;re both on</p>
            <p className="font-hand font-bold text-[32px] leading-none mt-1">#{tag.label}</p>
          </div>
          <p className="text-[14px] text-muted">Connecting your call…</p>
        </div>
      )}

      {status === "no-match" && (
        <div className="flex flex-col items-center gap-5 max-w-[420px] text-center animate-fade-in">
          <div className="relative">
            <QuestionDoodle size={34} className="absolute -top-5 -right-7 text-marker anim-wiggle" />
            <div className={`${tagNoteClass} shadow-note px-6 py-5 note-tilt anim-note-drop`} style={{ "--tilt": "-2deg" } as React.CSSProperties}>
              <p className="font-hand font-bold text-[30px] leading-none">nobody on #{tag.label} yet</p>
            </div>
          </div>
          <p className="text-[16px] text-muted leading-relaxed">
            No one picked <strong className="text-ink">#{tag.label}</strong> in the last {WAIT_SECONDS} seconds.
            Try again, or choose a busier tag.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button variant="primary" size="lg" onClick={handleRetry} id="queue-retry-btn">
              <RotateCcw size={18} />
              Retry
            </Button>
            <Button variant="secondary" size="lg" onClick={() => router.push("/intent")} id="queue-change-tag-btn">
              <Tags size={18} />
              Choose another tag
            </Button>
          </div>
          <button onClick={handleDemoBot} className="min-h-[44px] text-[14px] font-bold text-muted hover:text-ink underline underline-offset-4">
            or practise with the demo bot
          </button>
        </div>
      )}

      {status === "not-set-up" && (
        <div className="flex flex-col items-center gap-5 max-w-[440px] text-center">
          <div className="bg-note-orange shadow-note px-6 py-5 -rotate-2">
            <p className="font-hand font-bold text-[30px] leading-none">matching isn&apos;t switched on yet</p>
          </div>
          <p className="text-[15px] text-muted leading-relaxed">
            Real same-tag matching needs a one-time database setup. Until then, you can still try a call with the demo bot.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button variant="primary" onClick={handleDemoBot}>Talk to the demo bot</Button>
            <Link href="/intent" className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-[12px] border-2 border-outline font-bold hover:bg-paper-2">Back</Link>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-5 max-w-[360px] text-center">
          <div className="bg-note-pink shadow-note px-6 py-5 -rotate-2">
            <p className="font-hand font-bold text-[32px] leading-none">connection failed</p>
          </div>
          <p className="text-[15px] text-muted">We couldn&apos;t reach the matching service. Check your internet and try again.</p>
          <div className="flex gap-3 w-full">
            <Button variant="secondary" onClick={handleCancel} className="flex-1" id="queue-back-btn">Back</Button>
            <Button variant="primary" onClick={handleRetry} className="flex-1">Retry</Button>
          </div>
        </div>
      )}
    </div>
  );
}
