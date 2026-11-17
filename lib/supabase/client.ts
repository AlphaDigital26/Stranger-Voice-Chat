import { createBrowserClient } from "@supabase/ssr";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** False when the Supabase env vars aren't set (e.g. a Netlify deploy without them) */
export const SUPABASE_CONFIGURED = !!URL && !!KEY;

// One Supabase client for the whole browser session (auth state, realtime later).
let client: ReturnType<typeof createBrowserClient> | undefined;

/** Only call when SUPABASE_CONFIGURED is true; demo mode never calls it */
export function getSupabaseBrowser() {
  if (!URL || !KEY) {
    throw new Error("Supabase isn't configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  client ??= createBrowserClient(URL, KEY);
  return client;
}
