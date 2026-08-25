"use client";

import { useUser, useClerk } from "@clerk/nextjs";

export type UserRole = "user" | "moderator" | "admin";
export type UserStatus = "active" | "suspended" | "banned";
export type SubscriptionTier = "free" | "paid";

export interface MockUser {
  id: string;
  email: string;
  authProvider: "email" | "google";
  ageConfirmedAt: string | null;
  status: UserStatus;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  defaultCountryFilter: string | null;
  defaultLanguageFilter: string | null;
  createdAt: string;
}

// Temporary wrapper to gradually migrate components from MockAuth to Clerk
export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  // Map Clerk user to our expected mock interface for now to avoid refactoring 7 files at once
  const mappedUser: MockUser | null = user ? {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || "",
    authProvider: "email",
    ageConfirmedAt: new Date().toISOString(), // Mock age confirmation temporarily
    status: "active",
    role: "user",
    subscriptionTier: "free",
    defaultCountryFilter: null,
    defaultLanguageFilter: null,
    createdAt: new Date().toISOString(),
  } : null;

  const confirmAge = () => { /* No-op */ };
  const upgradeToP = () => { /* No-op */ };

  return {
    user: mappedUser,
    isLoaded,
    isSignedIn: !!user,
    signOut,
    confirmAge,
    upgradeToP,
  };
}
