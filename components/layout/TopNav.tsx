"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import Logo from "@/components/ui/Logo";
import MobileMenu from "@/components/layout/MobileMenu";

// No login anywhere: everyone sees the same links. Friends and history are
// tied to this device's hidden ID.
const LINKS = [
  { href: "/intent", label: "Talk" },
  { href: "/contacts", label: "Friends" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-lg border-b-2 border-outline">
      <div className="container-app flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" aria-label="Stranger Voice Chat — go to home">
          <Logo />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-1 mr-1" aria-label="Main">
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
          {pathname !== "/intent" && (
            <Link
              href="/intent"
              className="px-4 py-2.5 text-[15px] font-bold text-on-primary bg-primary hover:bg-primary-hover rounded-[10px] transition-colors whitespace-nowrap"
            >
              Start talking
            </Link>
          )}
          <MobileMenu links={LINKS} hideFrom="md:hidden" />
        </div>
      </div>
    </header>
  );
}
