"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Globe, Zap } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import TopNav from "@/components/layout/TopNav";
import IntentCard, { INTENT_TAGS, IntentTagSlug } from "@/components/intent/IntentCard";
import Button from "@/components/ui/Button";
import AdSlot from "@/components/ui/AdSlot";
import { useCallStore } from "@/lib/callStore";
import { useAuth } from "@/lib/mockAuth";

type MicState = "prompt" | "granted" | "denied" | "unavailable";

const COUNTRIES = ["Worldwide", "United States", "India", "United Kingdom", "Canada", "Australia", "Germany", "France"];
const LANGUAGES = ["Any language", "English", "Hindi", "Spanish", "French", "German", "Portuguese"];

export default function IntentPage() {
  const router = useRouter();
  const { user } = useAuth();
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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <TopNav />

      <main className="flex-1 flex flex-col items-center justify-start py-10 px-4">
        <div className="w-full max-w-[520px]">

          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="text-[1.75rem] font-bold text-[#18181B] mb-2">What are you here for?</h1>
            <p className="text-[14px] text-[#71717A]">
              Pick your intent and we'll match you with the right person.
            </p>
          </div>

          {/* Intent tag selector */}
          <motion.div
            role="radiogroup"
            aria-label="Select your conversation intent"
            className="flex flex-col gap-3 mb-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            {INTENT_TAGS.map(tag => (
              <motion.div
                key={tag.slug}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
              >
                <IntentCard
                  {...tag}
                  isSelected={selectedIntent === tag.slug}
                  onSelect={setIntent}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Filters (collapsed by default) */}
          <div className="mb-5">
            <button
              onClick={() => setFiltersOpen(v => !v)}
              className="flex items-center gap-1.5 text-[13px] text-[#71717A] hover:text-[#18181B] transition-colors"
              aria-expanded={filtersOpen}
            >
              <Globe size={14} />
              Filters
              {filtersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {filtersOpen && (
              <div className="mt-3 flex gap-3 flex-wrap animate-fade-in">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-medium text-[#71717A]">Country</label>
                  <select
                    value={countryFilter || "Worldwide"}
                    onChange={e => setCountryFilter(e.target.value === "Worldwide" ? null : e.target.value)}
                    className="px-3 py-1.5 text-[13px] text-[#18181B] bg-white border border-[#E5E5E8] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/40"
                    aria-label="Filter by country"
                  >
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-medium text-[#71717A]">Language</label>
                  <select
                    value={languageFilter || "Any language"}
                    onChange={e => setLanguageFilter(e.target.value === "Any language" ? null : e.target.value)}
                    className="px-3 py-1.5 text-[13px] text-[#18181B] bg-white border border-[#E5E5E8] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/40"
                    aria-label="Filter by language"
                  >
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Mic status indicator */}
          <div
            className={clsx(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] mb-5 border",
              micState === "granted" && "bg-[#F0FDF4] border-[#22C55E]/30",
              micState === "denied" && "bg-[#FEF2F2] border-[#EF4444]/30",
              micState === "prompt" && "bg-[rgba(124,92,252,0.05)] border-[rgba(124,92,252,0.2)]"
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
            {micState === "granted" && <CheckCircle size={16} className="text-[#22C55E] shrink-0" />}
            {micState === "denied" && <MicOff size={16} className="text-[#EF4444] shrink-0" />}
            {micState === "prompt" && <Mic size={16} className="text-[#7C5CFC] shrink-0" />}

            <div className="flex-1">
              {micState === "granted" && (
                <p className="text-[13px] font-medium text-[#22C55E]">Microphone ready ✓</p>
              )}
              {micState === "denied" && (
                <>
                  <p className="text-[13px] font-medium text-[#EF4444]">Microphone access denied</p>
                  <p className="text-[12px] text-[#71717A] mt-0.5">Enable it in your browser settings and refresh.</p>
                </>
              )}
              {micState === "prompt" && (
                <p className="text-[13px] text-[#7C5CFC]">Microphone access needed</p>
              )}
            </div>

            {micState === "prompt" && (
              <button
                onClick={requestMic}
                className="text-[12px] font-semibold text-[#7C5CFC] hover:underline shrink-0"
              >
                Grant Access
              </button>
            )}
          </div>

          {/* Start button or freemium gate */}
          {isFreeTierLimitHit ? (
            <div className="bg-white border border-[#E5E5E8] rounded-[12px] p-5 text-center">
              <p className="text-[15px] font-semibold text-[#18181B] mb-1">You've reached today's limit</p>
              <p className="text-[13px] text-[#71717A] mb-4">Free accounts get 5 conversations per day.</p>
              <Button variant="primary" size="lg" pill className="w-full" id="upgrade-cta">
                <Zap size={16} /> Upgrade to Keep Talking
              </Button>
              <button className="mt-3 text-[13px] text-[#71717A] hover:text-[#18181B]">Come back tomorrow</button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              pill
              disabled={!canStart}
              onClick={handleStart}
              className="w-full"
              id="start-talking-btn"
            >
              {!selectedIntent
                ? "Select an intent to continue"
                : micState !== "granted"
                ? "Grant microphone access first"
                : "Start Talking"}
            </Button>
          )}

          {/* Validation hints */}
          {!selectedIntent && (
            <p className="text-center text-[12px] text-[#71717A] mt-2">
              Pick one of the options above to continue
            </p>
          )}

          {/* Ad slot — below the primary CTA, cannot cause accidental click */}
          <div className="mt-8">
            <AdSlot height={90} />
          </div>
        </div>
      </main>
    </div>
  );
}
