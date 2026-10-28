"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import { ChatDoodle } from "@/components/doodles/Doodles";
import TopNav from "@/components/layout/TopNav";
import AdSlot from "@/components/ui/AdSlot";
import { MOCK_SESSIONS, formatDuration, formatCallDate } from "@/lib/mockData";
import { clsx } from "clsx";

// Same sticky-note colour per intent as the intent picker
const INTENT_NOTES: Record<string, string> = {
  "Pitch My Idea": "bg-note-yellow",
  "Give Feedback": "bg-note-pink",
  "Open Discussion": "bg-note-blue",
  "Founder Chat": "bg-note-green",
};

const END_REASON_LABELS: Record<string, string> = {
  hangup: "Ended",
  skip: "Skipped",
  report: "Reported",
  drop: "Disconnected",
  timeout: "Timed out",
};

const PAGE_SIZE = 4;

export default function HistoryPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const visibleSessions = MOCK_SESSIONS.slice(0, visibleCount);
  const hasMore = visibleCount < MOCK_SESSIONS.length;

  // TODO: fetch the next page from Supabase (Step 4); for now reveal more mock rows
  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(c => Math.min(c + PAGE_SIZE, MOCK_SESSIONS.length));
      setLoadingMore(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-dots flex flex-col">
      <TopNav />

      <main className="flex-1 container-app max-w-[680px] py-10">
        <span className="font-hand text-[26px] text-marker">your past talks</span>
        <h1 className="mt-1 text-[2.25rem] font-extrabold tracking-tight leading-tight">Call history</h1>
        <p className="mt-1 text-[15px] text-muted">
          {MOCK_SESSIONS.length} past conversation{MOCK_SESSIONS.length !== 1 ? "s" : ""}
        </p>

        {MOCK_SESSIONS.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-5 py-12 text-center">
            <div className="bg-note-blue shadow-note px-7 py-6 rotate-2">
              <ChatDoodle size={44} draw className="mx-auto" />
              <p className="mt-2 font-hand font-bold text-[28px] leading-none">nothing here yet</p>
            </div>
            <p className="text-[15px] text-muted">Your calls will show up here.</p>
            <Link
              href="/intent"
              className="px-6 py-3 text-[15px] font-bold text-on-primary bg-primary hover:bg-primary-hover rounded-[12px] transition-colors"
              id="history-start-talking"
            >
              Start talking
            </Link>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            {visibleSessions.map((session, i) => {
              const isExpanded = expandedId === session.id;
              const note = INTENT_NOTES[session.myIntentTag] || "bg-paper-2";

              return (
                <div
                  key={session.id}
                  className="bg-surface border-2 border-outline rounded-[16px] overflow-hidden anim-rise-in"
                  // Newly loaded rows rise in one after another
                  style={{ "--delay": `${(i % PAGE_SIZE) * 0.06}s` } as React.CSSProperties}
                >
                  {/* Row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : session.id)}
                    className="w-full flex items-center gap-4 px-4 py-4 hover:bg-paper-2 transition-colors text-left"
                    aria-expanded={isExpanded}
                    aria-label={`${session.myIntentTag} call, ${formatDuration(session.durationSeconds)} — ${isExpanded ? "collapse" : "expand"} details`}
                  >
                    {/* Duration */}
                    <div className="flex flex-col items-center shrink-0 w-14">
                      <span className="text-[18px] font-extrabold tabular-nums">
                        {formatDuration(session.durationSeconds)}
                      </span>
                      <span className="text-[11px] font-bold text-muted uppercase tracking-wide">min</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={clsx("text-[13px] font-bold px-2.5 py-1 -rotate-1", note)}>
                          {session.myIntentTag}
                        </span>
                        {session.contactAdded && (
                          <span className="flex items-center gap-1 text-[13px] font-bold text-live">
                            <UserPlus size={13} /> Added
                          </span>
                        )}
                      </div>
                      {/* Timestamps can legitimately differ between server and browser (time zone, clock) */}
                      <p className="text-[13px] text-muted mt-1.5" suppressHydrationWarning>{formatCallDate(session.startedAt)}</p>
                    </div>

                    {/* End reason + expand */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[13px] text-muted">{END_REASON_LABELS[session.endReason] ?? session.endReason}</span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t-2 border-dashed border-line animate-fade-in">
                      <dl className="grid grid-cols-2 gap-3 mt-3 text-[14px]">
                        <div>
                          <dt className="font-bold">My intent</dt>
                          <dd className="text-muted">{session.myIntentTag}</dd>
                        </div>
                        <div>
                          <dt className="font-bold">Their intent</dt>
                          <dd className="text-muted">{session.matchIntentTag}</dd>
                        </div>
                        <div>
                          <dt className="font-bold">Duration</dt>
                          <dd className="text-muted">{formatDuration(session.durationSeconds)}</dd>
                        </div>
                        <div>
                          <dt className="font-bold">Ended</dt>
                          <dd className="text-muted">{END_REASON_LABELS[session.endReason] ?? session.endReason}</dd>
                        </div>
                      </dl>
                      <p className="text-[12px] text-muted mt-3">
                        No audio or transcript is kept, per our Privacy Policy.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="mt-2 self-center inline-flex items-center gap-2 min-h-[48px] px-6 text-[15px] font-bold border-2 border-outline rounded-[12px] bg-surface hover:bg-paper-2 disabled:opacity-60 transition-colors"
                id="history-load-more"
              >
                {loadingMore && (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                )}
                {loadingMore ? "Loading…" : `Load more (${MOCK_SESSIONS.length - visibleCount} left)`}
              </button>
            ) : (
              <p className="mt-2 text-center font-hand text-[24px] text-muted">that&apos;s all your calls</p>
            )}
          </div>
        )}

        <div className="mt-10">
          <AdSlot height={90} variant={4} />
        </div>
      </main>
    </div>
  );
}
