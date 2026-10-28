"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, CheckCircle, ChevronDown, ChevronUp, Globe, Zap } from "lucide-react";
import { clsx } from "clsx";
import TopNav from "@/components/layout/TopNav";
import IntentCard, { INTENT_TAGS } from "@/components/intent/IntentCard";
import Button from "@/components/ui/Button";
import AdSlot from "@/components/ui/AdSlot";
import { useCallStore } from "@/lib/callStore";
import { BulbDoodle } from "@/components/doodles/Doodles";

type MicState = "prompt" | "granted" | "denied" | "unavailable";

const COUNTRIES = ["Worldwide", "United States", "India", "United Kingdom", "Canada", "Australia", "Germany", "France"];
const LANGUAGES = ["Any language", "English", "Hindi", "Spanish", "French", "German", "Portuguese"];

const selectClass =
  "px-3 py-2 text-[14px] text-ink bg-surface border-2 border-line rounded-[10px] focus:outline-none focus:border-primary";

export default function IntentPage() {
  const router = useRouter();
  const { selectedIntent, setIntent, countryFilter, setCountryFilter, languageFilter, setLanguageFilter } = useCallStore();

  const [micState, setMicState] = useState<MicState>("prompt");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Check mic permission on mount
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then(result => {
        if (result.state === "granted") setMicState("granted");
        else if (result.state === "denied") setMicState("denied");
        result.onchange = () => {
          if (result.state === "granted") setMicState("granted");
          else if (result.state === "denied") setMicState("denied");
        };
      })
      .catch(() => setMicState("prompt"));
  }, []);

  const requestMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicState("granted");
    } catch {
      setMicState("denied");
    }
  };

  const isFreeTierLimitHit = false; // Would be: user?.subscriptionTier === "free" && dailyLimit >= 5
  const canStart = !!selectedIntent && micState === "granted" && !isFreeTierLimitHit;

  const handleStart = () => {
    if (!canStart) return;
    router.push("/queue");
  };

  return (
    <div className="min-h-screen bg-dots flex flex-col">
      <TopNav />

      <main className="flex-1 container-app max-w-[760px] py-10 sm:py-14">
        {/* Headline */}
        <span className="font-hand text-[28px] text-marker -rotate-2 inline-flex items-center gap-2">
          step 1 of 2 <BulbDoodle size={30} draw className="text-marker" />
        </span>
        <h1 className="mt-1 text-[2.25rem] sm:text-[3rem] font-extrabold leading-[1.05] tracking-[-0.03em]">
          What are you here for?
        </h1>
        <p className="mt-3 text-[17px] text-muted">
          Pick one and we&apos;ll match you with the right person.
        </p>

        {/* Intent tag selector */}
        <div
          role="radiogroup"
          aria-label="Select your conversation intent"
          className="mt-8 grid gap-4 sm:grid-cols-2"
        >
          {INTENT_TAGS.map((tag, i) => (
            <div key={tag.slug} className="anim-rise-in" style={{ "--delay": `${0.08 * i}s` } as React.CSSProperties}>
              <IntentCard
                {...tag}
                isSelected={selectedIntent === tag.slug}
                onSelect={setIntent}
              />
            </div>
          ))}
        </div>

        {/* Filters (collapsed by default) */}
        <div className="mt-6">
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className="flex items-center gap-1.5 text-[14px] font-bold text-ink hover:text-primary transition-colors"
            aria-expanded={filtersOpen}
          >
            <Globe size={16} />
            Country &amp; language
            {filtersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {filtersOpen && (
            <div className="mt-3 flex gap-4 flex-wrap animate-fade-in">
              <div className="flex flex-col gap-1">
                <label htmlFor="filter-country" className="text-[13px] font-bold text-muted">Country</label>
                <select
                  id="filter-country"
                  value={countryFilter || "Worldwide"}
                  onChange={e => setCountryFilter(e.target.value === "Worldwide" ? null : e.target.value)}
                  className={selectClass}
                >
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="filter-language" className="text-[13px] font-bold text-muted">Language</label>
                <select
                  id="filter-language"
                  value={languageFilter || "Any language"}
                  onChange={e => setLanguageFilter(e.target.value === "Any language" ? null : e.target.value)}
                  className={selectClass}
                >
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Mic status */}
        <div
          className={clsx(
            "mt-6 flex items-center gap-3 px-4 py-3.5 rounded-[12px] border-2",
            micState === "granted" && "bg-live-soft border-live",
            micState === "denied" && "bg-danger-soft border-danger",
            micState === "prompt" && "bg-surface border-outline"
          )}
          role="status"
          aria-label={
            micState === "granted"
              ? "Microphone ready"
              : micState === "denied"
              ? "Microphone access denied"
              : "Microphone access needed"
          }
        >
          {micState === "granted" && <CheckCircle size={20} className="text-live shrink-0" />}
          {micState === "denied" && <MicOff size={20} className="text-danger shrink-0" />}
          {micState === "prompt" && <Mic size={20} className="text-primary shrink-0" />}

          <div className="flex-1">
            {micState === "granted" && (
              <p className="text-[15px] font-bold text-live">Microphone ready</p>
            )}
            {micState === "denied" && (
              <>
                <p className="text-[15px] font-bold text-danger">Microphone access denied</p>
                <p className="text-[13px] text-muted mt-0.5">Allow it in your browser&apos;s site settings, then refresh this page.</p>
              </>
            )}
            {micState === "prompt" && (
              <p className="text-[15px] font-bold">We need your microphone for voice calls</p>
            )}
          </div>

          {micState === "prompt" && (
            <Button variant="primary" size="sm" onClick={requestMic} className="shrink-0">
              Allow mic
            </Button>
          )}
        </div>

        {/* Start button or freemium gate */}
        <div className="mt-6">
          {isFreeTierLimitHit ? (
            <div className="bg-note-yellow shadow-note p-6 text-center -rotate-1">
              <p className="font-hand font-bold text-[30px] leading-none">That&apos;s today&apos;s 5 talks!</p>
              <p className="mt-2 text-[14px] text-ink/75">Free accounts get 5 conversations per day.</p>
              <Button variant="primary" size="lg" className="w-full mt-4" id="upgrade-cta">
                <Zap size={16} /> Upgrade to keep talking
              </Button>
              <button className="mt-3 text-[14px] font-bold text-ink/75 hover:text-ink">Come back tomorrow</button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              disabled={!canStart}
              onClick={handleStart}
              className="w-full"
              id="start-talking-btn"
            >
              {!selectedIntent
                ? "Pick an option above to continue"
                : micState !== "granted"
                ? "Allow microphone access first"
                : "Find someone →"}
            </Button>
          )}
        </div>

        {/* Ad slot — below the primary CTA, cannot cause accidental click */}
        <div className="mt-10">
          <AdSlot height={90} variant={1} />
        </div>
      </main>
    </div>
  );
}
