"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Radio, ChevronDown, History, Users, Settings, LogOut, User } from "lucide-react";
import { clsx } from "clsx";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useAuth } from "@/lib/mockAuth";

export default function TopNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-lg border-b border-[#E5E5E8] shadow-sm">
      <div className="container-app flex items-center justify-between h-14">

        {/* Logo */}
        <Link
          href="/intent"
          className="flex items-center gap-2 group"
          aria-label="PitchLine — go to home"
        >
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#7C5CFC] to-[#FF6B6B] flex items-center justify-center shadow-[0_2px_8px_rgba(124,92,252,0.4)] group-hover:scale-105 transition-transform">
            <Radio size={16} className="text-white" />
          </div>
          <span className="text-[16px] font-bold text-[#18181B] tracking-tight group-hover:text-[#7C5CFC] transition-colors">
            PitchLine
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="px-3 py-1.5 text-[14px] font-medium text-[#18181B] hover:text-[#7C5CFC] transition-colors">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-1.5 text-[14px] font-medium text-white bg-[#7C5CFC] hover:bg-[#6547E0] rounded-full transition-colors">
                  Get Started
                </button>
              </SignUpButton>
            </>
          ) : (
            <>
              <Link href="/intent" className="text-[14px] text-[#71717A] hover:text-[#7C5CFC] mr-4 hidden sm:block">Match</Link>
              <Link href="/contacts" className="text-[14px] text-[#71717A] hover:text-[#7C5CFC] mr-4 hidden sm:block">Contacts</Link>
              <Link href="/history" className="text-[14px] text-[#71717A] hover:text-[#7C5CFC] mr-4 hidden sm:block">History</Link>
              <UserButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
