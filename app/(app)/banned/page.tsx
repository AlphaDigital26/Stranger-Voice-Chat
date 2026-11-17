import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function BannedPage() {
  return (
    <div className="min-h-screen bg-dots flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8" aria-label="Stranger Voice Chat home">
        <Logo />
      </Link>

      <div className="w-full max-w-[440px] bg-surface border-2 border-outline rounded-[16px] p-8 text-center">
        <div className="bg-note-pink shadow-note px-5 py-4 -rotate-2 inline-block">
          <p className="font-hand font-bold text-[30px] leading-none">suspended</p>
        </div>

        <h1 className="mt-6 text-[1.5rem] font-extrabold tracking-tight">This device has been suspended</h1>
        <p className="mt-2 text-[15px] text-muted leading-relaxed">
          Calls from this device broke our{" "}
          <Link href="/terms" className="font-bold text-primary hover:underline">Terms of Service</Link>.
          If you think this is a mistake, email our support team and tell us roughly when it happened.
        </p>

        {/* Shown as text too: mailto links don't open for everyone */}
        <a
          href="mailto:support@strangervoicechat.app"
          className="mt-5 inline-flex items-center min-h-[44px] px-4 text-[15px] font-bold border-2 border-outline rounded-[12px] hover:bg-paper-2 transition-colors select-all"
        >
          support@strangervoicechat.app
        </a>

        <div className="border-t-2 border-dashed border-line mt-6 pt-5">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] text-[15px] font-bold text-muted hover:text-ink transition-colors"
            id="banned-home-link"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
