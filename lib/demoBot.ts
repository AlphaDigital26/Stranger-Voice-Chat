"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IntentTag } from "@/lib/callStore";

// ============================================================
// Demo bot — stands in for a stranger until real matchmaking exists (Step 5).
// Voice: browser SpeechSynthesis to talk, SpeechRecognition (Chrome/Edge) to
// hear when you've finished speaking. Without recognition it moves on by timer.
// Always presented to the user as a bot, never as a real person.
// ============================================================

/** The bot plays the role that complements yours (you pitch → it listens, etc.) */
export function botIntentFor(mine: IntentTag | null): IntentTag {
  if (mine === "pitch_idea") return "give_feedback";
  if (mine === "give_feedback") return "pitch_idea";
  return mine ?? "open_discussion";
}

// Keyed by YOUR intent
const SCRIPTS: Record<IntentTag, string[]> = {
  pitch_idea: [
    "Hey! I'm the PitchLine demo bot, standing in for a real listener. Go ahead and pitch me your idea. You've got sixty seconds.",
    "Okay, interesting. Who exactly has this problem, and how often do they run into it?",
    "How are they solving it today, without you?",
    "Who pays for this, and roughly how much would they pay?",
    "What's the smallest version you could test this week?",
    "Here's my honest take: talk to ten potential customers before you build anything. Thanks for pitching!",
  ],
  give_feedback: [
    "Hi! I'm the PitchLine demo bot, playing a founder. Here's my pitch: a weekly box of healthy snacks for college students, for two hundred rupees a week. What do you think?",
    "Fair point. Who do you think would actually pay, the students or their parents?",
    "Hmm. What would make you trust a brand like this enough to subscribe?",
    "That's useful. If I had to cut one thing to launch faster, what should it be?",
    "Thanks, this really helps. I'm going to talk to some students this week!",
  ],
  open_discussion: [
    "Hey! I'm the PitchLine demo bot. What's a startup trend you've been thinking about lately?",
    "Interesting. Do you think that's a real shift, or mostly hype?",
    "What would a small team need to win in that space?",
    "Good chat! Thanks for talking with me.",
  ],
  founder_chat: [
    "Hey, fellow builder! I'm the PitchLine demo bot. What are you working on right now?",
    "Nice. What's the hardest part of it this week?",
    "How are you finding your first users?",
    "Love it. Keep shipping, and thanks for the chat!",
  ],
};

const GENERIC_CHAT = [
  "Got it. What made you think of this?",
  "Makes sense. What's the riskiest assumption here?",
  "Interesting! How would you get your first 100 users?",
  "I like that. What would you test first?",
];

/** Keyword-based reply to an in-call chat message */
export function botChatReply(body: string, turn: number): string {
  const t = body.toLowerCase();
  if (/\b(hi|hello|hey|namaste|yo)\b/.test(t)) return "Hey! Good to meet you. I'm the demo bot.";
  if (/(thank|thx|ty\b)/.test(t)) return "Anytime! Good luck with it.";
  if (/(price|pricing|pay|cost|₹|\$|money|revenue|charge)/.test(t))
    return "Pricing is the big question. Have you asked ten people what they'd actually pay?";
  if (/(compet|rival|already exist|similar|copy)/.test(t))
    return "Competition is fine, it means there's demand. What's your angle that's hard to copy?";
  if (/(user|customer|market|audience|buyer)/.test(t))
    return "Who's the very first customer you'd sell to? Be as specific as you can.";
  if (/(bot|real|human|person)/.test(t))
    return "Yep, I'm a demo bot! Real strangers are coming soon.";
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
  myIntent: IntentTag | null;
  isMuted: boolean;
}

const SILENCE_MS = 1800;       // pause after your speech that counts as "your turn is over"
const LISTEN_FALLBACK_MS = 14000; // move on anyway if we can't hear you

export function useDemoBot({ myIntent, isMuted }: UseDemoBotOptions) {
  const script = SCRIPTS[myIntent ?? "open_discussion"];

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
