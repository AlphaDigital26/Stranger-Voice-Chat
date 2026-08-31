"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Radio, RotateCcw, AlertTriangle } from "lucide-react";

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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* ── Header ── */}
      <header className="absolute top-0 w-full z-40 bg-transparent">
        <div className="container-app flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#7C5CFC] to-[#FF6B6B] flex items-center justify-center shadow-[0_2px_8px_rgba(124,92,252,0.4)]">
              <Radio size={16} className="text-white" />
            </div>
            <span className="text-[16px] font-bold text-[#18181B]">PitchLine</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center relative overflow-hidden px-4 py-20">
        {/* Gradient blob */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(255,107,107,0.1) 0%, transparent 60%)",
          }}
        />

        <div className="text-center relative z-10 max-w-lg mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-card mb-8">
            <AlertTriangle className="text-[#FF6B6B]" size={36} />
          </div>
          
          <h1 className="text-[2rem] sm:text-[2.5rem] font-bold text-[#18181B] leading-tight mb-4">
            Connection Interrupted
          </h1>
          
          <p className="text-[16px] sm:text-[18px] text-[#71717A] mb-10 leading-relaxed">
            Something went wrong on our end. We're looking into it, but you can try again right now.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 w-full sm:w-auto text-[15px] font-semibold text-white bg-[#7C5CFC] hover:bg-[#6547E0] rounded-full transition-all shadow-glow hover:shadow-[0_0_20px_rgba(124,92,252,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              <RotateCcw size={18} />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 w-full sm:w-auto text-[15px] font-medium text-[#18181B] bg-white border border-[#E5E5E8] hover:border-[#7C5CFC]/40 rounded-full transition-all"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
