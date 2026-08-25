import { ShieldX, LogOut } from "lucide-react";
import Link from "next/link";

export default function BannedPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px] bg-white border border-[#EF4444]/20 rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-8 text-center">

        <div className="w-16 h-16 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto mb-5">
          <ShieldX size={30} className="text-[#EF4444]" />
        </div>

        <h1 className="text-[1.5rem] font-bold text-[#18181B] mb-2">Your account has been suspended</h1>
        <p className="text-[14px] text-[#71717A] mb-6 leading-relaxed">
          This account has been suspended due to a violation of our{" "}
          <Link href="/terms" className="text-[#7C5CFC] hover:underline">Terms of Service</Link>.
          If you believe this is a mistake, please contact our support team.
        </p>

        <a
          href="mailto:support@pitchline.app"
          className="inline-flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-[#7C5CFC] border border-[#7C5CFC]/30 rounded-[8px] hover:bg-[rgba(124,92,252,0.06)] transition-colors mb-5"
        >
          Contact support@pitchline.app
        </a>

        <div className="border-t border-[#E5E5E8] pt-5">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-[14px] text-[#71717A] hover:text-[#18181B] transition-colors"
            id="banned-logout-link"
          >
            <LogOut size={15} />
            Log Out
          </Link>
        </div>
      </div>
    </div>
  );
}
