"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/lib/mockAuth";

export default function AgeConfirmPage() {
  const router = useRouter();
  const { confirmAge, signOut } = useAuth();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    confirmAge();
    setLoading(false);
    router.push("/intent");
  };

  return (
    <div className="min-h-screen bg-dots flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8" aria-label="PitchLine home">
        <Logo />
      </Link>

      <div className="w-full max-w-[440px] bg-surface border-2 border-outline rounded-[16px] p-8 text-center">
        <div className="bg-note-yellow shadow-note px-5 py-4 -rotate-2 inline-flex items-center gap-2">
          <ShieldCheck size={24} aria-hidden="true" />
          <span className="font-hand font-bold text-[30px] leading-none">18+ only</span>
        </div>

        <h1 className="mt-6 text-[1.5rem] font-extrabold tracking-tight mb-2">Confirm your age</h1>
        <p className="text-[15px] text-muted mb-6 leading-relaxed">
          PitchLine is for users <strong>18 and older</strong>. Since you&apos;re connecting with strangers by voice, we need to confirm your age before you continue.
        </p>

        <label className="flex items-start gap-3 cursor-pointer text-left mb-6 p-3 border-2 border-line rounded-[12px] hover:border-outline transition-colors" htmlFor="age-confirm-check">
          <input
            id="age-confirm-check"
            type="checkbox"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
            className="mt-0.5 w-5 h-5 accent-primary shrink-0 cursor-pointer"
          />
          <span className="text-[14px] text-muted leading-snug">
            I confirm I am <strong className="text-ink">18 years or older</strong> and agree to the{" "}
            <Link href="/terms" className="font-bold text-primary hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-bold text-primary hover:underline">Privacy Policy</Link>.
          </span>
        </label>

        <Button
          variant="primary"
          size="lg"
          disabled={!checked || loading}
          loading={loading}
          onClick={handleContinue}
          className="w-full mb-3"
          id="age-confirm-continue"
        >
          Continue
        </Button>

        <button
          onClick={() => { signOut(); router.push("/"); }}
          className="min-h-[44px] text-[14px] font-bold text-muted hover:text-ink transition-colors"
        >
          I&apos;m under 18, log me out
        </button>
      </div>
    </div>
  );
}
