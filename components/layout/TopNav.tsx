"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Logo from "@/components/ui/Logo";
import MobileMenu from "@/components/layout/MobileMenu";
import { useAuth } from "@/lib/mockAuth";

const LINKS = [
  { href: "/intent", label: "Talk" },
  { href: "/contacts", label: "Contacts" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

// Signed-out phone menu: browse, and reach Settings for the theme switch
const GUEST_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/settings", label: "Settings" },
];

export default function TopNav() {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-lg border-b-2 border-outline">
      <div className="container-app flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" aria-label="PitchLine — go to home">
          <Logo />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="hidden sm:block px-3 min-h-[44px] text-[15px] font-bold hover:text-primary transition-colors">
                  Log in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2.5 text-[15px] font-bold text-on-primary bg-primary hover:bg-primary-hover rounded-[10px] transition-colors">
                  Get started
                </button>
              </SignUpButton>
              <MobileMenu links={GUEST_LINKS} signedIn={false} />
            </>
          ) : (
            <>
              <nav className="hidden sm:flex items-center gap-1 mr-2" aria-label="Main">
                {LINKS.map(({ href, label }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={clsx(
                        "px-3 py-2 text-[15px] font-bold transition-colors",
                        // Active page gets a highlighter stroke, like the landing headline
                        active
                          ? "underline decoration-highlight decoration-[6px] underline-offset-[6px]"
                          : "text-muted hover:text-ink"
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <MobileMenu links={LINKS} signedIn />
              <UserButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
