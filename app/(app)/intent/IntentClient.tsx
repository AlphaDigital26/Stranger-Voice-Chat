"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, CheckCircle, ChevronDown, ChevronUp, Globe, Search, X, Check } from "lucide-react";
import { clsx } from "clsx";
import TopNav from "@/components/layout/TopNav";
import Button from "@/components/ui/Button";
import AdSlot from "@/components/ui/AdSlot";
import { useCallStore } from "@/lib/callStore";
import { BulbDoodle } from "@/components/doodles/Doodles";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { ALL_TAGS, POPULAR_TAGS, TAG_CATEGORIES, getTag, isValidTag, tagNote, type Tag } from "@/lib/tags";
import { fetchTagCounts } from "@/lib/matching";
import { DEMO_MODE, demoTagCounts } from "@/lib/demo";

type MicState = "prompt" | "granted" | "denied" | "unavailable";

const COUNTRIES = ["Worldwide", "India", "United States", "United Kingdom", "UAE", "Canada", "Australia", "Singapore", "Germany"];
const LANGUAGES = ["Any language", "English", "Hindi", "Gujarati", "Marathi", "Tamil", "Telugu", "Bengali", "Spanish", "Arabic"];
const COLLAPSED_COUNT = 12;

const selectClass =
  "w-full px-3 py-2 text-[14px] text-ink bg-surface border-2 border-line rounded-[10px] focus:outline-none focus:border-primary";

function TagChip({
  tag,
  selected,
  waiting,
  onSelect,
}: {
  tag: Tag;
  selected: boolean;
  waiting: number;
  onSelect: (slug: string) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(tag.slug)}
      className={clsx(
        "inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-[10px] border-2 text-[14px] font-bold transition-all",
        selected
          ? clsx(tagNote(tag.slug), "border-ink shadow-note -rotate-1")
          : "bg-surface border-line text-ink hover:border-outline hover:-translate-y-0.5"
      )}
    >
      {selected && <Check size={14} strokeWidth={3} aria-hidden="true" />}
      <span>#{tag.label}</span>
      {waiting > 0 && (
        <span className={clsx("inline-flex items-center gap-1 text-[11px] font-bold", selected ? "text-ink/70" : "text-live")}>
          <span className="w-1.5 h-1.5 rounded-full bg-live" aria-hidden="true" />
          {waiting} waiting
        </span>
      )}
    </button>
  );
}

export default function IntentClient({ initialTag }: { initialTag?: string }) {
  const router = useRouter();
  const { selectedTag, setTag, countryFilter, setCountryFilter, languageFilter, setLanguageFilter } = useCallStore();
  const { user, isLoaded, ensureSession, confirmAge } = useAuth();
  const { toast } = useToast();

  const [micState, setMicState] = useState<MicState>("prompt");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [ageChecked, setAgeChecked] = useState(false);
  const [starting, setStarting] = useState(false);

  // A link like /intent?tag=textile preselects that tag
  useEffect(() => {
    if (isValidTag(initialTag)) setTag(initialTag);
  }, [initialTag, setTag]);

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

  // Live "N waiting" counts per tag, refreshed every 10 s
  useEffect(() => {
    let alive = true;
    const load = () =>
      (DEMO_MODE ? Promise.resolve(demoTagCounts()) : fetchTagCounts()).then(c => { if (alive) setCounts(c); });
    load();
    const id = setInterval(load, 10000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const requestMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicState("granted");
    } catch {
      setMicState("denied");
    }
  };

  const q = query.trim().toLowerCase();
  const searchResults = useMemo(() => (q ? ALL_TAGS.filter(t => t.label.toLowerCase().includes(q)) : []), [q]);

  const chosen = getTag(selectedTag);
  const ageConfirmed = !!user?.ageConfirmedAt;
  const canStart = isLoaded && !!chosen && micState === "granted" && (ageConfirmed || ageChecked);

  // No signup: create the hidden device session if needed, record 18+ once, then queue
  const handleStart = async () => {
    if (!canStart) return;
    setStarting(true);
    // Demo mode: no backend, go straight to the simulated queue
    if (DEMO_MODE) {
      router.push("/queue");
      return;
    }
    try {
      const current = await ensureSession();
      if (!current.ageConfirmedAt) await confirmAge();
      router.push("/queue");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Something went wrong starting your call. Please try again.", "error");
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dots flex flex-col">
      <TopNav />

      <main className="flex-1 container-app py-10 sm:py-12">
        {/* Headline */}
        <span className="font-hand text-[28px] text-marker -rotate-2 inline-flex items-center gap-2">
          step 1 of 2 <BulbDoodle size={30} draw className="text-marker" />
        </span>
        <h1 className="mt-1 text-[2.25rem] sm:text-[3rem] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Pick a tag
        </h1>
        <p className="mt-3 text-[17px] text-muted max-w-[620px]">
          You&apos;ll only be connected with someone who picked the <strong className="text-ink">same tag</strong>.
          Choose the one closest to what you want to talk about.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          {/* ── Tags ── */}
          <section aria-label="Tags">
            <label htmlFor="tag-search" className="sr-only">Search tags</label>
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                id="tag-search"
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search tags, e.g. textile, SaaS, real estate…"
                className="w-full pl-10 pr-10 py-3 text-[15px] bg-surface border-2 border-line rounded-[12px] outline-none focus:border-primary placeholder:text-muted"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-[8px] hover:bg-paper-2"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div role="radiogroup" aria-label="Choose one tag" className="mt-6 flex flex-col gap-7">
              {q ? (
                <div>
                  <h2 className="font-hand font-bold text-[24px] text-marker leading-none mb-3">
                    {searchResults.length ? `${searchResults.length} matching tag${searchResults.length === 1 ? "" : "s"}` : "no tags match"}
                  </h2>
                  {searchResults.length ? (
                    <div className="flex flex-wrap gap-2">
                      {searchResults.map(tag => (
                        <TagChip key={tag.slug} tag={tag} selected={selectedTag === tag.slug} waiting={counts[tag.slug] ?? 0} onSelect={setTag} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[15px] text-muted">
                      Try a broader word, or pick something close from the popular tags. We keep a fixed list so people land on the same tags and actually get matched.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="font-hand font-bold text-[24px] text-marker leading-none mb-3">popular</h2>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_TAGS.map(tag => (
                        <TagChip key={tag.slug} tag={tag} selected={selectedTag === tag.slug} waiting={counts[tag.slug] ?? 0} onSelect={setTag} />
                      ))}
                    </div>
                  </div>

                  {TAG_CATEGORIES.map(cat => {
                    const open = expanded[cat.id] || cat.tags.length <= COLLAPSED_COUNT;
                    // Always show the selected tag, even inside a collapsed category
                    const visible = open
                      ? cat.tags
                      : cat.tags.filter((t, i) => i < COLLAPSED_COUNT || t.slug === selectedTag);
                    return (
                      <div key={cat.id}>
                        <h2 className="font-hand font-bold text-[24px] text-marker leading-none mb-3">{cat.label.toLowerCase()}</h2>
                        <div className="flex flex-wrap gap-2">
                          {visible.map(tag => (
                            <TagChip key={tag.slug} tag={tag} selected={selectedTag === tag.slug} waiting={counts[tag.slug] ?? 0} onSelect={setTag} />
                          ))}
                          {cat.tags.length > COLLAPSED_COUNT && (
                            <button
                              type="button"
                              onClick={() => setExpanded(e => ({ ...e, [cat.id]: !open }))}
                              aria-expanded={open}
                              className="inline-flex items-center gap-1 min-h-[40px] px-3 text-[14px] font-bold text-primary hover:underline"
                            >
                              {open ? "Show fewer" : `Show all ${cat.tags.length}`}
                              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </section>

          {/* ── Ready panel (sticky on desktop) ── */}
          <aside className="lg:sticky lg:top-24 flex flex-col gap-4" aria-label="Start a call">
            <div className="bg-surface border-2 border-outline rounded-[16px] p-5">
              <p className="text-[13px] font-bold text-muted">Your tag</p>
              {chosen ? (
                <div className={clsx(tagNote(chosen.slug), "mt-2 inline-block px-4 py-2.5 shadow-note -rotate-1")}>
                  <span className="font-hand font-bold text-[28px] leading-none">#{chosen.label}</span>
                </div>
              ) : (
                <p className="mt-1 font-hand text-[24px] text-muted">pick one on the left…</p>
              )}
              {chosen && (
                <p className="mt-3 text-[14px] text-muted">
                  {counts[chosen.slug]
                    ? `${counts[chosen.slug]} ${counts[chosen.slug] === 1 ? "person is" : "people are"} waiting on this tag right now.`
                    : "If nobody connects within 45 seconds, you can retry or choose another tag."}
                </p>
              )}

              {/* Filters (collapsed by default) */}
              <div className="mt-5 pt-4 border-t-2 border-dashed border-line">
                <button
                  onClick={() => setFiltersOpen(v => !v)}
                  className="flex items-center gap-1.5 text-[14px] font-bold text-ink hover:text-primary transition-colors"
                  aria-expanded={filtersOpen}
                >
                  <Globe size={16} />
                  Country &amp; language
                  {(countryFilter || languageFilter) && (
                    <span className="text-[12px] font-bold text-primary">({[countryFilter, languageFilter].filter(Boolean).join(", ")})</span>
                  )}
                  {filtersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {filtersOpen && (
                  <div className="mt-3 grid grid-cols-2 gap-3 animate-fade-in">
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
                    <p className="col-span-2 text-[12px] text-muted">Filters narrow the match, so you may wait longer.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mic status */}
            <div
              className={clsx(
                "flex items-center gap-3 px-4 py-3.5 rounded-[12px] border-2",
                micState === "granted" && "bg-live-soft border-live",
                micState === "denied" && "bg-danger-soft border-danger",
                micState === "prompt" && "bg-surface border-outline"
              )}
              role="status"
            >
              {micState === "granted" && <CheckCircle size={20} className="text-live shrink-0" />}
              {micState === "denied" && <MicOff size={20} className="text-danger shrink-0" />}
              {micState === "prompt" && <Mic size={20} className="text-primary shrink-0" />}
              <div className="flex-1">
                {micState === "granted" && <p className="text-[15px] font-bold text-live">Microphone ready</p>}
                {micState === "denied" && (
                  <>
                    <p className="text-[15px] font-bold text-danger">Microphone access denied</p>
                    <p className="text-[13px] text-muted mt-0.5">Allow it in your browser&apos;s site settings, then refresh this page.</p>
                  </>
                )}
                {micState === "prompt" && <p className="text-[15px] font-bold">We need your microphone</p>}
              </div>
              {micState === "prompt" && (
                <Button variant="primary" size="sm" onClick={requestMic} className="shrink-0">
                  Allow mic
                </Button>
              )}
            </div>

            {/* 18+ confirmation — asked once, then remembered on this device */}
            {isLoaded && !ageConfirmed && (
              <label
                htmlFor="age-check"
                className={clsx(
                  "flex items-start gap-3 cursor-pointer px-4 py-3.5 rounded-[12px] border-2 transition-colors",
                  ageChecked ? "border-live bg-live-soft" : "border-line hover:border-outline"
                )}
              >
                <input
                  id="age-check"
                  type="checkbox"
                  checked={ageChecked}
                  onChange={e => setAgeChecked(e.target.checked)}
                  className="mt-0.5 w-5 h-5 accent-primary shrink-0 cursor-pointer"
                />
                <span className="text-[14px] text-muted leading-snug">
                  I&apos;m <strong className="text-ink">18 or older</strong> and agree to the{" "}
                  <a href="/terms" className="font-bold text-primary hover:underline">Terms</a> and{" "}
                  <a href="/privacy" className="font-bold text-primary hover:underline">Privacy Policy</a>.
                </span>
              </label>
            )}

            <Button
              variant="primary"
              size="lg"
              disabled={!canStart}
              loading={starting}
              onClick={handleStart}
              className="w-full"
              id="start-talking-btn"
            >
              {!chosen
                ? "Pick a tag to continue"
                : micState !== "granted"
                ? "Allow microphone access first"
                : isLoaded && !ageConfirmed && !ageChecked
                ? "Confirm you're 18+ to continue"
                : `Find someone on #${chosen.label} →`}
            </Button>
            <p className="text-center text-[13px] text-muted">No signup, no camera. Anonymous voice only.</p>
          </aside>
        </div>

        {/* Ad slot — below the content, away from the main button */}
        <div className="mt-12">
          <AdSlot height={90} variant={1} />
        </div>
      </main>
    </div>
  );
}
