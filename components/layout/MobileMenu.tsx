"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { clsx } from "clsx";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export interface MenuLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  links: MenuLink[];
  signedIn: boolean;
  /** Tailwind breakpoint class that hides the button on wider screens, e.g. "sm:hidden" */
  hideFrom?: string;
  /** Header height, so the panel opens right under it: "top-16" (app nav) or "top-[72px]" (landing) */
  top?: "top-16" | "top-[72px]";
}

// Hamburger + full-width panel under the header, for phones.
export default function MobileMenu({ links, signedIn, hideFrom = "sm:hidden", top = "top-16" }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  // Escape closes; the page behind doesn't scroll while the menu is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className={hideFrom}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        className="w-11 h-11 flex items-center justify-center rounded-[10px] border-2 border-outline bg-surface hover:bg-paper-2 transition-colors"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Portal to <body>: the header's backdrop-blur would otherwise trap these fixed layers inside it */}
      {open && createPortal(
        <>
          {/* Backdrop: tap outside to close */}
          <div className={clsx("fixed inset-x-0 bottom-0 z-40 bg-black/50", top)} onClick={close} aria-hidden="true" />

          <nav
            id={panelId}
            aria-label="Menu"
            className={clsx("fixed inset-x-0 z-50 max-h-[calc(100dvh-72px)] overflow-y-auto bg-paper border-b-2 border-outline px-4 pt-3 pb-5 animate-slide-in", top)}
          >
            <ul className="flex flex-col">
              {links.map(({ href, label }) => {
                const active = !href.startsWith("#") && (pathname === href || pathname.startsWith(`${href}/`));
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={clsx(
                        "flex items-center min-h-[52px] px-3 rounded-[12px] text-[18px] font-bold transition-colors",
                        active ? "bg-paper-2" : "hover:bg-paper-2"
                      )}
                    >
                      <span className={clsx(active && "underline decoration-highlight decoration-[6px] underline-offset-[6px]")}>
                        {label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {!signedIn && (
              <div className="mt-3 pt-4 border-t-2 border-dashed border-line grid grid-cols-2 gap-3">
                <SignInButton mode="modal">
                  <button onClick={close} className="min-h-[48px] rounded-[12px] border-2 border-outline bg-surface text-[16px] font-bold hover:bg-paper-2 transition-colors">
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button onClick={close} className="min-h-[48px] rounded-[12px] bg-primary text-on-primary text-[16px] font-bold hover:bg-primary-hover transition-colors">
                    Get started
                  </button>
                </SignUpButton>
              </div>
            )}
          </nav>
        </>,
        document.body
      )}
    </div>
  );
}
