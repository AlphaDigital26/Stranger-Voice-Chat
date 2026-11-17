// ============================================================
// Demo mode: for showing the product without a backend.
// Turn on with NEXT_PUBLIC_DEMO_MODE=true (in .env.local, or on Netlify).
// The tag picker shows simulated "waiting" counts, the queue "finds" someone
// after a few seconds, and the call is with a simulated stranger (the voice
// bot), always labelled as demo mode. Supabase and LiveKit are never called.
// ============================================================

import { ALL_TAGS, POPULAR_TAG_SLUGS } from "@/lib/tags";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/** Call ids starting with this open the simulated call instead of LiveKit */
export const SIMULATED_CALL_PREFIX = "bot_";

/** Small stable hash so counts don't jump around wildly between refreshes */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

/** Simulated people waiting per tag; changes a little every 10 seconds */
export function demoTagCounts(): Record<string, number> {
  const tick = Math.floor(Date.now() / 10000);
  const counts: Record<string, number> = {};
  for (const tag of ALL_TAGS) {
    const popular = POPULAR_TAG_SLUGS.includes(tag.slug);
    const n = hash(`${tag.slug}:${tick}`) % (popular ? 9 : 5);
    // Popular tags always look busy; about half of the rest show someone waiting
    const waiting = popular ? n + 2 : hash(tag.slug) % 2 === 0 ? n : 0;
    if (waiting > 0) counts[tag.slug] = waiting;
  }
  return counts;
}

/** How long the simulated search takes before "finding" someone */
export function demoMatchDelayMs() {
  return 3000 + Math.floor(Math.random() * 4000);
}
