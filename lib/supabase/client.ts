import { createBrowserClient } from "@supabase/ssr";

// One Supabase client for the whole browser session (auth state, realtime later).
let client: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseBrowser() {
  client ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return client;
}
