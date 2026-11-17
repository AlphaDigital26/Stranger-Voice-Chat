"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ============================================================
// Demo bot — a practice partner offered when nobody is on your tag (or before
// matching is set up). Voice: browser SpeechSynthesis to talk, SpeechRecognition
// (Chrome/Edge) to hear when you've finished speaking; without recognition it
// moves on by timer. Always presented to the user as a bot, never as a person.
// ============================================================

/**
 * "bot": practice partner that says it's a bot.
 * "stranger": demo mode, plays a person on the same tag (the screen shows a demo badge).
 */
export type BotPersona = "bot" | "stranger";

/** One conversation, about whatever tag the person picked */
function scriptFor(tagLabel: string, persona: BotPersona) {
  if (persona === "stranger") {
    return [
      `Hey! Nice, someone else on ${tagLabel}. I've been into it for a couple of years now. What brings you here?`,
      "Oh nice. What are you working on in that space at the moment?",
      "Honestly, the hardest part for me has been finding the right people to talk to. What's been tough for you lately?",
      "That makes sense. If you could ask someone with ten years in this field one question, what would it be?",
      `This was a really good chat! Tap Friend if you want to stay in touch. Good luck with ${tagLabel}!`,
    ];
  }
  return [
    `Hey! I'm the Stranger Voice Chat demo bot, standing in while nobody else is on ${tagLabel}. What brings you to ${tagLabel}?`,
    "Interesting. What are you working on in that space right now?",
    "What's the hardest part of it this month?",
    "If you could ask someone with ten years in this field one question, what would it be?",
    `Good chat! Try again in a bit, and you'll likely meet a real person on ${tagLabel}. Thanks for talking with me.`,
  ];
}

const GENERIC_CHAT = [
  "Got it. What made you think of this?",
  "Makes sense. What's the riskiest assumption here?",
  "Interesting! How would you get your first 100 users?",
  "I like that. What would you test first?",
];

/** Keyword-based reply to an in-call chat message */
export function botChatReply(body: string, turn: number, persona: BotPersona = "bot"): string {
  const t = body.toLowerCase();
  if (persona === "stranger") {
    if (/\b(hi|hello|hey|namaste|yo)\b/.test(t)) return "Hey! Good to meet you 👋";
    if (/(bot|real|human|person|demo)/.test(t))
      return "Ha, good catch: this is demo mode, so I'm simulated. With matching switched on you'd be talking to a real person on this tag.";
  } else if (/\b(hi|hello|hey|namaste|yo)\b/.test(t)) {
    return "Hey! Good to meet you. I'm the demo bot.";
  }
  if (/(thank|thx|ty\b)/.test(t)) return "Anytime! Good luck with it.";
  if (/(price|pricing|pay|cost|₹|\$|money|revenue|charge)/.test(t))
    return "Pricing is the big question. Have you asked ten people what they'd actually pay?";
  if (/(compet|rival|already exist|similar|copy)/.test(t))
    return "Competition is fine, it means there's demand. What's your angle that's hard to copy?";
  if (/(user|customer|market|audience|buyer)/.test(t))
    return "Who's the very first customer you'd sell to? Be as specific as you can.";
  if (/(bot|real|human|person)/.test(t))
    return "Yep, I'm a demo bot! Retry in a bit to meet a real person on your tag.";
  if (t.trim().endsWith("?"))
    return "Good question. I'd test it with a quick landing page and see who signs up.";
  return GENERIC_CHAT[turn % GENERIC_CHAT.length];
}

// ---- Minimal Web Speech API types (not in TypeScript's DOM lib) ----
interface RecognitionResultEvent { results: ArrayLike<{ isFinal: boolean }> }
interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type RecognitionCtor = new () => Recognition;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type BotPhase = "connecting" | "speaking" | "listening" | "blocked" | "done";

interface UseDemoBotOptions {
  /** Label of the tag the person picked, e.g. "Textile" */
  tagLabel: string;
  isMuted: boolean;
  persona?: BotPersona;
}

const SILENCE_MS = 1800;       // pause after your speech that counts as "your turn is over"
const LISTEN_FALLBACK_MS = 14000; // move on anyway if we can't hear you

export function useDemoBot({ tagLabel, isMuted, persona = "bot" }: UseDemoBotOptions) {
  const script = useMemo(() => scriptFor(tagLabel, persona), [tagLabel, persona]);

  const [phase, setPhase] = useState<BotPhase>("connecting");
  const [caption, setCaption] = useState("");
  const [amplitude, setAmplitude] = useState(0);
  const [canHear] = useState(() => getRecognitionCtor() !== null);

  const lineRef = useRef(0);
  const mutedRef = useRef(isMuted);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const recognitionRef = useRef<Recognition | null>(null);
  const listeningRef = useRef(false);
  const mountedRef = useRef(true);
  // Late-bound so speak/listen can call each other
  const speakRef = useRef<(i: number) => void>(() => {});

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => { timers.current.delete(id); fn(); }, ms);
    timers.current.add(id);
    return id;
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
  }, []);

  const nextLine = useCallback(() => {
    stopListening();
    clearTimers();
    const next = lineRef.current + 1;
    if (next < script.length) later(() => speakRef.current(next), 700);
    else setPhase("done");
  }, [script.length, stopListening, clearTimers, later]);

  const listen = useCallback(() => {
    if (!mountedRef.current) return;
    setPhase("listening");
    if (mutedRef.current) return; // wait until unmuted

    // Fallback: keep the conversation moving even if we never hear anything
    later(nextLine, LISTEN_FALLBACK_MS);

    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";
    let silenceTimer: ReturnType<typeof setTimeout> | null = null;
    rec.onresult = () => {
      // Each burst of speech pushes the "you're done talking" timer back
      if (silenceTimer) { clearTimeout(silenceTimer); timers.current.delete(silenceTimer); }
      silenceTimer = later(nextLine, SILENCE_MS);
    };
    rec.onend = () => {
      // Chrome stops recognition after a while; restart while it's still our turn to listen
      if (listeningRef.current && recognitionRef.current === rec) {
        try { rec.start(); } catch { /* already started */ }
      }
    };
    rec.onerror = () => { /* fallback timer still moves things along */ };
    recognitionRef.current = rec;
    listeningRef.current = true;
    try { rec.start(); } catch { /* ignore */ }
  }, [later, nextLine]);

  const speak = useCallback((i: number) => {
    if (!mountedRef.current) return;
    lineRef.current = i;
    const text = script[i];
    setCaption(text);
    setPhase("speaking");

    const finish = () => {
      if (!mountedRef.current) return;
      setAmplitude(0);
      if (i < script.length - 1) listen();
      else setPhase("done");
    };

    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth) {
      // No speech engine: "speak" for roughly the time it would take to read aloud
      later(finish, Math.max(2500, text.split(" ").length * 330));
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    u.voice = voices.find(v => v.lang === "en-IN") ?? voices.find(v => v.lang.startsWith("en")) ?? null;
    u.rate = 1.02;
    u.onend = finish;
    u.onerror = (e) => {
      // Chrome blocks speech until the user has interacted with the page (e.g. after a reload)
      if (e.error === "not-allowed") setPhase("blocked");
      else finish();
    };
    synth.speak(u);
  }, [script, listen, later]);

  useEffect(() => { speakRef.current = speak; }, [speak]);

  // "Connect", then say the first line
  useEffect(() => {
    mountedRef.current = true;
    later(() => speakRef.current(0), 1500);
    const timerSet = timers.current;
    return () => {
      mountedRef.current = false;
      timerSet.forEach(clearTimeout);
      timerSet.clear();
      listeningRef.current = false;
      recognitionRef.current?.abort();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, [later]);

  // Mute: stop listening; unmute: pick listening back up
  useEffect(() => {
    mutedRef.current = isMuted;
    if (phase !== "listening") return;
    if (isMuted) { stopListening(); clearTimers(); }
    else if (!listeningRef.current) listen();
  }, [isMuted, phase, listen, stopListening, clearTimers]);

  // Fake voice level while the bot talks, for the visualizer
  useEffect(() => {
    if (phase !== "speaking") return;
    const start = performance.now();
    const id = setInterval(() => {
      const t = (performance.now() - start) / 1000;
      setAmplitude(0.45 + 0.35 * Math.abs(Math.sin(t * 7.3)) * (0.6 + 0.4 * Math.sin(t * 2.1)));
    }, 90);
    return () => clearInterval(id);
  }, [phase]);

  /** Retry speaking after the browser blocked audio; call from a click handler */
  const unblock = useCallback(() => speakRef.current(lineRef.current), []);

  return {
    isConnected: phase !== "connecting",
    isSpeaking: phase === "speaking",
    amplitude: phase === "speaking" ? amplitude : 0,
    phase,
    caption,
    canHear,
    unblock,
  };
}
