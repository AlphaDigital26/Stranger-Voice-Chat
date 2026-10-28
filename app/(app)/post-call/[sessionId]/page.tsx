"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ThumbsUp, ThumbsDown, UserPlus, MessageSquare, ArrowRight, CheckCircle } from "lucide-react";
import { clsx } from "clsx";
import Button from "@/components/ui/Button";
import AdSlot from "@/components/ui/AdSlot";
import TopNav from "@/components/layout/TopNav";
import { useCallStore } from "@/lib/callStore";
import { formatDuration } from "@/lib/mockData";
import { useToast } from "@/components/ui/Toast";
import { SparkleDoodle } from "@/components/doodles/Doodles";

export default function PostCallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReported = searchParams.get("reported") === "true";
  const { currentSession, contactAdded, sendContactRequest, confirmContactAdded, resetToIdle } = useCallStore();
  const { toast } = useToast();

  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | null>(null);
  const [surveyDone, setSurveyDone] = useState(false);
  const [localContactDone, setLocalContactDone] = useState(contactAdded);

  const duration = currentSession?.durationSeconds ?? 0;
  const endReason = currentSession?.endReason ?? "hangup";

  const headline = isReported
    ? "Report sent."
    : endReason === "drop"
    ? "Call disconnected"
    : "Call ended";

  const subtext = isReported
    ? "Thanks for flagging it. Our team will review it, and you won't be matched with this person again."
    : duration >= 60
    ? `You talked for ${formatDuration(duration)}.`
    : duration > 0
    ? `Short one: ${formatDuration(duration)}.`
    : "";

  const handleFeedback = (val: "up" | "down") => {
    setFeedbackGiven(val);
    setTimeout(() => setSurveyDone(true), 400);
    toast("Thanks for the feedback!", "success");
  };

  const handleAddContact = () => {
    sendContactRequest();
    setTimeout(() => {
      confirmContactAdded();
      setLocalContactDone(true);
      toast("You're now connected with Stranger #4821", "success");
    }, 1200);
  };

  const handleTalkNew = () => {
    resetToIdle();
    router.push("/intent");
  };

  return (
    <div className="min-h-screen bg-dots flex flex-col">
      <TopNav />

      <main className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-[460px] flex flex-col gap-5 animate-fade-in">

          {/* Summary note — drops in; a few sparkles pop around a normal ending */}
          <div className="relative">
            {!isReported && (
              <>
                <SparkleDoodle size={30} className="absolute -top-4 -left-2 z-10 text-marker anim-pop-in" style={{ "--delay": "0.5s" } as React.CSSProperties} />
                <SparkleDoodle size={22} className="absolute -top-3 right-6 z-10 text-primary anim-pop-in" style={{ "--delay": "0.65s" } as React.CSSProperties} />
                <SparkleDoodle size={26} className="absolute -bottom-3 right-0 z-10 text-highlight anim-pop-in" style={{ "--delay": "0.8s" } as React.CSSProperties} />
              </>
            )}
          <div
            className={clsx("shadow-note p-7 text-center note-tilt anim-note-drop", isReported ? "bg-note-pink" : "bg-note-yellow")}
            style={{ "--tilt": "-1deg" } as React.CSSProperties}
          >
            <span className="font-hand text-[26px] text-marker leading-none">{isReported ? "got it" : "that's a wrap"}</span>
            <h1 className="mt-1 text-[2rem] font-extrabold tracking-tight leading-tight">{headline}</h1>
            {subtext && <p className="mt-2 text-[15px] text-ink/80">{subtext}</p>}
          </div>
          </div>

          {/* Add contact (second chance — only if not already added) */}
          {!localContactDone && !isReported && (
            <div className="bg-surface border-2 border-outline rounded-[16px] p-4 flex items-center gap-3">
              <span className="w-11 h-11 bg-note-blue flex items-center justify-center shrink-0 -rotate-3" aria-hidden="true">
                <UserPlus size={20} />
              </span>
              <div className="flex-1">
                <p className="text-[15px] font-bold">Stay in touch?</p>
                <p className="text-[13px] text-muted">Add Stranger #4821 as a contact.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleAddContact} id="post-call-add-contact">
                Add
              </Button>
            </div>
          )}
          {localContactDone && !isReported && (
            <div className="flex items-center gap-2 px-4 py-3 bg-live-soft border-2 border-live rounded-[12px]">
              <CheckCircle size={18} className="text-live" />
              <p className="text-[14px] text-live font-bold">Connected with Stranger #4821</p>
            </div>
          )}

          {/* Micro-survey */}
          {!surveyDone && !isReported && (
            <div className="bg-surface border-2 border-outline rounded-[16px] p-5">
              <p className="text-[16px] font-bold text-center">Was this conversation useful?</p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  onClick={() => handleFeedback("up")}
                  aria-label="Thumbs up — useful conversation"
                  className={clsx(
                    "flex flex-col items-center gap-1.5 w-24 py-3 rounded-[12px] border-2 transition-colors",
                    feedbackGiven === "up" ? "border-live bg-live-soft text-live" : "border-line hover:border-outline"
                  )}
                >
                  <ThumbsUp size={22} />
                  <span className="text-[14px] font-bold">Yes</span>
                </button>
                <button
                  onClick={() => handleFeedback("down")}
                  aria-label="Thumbs down — not useful"
                  className={clsx(
                    "flex flex-col items-center gap-1.5 w-24 py-3 rounded-[12px] border-2 transition-colors",
                    feedbackGiven === "down" ? "border-danger bg-danger-soft text-danger" : "border-line hover:border-outline"
                  )}
                >
                  <ThumbsDown size={22} />
                  <span className="text-[14px] font-bold">No</span>
                </button>
              </div>
            </div>
          )}
          {surveyDone && (
            <p className="text-center font-hand text-[24px] text-primary">thanks for the feedback!</p>
          )}

          {/* Primary actions */}
          <div className="flex flex-col gap-2">
            <Button variant="primary" size="lg" onClick={handleTalkNew} className="w-full" id="talk-someone-new-btn">
              Talk to someone new <ArrowRight size={18} />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => router.push("/intent")} className="w-full" id="go-home-btn">
              Done for now
            </Button>
          </div>

          {/* Quick nav */}
          <div className="flex justify-center gap-6 text-[14px] font-bold">
            <Link href="/history" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <MessageSquare size={15} /> Call history
            </Link>
            <Link href="/contacts" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <UserPlus size={15} /> Contacts
            </Link>
          </div>

          {/* Ad slot — eligible screen, below all actions */}
          <AdSlot height={90} variant={2} />
        </div>
      </main>
    </div>
  );
}
