"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import TopNav from "@/components/layout/TopNav";
import AdSlot from "@/components/ui/AdSlot";
import { MOCK_SESSIONS, formatDuration, formatCallDate } from "@/lib/mockData";
import { clsx } from "clsx";

const INTENT_COLORS: Record<string, string> = {
  "Pitch My Idea": "bg-[rgba(124,92,252,0.1)] text-[#7C5CFC]",
  "Give Feedback": "bg-[rgba(34,197,94,0.1)] text-[#22C55E]",
  "Open Discussion": "bg-[rgba(245,158,11,0.1)] text-[#F59E0B]",
  "Founder Chat": "bg-[rgba(100,116,139,0.1)] text-[#64748B]",
};

const END_REASON_LABELS: Record<string, string> = {
  hangup: "Ended",
  skip: "Skipped",
  report: "Reported",
  drop: "Disconnected",
  timeout: "Timed out",
};

export default function HistoryPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <TopNav />

      <main className="flex-1 container-app max-w-[640px] py-8 px-4">
        <div className="mb-6">
          <h1 className="text-[1.75rem] font-bold text-[#18181B]">Call History</h1>
          <p className="text-[14px] text-[#71717A] mt-0.5">
            {MOCK_SESSIONS.length} past conversation{MOCK_SESSIONS.length !== 1 ? "s" : ""}
          </p>
        </div>

        {MOCK_SESSIONS.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(124,92,252,0.1)] flex items-center justify-center">
              <Clock size={28} className="text-[#7C5CFC]" />
            </div>
            <div>
              <p className="text-[16px] font-semibold text-[#18181B] mb-1">No conversations yet</p>
              <p className="text-[14px] text-[#71717A]">Your call history will show up here.</p>
            </div>
            <Link
              href="/intent"
              className="px-5 py-2.5 text-[14px] font-semibold text-white bg-[#7C5CFC] hover:bg-[#6547E0] rounded-full transition-colors"
              id="history-start-talking"
            >
              Start Talking
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {MOCK_SESSIONS.map(session => {
              const isExpanded = expandedId === session.id;
              const intentColor = INTENT_COLORS[session.myIntentTag] || "bg-[#F4F4F5] text-[#71717A]";

              return (
                <div
                  key={session.id}
                  className="bg-white border border-[#E5E5E8] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden"
                >
                  {/* Row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : session.id)}
                    className="w-full flex items-center gap-4 px-4 py-4 hover:bg-[#FAFAFA] transition-colors text-left"
                    aria-expanded={isExpanded}
                    aria-label={`${session.myIntentTag} call, ${formatDuration(session.durationSeconds)} — ${isExpanded ? "collapse" : "expand"} details`}
                  >
                    {/* Duration */}
                    <div className="flex flex-col items-center shrink-0 w-12">
                      <span className="text-[16px] font-bold text-[#18181B] font-mono tabular-nums">
                        {formatDuration(session.durationSeconds)}
                      </span>
                      <span className="text-[10px] text-[#71717A] uppercase tracking-wide">min</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={clsx("text-[11px] font-semibold px-2 py-0.5 rounded-full", intentColor)}>
                          {session.myIntentTag}
                        </span>
                        {session.contactAdded && (
                          <span className="flex items-center gap-1 text-[11px] text-[#22C55E]">
                            <UserPlus size={11} /> Added
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#71717A] mt-1">{formatCallDate(session.startedAt)}</p>
                    </div>

                    {/* End reason + expand */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[12px] text-[#71717A]">{END_REASON_LABELS[session.endReason] ?? session.endReason}</span>
                      {isExpanded ? <ChevronUp size={16} className="text-[#71717A]" /> : <ChevronDown size={16} className="text-[#71717A]" />}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-[#F4F4F5] animate-fade-in">
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="text-[12px] text-[#71717A]">
                          <p className="font-medium text-[#18181B] mb-0.5">My intent</p>
                          {session.myIntentTag}
                        </div>
                        <div className="text-[12px] text-[#71717A]">
                          <p className="font-medium text-[#18181B] mb-0.5">Their intent</p>
                          {session.matchIntentTag}
                        </div>
                        <div className="text-[12px] text-[#71717A]">
                          <p className="font-medium text-[#18181B] mb-0.5">Duration</p>
                          {formatDuration(session.durationSeconds)}
                        </div>
                        <div className="text-[12px] text-[#71717A]">
                          <p className="font-medium text-[#18181B] mb-0.5">Ended</p>
                          {END_REASON_LABELS[session.endReason] ?? session.endReason}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#71717A] mt-3">
                        No audio or transcript retained — text only, per our Privacy Policy.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Load more placeholder */}
            <button className="w-full py-3 text-[14px] text-[#7C5CFC] hover:text-[#6547E0] font-medium transition-colors" id="history-load-more">
              Load more
            </button>
          </div>
        )}

        <div className="mt-8">
          <AdSlot height={90} />
        </div>
      </main>
    </div>
  );
}
