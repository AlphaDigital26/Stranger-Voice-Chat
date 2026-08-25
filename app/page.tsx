import type { Metadata } from "next";
import Link from "next/link";
import { Radio, Mic, Shield, SkipForward, ArrowRight, Zap, Users, Star } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "PitchLine — Talk to a Stranger About Your Idea",
  description:
    "Instantly connect by voice with a random stranger to pitch your idea, get feedback, or have a real founder conversation. No camera. AI-moderated. 18+.",
};

export default async function LandingPage() {
  const { userId } = await auth();
  
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-[#E5E5E8]">
        <div className="container-app flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#7C5CFC] to-[#FF6B6B] flex items-center justify-center shadow-[0_2px_8px_rgba(124,92,252,0.4)]">
              <Radio size={16} className="text-white" />
            </div>
            <span className="text-[16px] font-bold text-[#18181B]">PitchLine</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#how-it-works" className="text-[14px] text-[#71717A] hover:text-[#18181B] transition-colors">How it Works</Link>
            <Link href="/blog" className="text-[14px] text-[#71717A] hover:text-[#18181B] transition-colors">Blog</Link>
          </nav>
          <div className="flex items-center gap-2">
            {!userId ? (
              <>
                <SignInButton mode="modal">
                  <button className="px-3 py-1.5 text-[14px] font-medium text-[#18181B] hover:text-[#7C5CFC] transition-colors">
                    Log In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 text-[14px] font-semibold text-white bg-[#7C5CFC] hover:bg-[#6547E0] rounded-full transition-colors shadow-sm">
                    Get Started
                  </button>
                </SignUpButton>
              </>
            ) : (
              <>
                <Link href="/intent" className="text-[14px] text-[#71717A] hover:text-[#7C5CFC] mr-4 hidden sm:block">Match</Link>
                <UserButton />
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
          {/* Gradient blob */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(124,92,252,0.25) 0%, rgba(255,107,107,0.1) 50%, transparent 80%)",
            }}
          />

          <div className="container-app text-center relative z-10">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(124,92,252,0.1)] border border-[rgba(124,92,252,0.2)] mb-6">
              <Zap size={12} className="text-[#7C5CFC]" />
              <span className="text-[12px] font-semibold text-[#7C5CFC]">Voice-first idea discussions</span>
            </div>

            {/* Headline */}
            <h1 className="text-[2.5rem] sm:text-[3.5rem] lg:text-[4rem] font-bold text-[#18181B] leading-[1.1] tracking-[-0.02em] max-w-3xl mx-auto">
              Talk to a stranger{" "}
              <span className="text-[#7C5CFC]">about your idea</span>{" "}
              — right now.
            </h1>

            <p className="mt-5 text-[18px] sm:text-[20px] text-[#71717A] max-w-xl mx-auto leading-relaxed">
              Get instant, honest feedback from a real person. No scheduling.
              No camera. No bias. Just voice — in under 30 seconds.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {userId ? (
                <Link
                  href="/intent"
                  id="hero-cta"
                  className="inline-flex items-center gap-2 px-8 py-4 text-[16px] font-semibold text-white bg-[#7C5CFC] hover:bg-[#6547E0] rounded-full transition-all shadow-glow hover:shadow-[0_0_30px_rgba(124,92,252,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                >
                  Start Talking
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <button
                    id="hero-cta"
                    className="inline-flex items-center gap-2 px-8 py-4 text-[16px] font-semibold text-white bg-[#7C5CFC] hover:bg-[#6547E0] rounded-full transition-all shadow-glow hover:shadow-[0_0_30px_rgba(124,92,252,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                  >
                    Start Talking
                    <ArrowRight size={18} />
                  </button>
                </SignUpButton>
              )}
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-4 text-[15px] font-medium text-[#18181B] border border-[#E5E5E8] bg-white rounded-full hover:border-[#7C5CFC]/40 transition-all"
              >
                How it Works
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="mt-10 flex items-center justify-center gap-6 text-[13px] text-[#71717A]">
              <span className="flex items-center gap-1.5"><Shield size={14} className="text-[#22C55E]" /> AI-moderated</span>
              <span className="flex items-center gap-1.5"><Mic size={14} className="text-[#7C5CFC]" /> Voice only</span>
              <span className="flex items-center gap-1.5"><Users size={14} className="text-[#64748B]" /> 18+ only</span>
            </div>
          </div>
        </section>

        {/* ── Ad Slot (below fold) ── */}
        <div className="container-app pb-6">
          <AdSlot height={90} />
        </div>

        {/* ── How it Works ── */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="text-[1.75rem] font-bold text-[#18181B] mb-3">How PitchLine works</h2>
              <p className="text-[16px] text-[#71717A] max-w-md mx-auto">Three steps from landing to a live conversation with a real person.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                {
                  step: "1",
                  icon: "🎯",
                  title: "Pick your intent",
                  desc: "Choose why you're here — pitching, giving feedback, open discussion, or founder chat.",
                },
                {
                  step: "2",
                  icon: "⚡",
                  title: "Get matched instantly",
                  desc: "Our matching engine pairs you with the right stranger in seconds. No waiting rooms.",
                },
                {
                  step: "3",
                  icon: "🎙️",
                  title: "Talk it out",
                  desc: "Voice-first, no camera. Honest, anonymous conversation. Skip any time. Add contacts you click with.",
                },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="flex flex-col items-center text-center p-6 rounded-[16px] bg-[#FAFAFA] border border-[#E5E5E8]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#FF6B6B] flex items-center justify-center text-white font-bold text-[18px] mb-4 shadow-[0_4px_16px_rgba(124,92,252,0.3)]">
                    {step}
                  </div>
                  <span className="text-3xl mb-3" aria-hidden="true">{icon}</span>
                  <h3 className="text-[17px] font-semibold text-[#18181B] mb-2">{title}</h3>
                  <p className="text-[14px] text-[#71717A] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust section ── */}
        <section className="py-16 bg-[#FAFAFA]">
          <div className="container-app max-w-2xl mx-auto text-center">
            <h2 className="text-[1.5rem] font-bold text-[#18181B] mb-8">Built with safety first</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: <Mic size={20} className="text-[#7C5CFC]" />, title: "No Camera", desc: "Audio-only by design. No appearance bias, no privacy risk." },
                { icon: <Shield size={20} className="text-[#22C55E]" />, title: "AI-Moderated", desc: "Real-time text moderation and quick report review." },
                { icon: <Star size={20} className="text-[#F59E0B]" />, title: "Report Anytime", desc: "One-tap report with reason codes. Our team reviews every one." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="p-5 bg-white border border-[#E5E5E8] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-center">
                  <div className="flex justify-center mb-3">{icon}</div>
                  <p className="text-[15px] font-semibold text-[#18181B] mb-1">{title}</p>
                  <p className="text-[13px] text-[#71717A]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-20 bg-gradient-to-br from-[#7C5CFC] to-[#FF6B6B]">
          <div className="container-app text-center text-white">
            <h2 className="text-[2rem] font-bold mb-3">Ready to pitch your idea?</h2>
            <p className="text-[16px] text-white/80 mb-7">Join thousands of founders getting real, unfiltered feedback.</p>
            {userId ? (
              <Link
                href="/intent"
                className="inline-flex items-center gap-2 px-8 py-4 text-[16px] font-semibold text-[#7C5CFC] bg-white rounded-full hover:bg-[#F4F4F5] transition-all shadow-lg hover:-translate-y-0.5 active:scale-95"
              >
                Start Talking <ArrowRight size={18} />
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <button className="inline-flex items-center gap-2 px-8 py-4 text-[16px] font-semibold text-[#7C5CFC] bg-white rounded-full hover:bg-[#F4F4F5] transition-all shadow-lg hover:-translate-y-0.5 active:scale-95">
                  Start Talking <ArrowRight size={18} />
                </button>
              </SignUpButton>
            )}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="py-8 border-t border-[#E5E5E8] bg-white">
        <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#71717A]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[8px] bg-gradient-to-br from-[#7C5CFC] to-[#FF6B6B] flex items-center justify-center shadow-sm">
              <Radio size={12} className="text-white" />
            </div>
            <span className="font-medium text-[#18181B]">PitchLine</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-[#18181B] transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-[#18181B] transition-colors">Privacy Policy</Link>
            <Link href="/blog" className="hover:text-[#18181B] transition-colors">Blog</Link>
          </div>
          <p>© {new Date().getFullYear()} PitchLine. 18+ only.</p>
        </div>
      </footer>
    </div>
  );
}
