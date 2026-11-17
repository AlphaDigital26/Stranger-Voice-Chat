"use client";

import { getSupabaseBrowser } from "@/lib/supabase/client";

// Thin wrappers around the matchmaking functions in
// supabase/migrations/0001_tag_matching.sql.

/** Thrown when the SQL hasn't been run in Supabase yet, so the UI can say so plainly */
export class MatchingNotSetUpError extends Error {}

function check(error: { message: string; code?: string } | null) {
  if (!error) return;
  // PGRST202 = function not found (migration not run)
  if (error.code === "PGRST202" || /could not find the function/i.test(error.message)) {
    throw new MatchingNotSetUpError("Matching isn't set up yet: run supabase/migrations/0001_tag_matching.sql in Supabase.");
  }
  throw new Error(error.message);
}

/** Join the queue for a tag. Returns a call id if matched immediately, otherwise null. */
export async function joinQueue(tag: string, country: string | null, language: string | null) {
  const { data, error } = await getSupabaseBrowser().rpc("join_queue", {
    p_tag: tag,
    p_country: country,
    p_language: language,
  });
  check(error);
  return (data as string | null) ?? null;
}

/** Check whether someone has matched with us yet (also keeps our queue entry alive). */
export async function pollMatch() {
  const { data, error } = await getSupabaseBrowser().rpc("poll_match");
  check(error);
  return (data as string | null) ?? null;
}

export async function leaveQueue() {
  const { error } = await getSupabaseBrowser().rpc("leave_queue");
  if (error) console.warn("leave_queue failed:", error.message);
}

export async function endCall(callId: string) {
  const { error } = await getSupabaseBrowser().rpc("end_call", { p_call: callId });
  if (error) console.warn("end_call failed:", error.message);
}

/** People waiting per tag right now, as { slug: count }. Empty if matching isn't set up. */
export async function fetchTagCounts(): Promise<Record<string, number>> {
  const { data, error } = await getSupabaseBrowser().rpc("tag_counts");
  if (error || !Array.isArray(data)) return {};
  return Object.fromEntries((data as Array<{ tag: string; waiting: number }>).map(r => [r.tag, r.waiting]));
}
