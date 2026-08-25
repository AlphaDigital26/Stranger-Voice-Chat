"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ThumbsUp, ThumbsDown, UserPlus, MessageSquare, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import AdSlot from "@/components/ui/AdSlot";
import TopNav from "@/components/layout/TopNav";
import { useCallStore } from "@/lib/callStore";
import { formatDuration } from "@/lib/mockData";
import { useToast } from "@/components/ui/Toast";

export default function PostCallPage() {
  const router = useRouter();
  const params = useParams();
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
    ? "Your report has been submitted."
    : endReason === "drop"
    ? "Call disconnected"
    : "Call ended";

  const subtext = isReported
    ? "Our team will review it shortly."
    : duration >= 60
    ? `You talked for ${formatDuration(duration)}`
    : duration > 0
    ? `Short conversation — ${formatDuration(duration)}`
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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <TopNav />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px] flex flex-col gap-5 animate-fade-in">

          {/* Summary card */}
          <div className="bg-white border border-[#E5E5E8] rounded-[16px] p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            {/* Icon */}
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isReported ? "bg-[#FEF2F2]" : "bg-[rgba(124,92,252,0.1)]"}`}>
              {isReported
                ? <AlertTriangle size={24} className="text-[#EF4444]" />
                : <CheckCircle size={24} className="text-[#7C5CFC]" />
              }
            </div>

            <h1 className="text-[20px] font-bold text-[#18181B] mb-1">{headline}</h1>
            {subtext && <p className="text-[14px] text-[#71717A]">{subtext}</p>}
          </div>

          {/* Add Contact (second chance — only if not already added) */}
          {!localContactDone && !isReported && (
            <div className="bg-white border border-[#E5E5E8] rounded-[12px] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(124,92,252,0.1)] flex items-center justify-center shrink-0">
                <UserPlus size={18} className="text-[#7C5CFC]" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-medium text-[#18181B]">Stay connected?</p>
                <p className="text-[12px] text-[#71717A]">Add Stranger #4821 as a contact.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleAddContact} id="post-call-add-contact">
                Add
              </Button>
            </div>
          )}
          {localContactDone && !isReported && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#F0FDF4] border border-[#22C55E]/30 rounded-[12px]">
              <CheckCircle size={16} className="text-[#22C55E]" />
              <p className="text-[13px] text-[#22C55E] font-medium">Connected with Stranger #4821</p>
            </div>
          )}

          {/* Micro-survey */}
          {!surveyDone && !isReported && (
            <div className="bg-white border border-[#E5E5E8] rounded-[12px] p-4">
              <p className="text-[14px] font-medium text-[#18181B] mb-3 text-center">
                Was this conversation useful?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleFeedback("up")}
                  aria-label="Thumbs up — useful conversation"
                  className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-[10px] border-2 transition-all ${feedbackGiven === "up" ? "border-[#22C55E] bg-[#F0FDF4]" : "border-[#E5E5E8] hover:border-[#22C55E]/50"}`}
                >
                  <ThumbsUp size={22} className={feedbackGiven === "up" ? "text-[#22C55E]" : "text-[#71717A]"} />
                  <span className="text-[12px] text-[#71717A]">Yes</span>
                </button>
                <button
                  onClick={() => handleFeedback("down")}
                  aria-label="Thumbs down — not useful"
                  className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-[10px] border-2 transition-all ${feedbackGiven === "down" ? "border-[#EF4444] bg-[#FEF2F2]" : "border-[#E5E5E8] hover:border-[#EF4444]/50"}`}
                >
                  <ThumbsDown size={22} className={feedbackGiven === "down" ? "text-[#EF4444]" : "text-[#71717A]"} />
                  <span className="text-[12px] text-[#71717A]">No</span>
                </button>
              </div>
            </div>
          )}
          {surveyDone && (
            <div className="flex items-center justify-center gap-2 text-[13px] text-[#71717A]">
              <CheckCircle size={14} className="text-[#22C55E]" />
              Thanks for the feedback!
            </div>
          )}

          {/* Primary actions */}
          <div className="flex flex-col gap-2">
            <Button variant="primary" size="lg" pill onClick={handleTalkNew} className="w-full" id="talk-someone-new-btn">
              Talk to Someone New <ArrowRight size={16} />
            </Button>
            <Button variant="secondary" size="lg" pill onClick={() => router.push("/intent")} className="w-full" id="go-home-btn">
              Go Home
            </Button>
          </div>

          {/* Quick nav */}
          <div className="flex justify-center gap-4 text-[13px] text-[#71717A]">
            <Link href="/history" className="flex items-center gap-1 hover:text-[#7C5CFC] transition-colors">
              <MessageSquare size={13} /> Call History
            </Link>
            <Link href="/contacts" className="flex items-center gap-1 hover:text-[#7C5CFC] transition-colors">
              <UserPlus size={13} /> Contacts
            </Link>
          </div>

          {/* Ad slot — eligible screen */}
          <AdSlot height={90} />
        </div>
      </main>
    </div>
  );
}
