import Link from "next/link";
import { Home } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { QuestionDoodle } from "@/components/doodles/Doodles";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dots flex flex-col">
      <header className="container-app flex items-center h-[72px]">
        <Link href="/" aria-label="PitchLine home">
          <Logo />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-[520px] mx-auto">
          <div className="relative inline-block">
            <QuestionDoodle size={40} className="absolute -top-6 -left-10 text-marker anim-wiggle" />
            <QuestionDoodle size={28} className="absolute -bottom-2 -right-9 text-primary anim-wiggle" />
            <div className="bg-note-yellow shadow-note px-8 py-5 note-tilt anim-note-drop" style={{ "--tilt": "-3deg" } as React.CSSProperties}>
              <p className="font-hand font-bold text-[56px] leading-none">404</p>
            </div>
          </div>

          <h1 className="mt-8 text-[2.25rem] sm:text-[2.75rem] font-extrabold tracking-[-0.03em] leading-tight">
            This page wandered off
          </h1>

          <p className="mt-4 text-[17px] text-muted leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to pitching.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3.5 w-full sm:w-auto text-[16px] font-bold text-on-primary bg-primary border-2 border-primary hover:bg-primary-hover rounded-[12px] transition-colors"
          >
            <Home size={18} />
            Back home
          </Link>
        </div>
      </main>
    </div>
  );
}
