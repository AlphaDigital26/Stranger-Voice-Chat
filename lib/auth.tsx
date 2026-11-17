"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";

// ============================================================
// Identity without login. Nobody signs up or logs in: the first time someone
// taps "Find someone", the browser quietly gets an anonymous Supabase session.
// That hidden device ID is what matching, friends, history and bans hang on.
// ============================================================

export interface AppUser {
  /** Anonymous device ID (Supabase user id) */
  id: string;
  /** Set when the person confirms they're 18+ (user metadata for now) */
  ageConfirmedAt: string | null;
}

function toAppUser(u: User): AppUser {
  return {
    id: u.id,
    ageConfirmedAt: (u.user_metadata?.age_confirmed_at as string | undefined) ?? null,
  };
}

interface AuthContextValue {
  /** null until this browser has started its first call */
  user: AppUser | null;
  isLoaded: boolean;
  /** Returns the device identity, creating it silently if there is none */
  ensureSession: () => Promise<AppUser>;
  /** Records the 18+ confirmation on this device */
  confirmAge: () => Promise<void>;
  /** Forget this device's identity (friends and history here start fresh) */
  resetIdentity: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    // Fires once straight away with the current session, then on every change
    const { data } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ? toAppUser(session.user) : null);
      setLoaded(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const ensureSession = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase.auth.getSession();
    if (data.session) return toAppUser(data.session.user);

    const { data: anon, error } = await supabase.auth.signInAnonymously();
    if (error || !anon.user) {
      throw new Error(error?.message ?? "We couldn't connect you right now. Please try again.");
    }
    return toAppUser(anon.user);
  }, []);

  const confirmAge = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({ data: { age_confirmed_at: new Date().toISOString() } });
    if (error) throw new Error(error.message);
    // Refresh so the session token (read by proxy.ts) carries the new metadata
    await supabase.auth.refreshSession();
  }, []);

  const resetIdentity = useCallback(async () => {
    await getSupabaseBrowser().auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoaded, ensureSession, confirmAge, resetIdentity }),
    [user, isLoaded, ensureSession, confirmAge, resetIdentity]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
