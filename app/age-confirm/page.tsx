"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Radio, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#7C5CFC] to-[#9B82FF] flex items-center justify-center shadow-sm">
          <Radio size={18} className="text-white" />
        </div>
        <span className="text-[20px] font-bold text-[#18181B]">PitchLine</span>
      </Link>

      <div className="w-full max-w-[400px] bg-white border border-[#E5E5E8] rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[rgba(124,92,252,0.1)] flex items-center justify-center mx-auto mb-5">
          <ShieldCheck size={28} className="text-[#7C5CFC]" />
        </div>

        <h1 className="text-[1.5rem] font-bold text-[#18181B] mb-2">Confirm your age</h1>
        <p className="text-[14px] text-[#71717A] mb-6 leading-relaxed">
          PitchLine is for users <strong>18 and older</strong>. Since you're connecting with strangers by voice, we need to confirm your age before you continue.
        </p>

        <label className="flex items-start gap-3 cursor-pointer text-left mb-6" htmlFor="age-confirm-check">
          <input
            id="age-confirm-check"
            type="checkbox"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#7C5CFC] shrink-0 cursor-pointer"
          />
          <span className="text-[13px] text-[#71717A] leading-snug">
            I confirm I am <strong className="text-[#18181B]">18 years or older</strong> and agree to the{" "}
            <Link href="/terms" className="text-[#7C5CFC] hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#7C5CFC] hover:underline">Privacy Policy</Link>.
          </span>
        </label>

        <Button
          variant="primary"
          size="lg"
          pill
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
          className="text-[13px] text-[#71717A] hover:text-[#18181B] transition-colors"
        >
          This isn't right — log out
        </button>
      </div>
    </div>
  );
}
