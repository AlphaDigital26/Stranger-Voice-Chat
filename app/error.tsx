"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-dots flex flex-col">
      <header className="container-app flex items-center h-[72px]">
        <Link href="/" aria-label="PitchLine home">
          <Logo />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-[520px] mx-auto">
          <div className="inline-block bg-note-pink shadow-note px-7 py-5 -rotate-3">
            <p className="font-hand font-bold text-[40px] leading-none">oops.</p>
          </div>

          <h1 className="mt-8 text-[2.25rem] sm:text-[2.75rem] font-extrabold tracking-[-0.03em] leading-tight">
            Something broke on our end
          </h1>

          <p className="mt-4 text-[17px] text-muted leading-relaxed">
            We&apos;ve logged the problem. Try again, and if it keeps happening, head back home.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 w-full sm:w-auto text-[16px] font-bold text-on-primary bg-primary border-2 border-primary hover:bg-primary-hover rounded-[12px] transition-colors"
            >
              <RotateCcw size={18} />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3.5 w-full sm:w-auto text-[16px] font-bold bg-surface border-2 border-outline hover:bg-paper-2 rounded-[12px] transition-colors"
            >
              Back home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
