import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";
import Logo from "@/components/ui/Logo";
import MobileMenu from "@/components/layout/MobileMenu";
import StickyNote from "@/components/ui/StickyNote";
import PitchCountdown from "@/components/landing/PitchCountdown";
import { CallMockup, ChatMockup } from "@/components/landing/PhoneMockups";
import {
  MicDoodle, ChatDoodle, InfinityDoodle, BulbDoodle, TargetDoodle, PeopleDoodle,
  MegaphoneDoodle, RocketDoodle, NoCameraDoodle, ShieldDoodle, FlagDoodle, SkipDoodle,
  SparkleDoodle, SoundWavesDoodle, CurlyArrow, Squiggle,
} from "@/components/doodles/Doodles";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "PitchLine — Pitch Your Idea to a Stranger",
  description:
    "Anonymous voice calls for founders and idea people. 60 seconds to pitch, 3 minutes of honest feedback from someone who doesn't know you. No camera, moderated, 18+.",
};

const TOPICS = [
  "SaaS", "Consumer app", "AI", "Marketplace", "D2C / E-commerce", "Fintech",
  "Health", "Climate", "Creator economy", "Local business",
] as const;

// Full class names so Tailwind can see them
const NOTE_BG = ["bg-note-yellow", "bg-note-pink", "bg-note-blue", "bg-note-green", "bg-note-orange"] as const;

const USES = [
  { Doodle: TargetDoodle, title: "Validate an idea", desc: "Hear in minutes whether a stranger gets it, wants it, or would pay for it.", note: "bg-note-yellow" },
  { Doodle: MegaphoneDoodle, title: "Practice your pitch", desc: "Run your 60-second pitch on real people before the investor meeting.", note: "bg-note-pink" },
  { Doodle: BulbDoodle, title: "Find fresh angles", desc: "Listeners ask the questions your friends are too polite to ask.", note: "bg-note-blue" },
  { Doodle: PeopleDoodle, title: "Meet other founders", desc: "Swap notes with someone building in the same space, then add them as a contact.", note: "bg-note-green" },
  { Doodle: ChatDoodle, title: "Give feedback", desc: "Hear new ideas every day and sharpen your own product sense.", note: "bg-note-orange" },
  { Doodle: RocketDoodle, title: "Beat founder loneliness", desc: "Building alone is hard. A quick call with a peer helps.", note: "bg-note-yellow" },
];

const FAQS = [
  {
    q: "Is PitchLine anonymous?",
    a: "Yes. There's no camera, no profile photo and no real name. The other person sees only a handle like Founder #4821 and your one-line idea, if you add one.",
  },
  {
    q: "Do you record my calls?",
    a: "No. Voice is never recorded or stored. If someone is reported, we keep only the report details and any text chat, for up to 30 days, so our team can review it.",
  },
  {
    q: "Will someone steal my idea?",
    a: "Ideas are rarely the hard part; building them is. Still, share the problem and your angle, and keep anything truly confidential (code, deals, customer lists) to yourself.",
  },
  {
    q: "What happens if someone is rude?",
    a: "Tap Report. The call ends immediately, that person is blocked for you, and our team reviews every report. Repeat offenders are banned.",
  },
  {
    q: "Who can use PitchLine?",
    a: "Anyone 18 or older. Conversations are between adults, so we ask everyone to confirm their age before their first call.",
  },
  {
    q: "Can I talk to the same person again?",
    a: "Yes. If you both tap Contact during or after the call, you're added to each other's contacts and can message later.",
  },
  {
    q: "Is it free?",
    a: "Yes, talking to strangers on PitchLine is free.",
  },
];

const btnPrimary =
  "inline-flex items-center justify-center px-6 py-3.5 text-[16px] font-bold text-on-primary bg-primary border-2 border-primary hover:bg-primary-hover hover:border-primary-hover hover:-translate-y-0.5 rounded-[12px] transition-all";
const btnSecondary =
  "inline-flex items-center justify-center px-6 py-3.5 text-[16px] font-bold text-ink bg-surface border-2 border-outline hover:bg-paper-2 hover:-translate-y-0.5 rounded-[12px] transition-all";

// Signed-in users go straight to the app; everyone else signs up first (until guest mode lands in Step 3)
function StartPitching({ signedIn, className, label = "Start pitching" }: { signedIn: boolean; className: string; label?: string }) {
  return signedIn ? (
    <Link href="/intent" className={className}>{label}</Link>
  ) : (
    <SignUpButton mode="modal">
      <button className={className}>{label}</button>
    </SignUpButton>
  );
}

function SectionHeading({ note, title, children }: { note: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="reveal">
      <span className="font-hand text-[26px] text-marker">{note}</span>
      <h2 className="mt-1 text-[2rem] sm:text-[2.5rem] font-extrabold tracking-tight leading-[1.1]">{title}</h2>
      {children}
    </div>
  );
}

export default async function LandingPage() {
  const { userId } = await auth();
  const signedIn = !!userId;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <div className="min-h-screen bg-dots flex flex-col text-ink overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-md">
        <div className="container-app flex items-center justify-between h-[72px]">
          <Link href="/" aria-label="PitchLine home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-6 lg:gap-8 text-[15px] font-medium" aria-label="Main">
            <Link href="#how-it-works" className="hidden md:block hover:text-primary transition-colors">How it works</Link>
            <Link href="#topics" className="hidden md:block hover:text-primary transition-colors">Topics</Link>
            <Link href="#faq" className="hidden md:block hover:text-primary transition-colors">FAQ</Link>
            <Link href="/blog" className="hidden md:block hover:text-primary transition-colors">Blog</Link>
            {signedIn ? (
              <>
                <Link href="/intent" className="px-4 sm:px-5 py-2.5 text-[15px] font-bold text-on-primary bg-primary hover:bg-primary-hover rounded-[10px] transition-colors whitespace-nowrap">Start pitching</Link>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="hidden md:block hover:text-primary transition-colors">Log in</button>
                </SignInButton>
                <StartPitching signedIn={signedIn} className="px-4 sm:px-5 py-2.5 text-[15px] font-bold text-on-primary bg-primary hover:bg-primary-hover rounded-[10px] transition-colors whitespace-nowrap" />
              </>
            )}
            {/* Phones and small tablets: the section links live in a menu */}
            <MobileMenu
              links={[
                { href: "#how-it-works", label: "How it works" },
                { href: "#topics", label: "Topics" },
                { href: "#faq", label: "FAQ" },
                { href: "/blog", label: "Blog" },
                ...(signedIn ? [{ href: "/intent", label: "Talk" }, { href: "/contacts", label: "Contacts" }, { href: "/history", label: "History" }] : []),
                { href: "/settings", label: "Settings" },
              ]}
              signedIn={signedIn}
              hideFrom="md:hidden"
              top="top-[72px]"
            />
          </nav>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="container-app grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-10 pt-10 lg:pt-14 pb-20">
          <div className="flex flex-col gap-6 lg:pt-5">
            <span className="font-hand text-[30px] text-marker -rotate-3 self-start leading-none anim-rise-in">
              got an idea? <span className="inline-block anim-wiggle">↓</span>
            </span>

            <h1 className="relative text-[3rem] sm:text-[4rem] lg:text-[5rem] font-extrabold leading-none tracking-[-0.035em] anim-rise-in" style={{ "--delay": "0.1s" } as React.CSSProperties}>
              Say it out loud to someone who{" "}
              {/* Phones: plain marker underline so the words can wrap. Desktop: hand-drawn stroke. */}
              <span className="relative underline decoration-highlight decoration-[8px] underline-offset-[10px] lg:no-underline lg:inline-block">
                doesn&apos;t know you.
                <svg
                  className="hidden lg:block absolute left-0 -bottom-3 w-full h-6 doodle-draw"
                  style={{ "--delay": "0.6s" } as React.CSSProperties}
                  viewBox="0 0 560 24"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M4 16 Q140 4 280 12 T556 8" fill="none" className="stroke-highlight" strokeWidth="10" strokeLinecap="round" opacity="0.85" pathLength={1} />
                </svg>
              </span>
              <SparkleDoodle size={34} className="hidden sm:block absolute -top-3 right-[8%] lg:right-[18%] text-highlight anim-wiggle" />
            </h1>

            <p className="mt-2 text-[18px] sm:text-[19px] leading-relaxed text-muted max-w-[500px] anim-rise-in" style={{ "--delay": "0.2s" } as React.CSSProperties}>
              Anonymous voice calls for founders and idea people. 60 seconds to pitch, 3 minutes of honest
              feedback, then keep talking or skip. 18+ and moderated.
            </p>

            {/* Phones: full-width stacked buttons; larger screens: side by side */}
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3 anim-rise-in" style={{ "--delay": "0.3s" } as React.CSSProperties}>
              <StartPitching signedIn={signedIn} className={btnPrimary} />
              <StartPitching signedIn={signedIn} className={btnSecondary} label="I'll give feedback" />
            </div>
          </div>

          {/* Whiteboard collage — notes drop in, then float */}
          <div className="relative flex flex-col items-center gap-8 lg:block lg:min-h-[540px]" aria-label="Example of a pitch and feedback">
            <div className="anim-float lg:absolute lg:left-[30px] lg:top-[10px]">
              <StickyNote color="yellow" tilt={-4} drop delay={0.35} className="w-[250px] min-h-[210px]">
                <p className="font-hand font-bold text-[32px] leading-[1.1]">Uber for dog walkers in tier-2 cities</p>
                <p className="mt-3 text-[13px] text-ink/70">Founder #4821 · pitching</p>
              </StickyNote>
            </div>
            <div className="anim-float lg:absolute lg:right-[20px] lg:top-[70px]" style={{ "--delay": "1.2s" } as React.CSSProperties}>
              <StickyNote color="pink" tilt={3} drop delay={0.6} className="w-[240px] min-h-[190px]">
                <p className="font-hand font-bold text-[28px] leading-[1.1]">Who pays, the owner or the walker?</p>
                <p className="mt-3 text-[13px] text-ink/70">Listener #0193 · feedback</p>
              </StickyNote>
            </div>
            <div className="flex items-center gap-3 lg:absolute lg:left-[90px] lg:top-[270px] anim-pop-in" style={{ "--delay": "0.9s" } as React.CSSProperties}>
              <SoundWavesDoodle size={34} flip className="text-primary" />
              <PitchCountdown />
              <span className="font-hand text-[26px] leading-[1.1] text-primary">
                ← 60 sec pitch,<br />then 3 min feedback
              </span>
            </div>
            <div className="flex gap-2.5 lg:absolute lg:left-[40px] lg:bottom-[30px]">
              {[
                { label: "Pitcher", bg: "bg-note-blue", rot: "-rotate-2", d: 1.1 },
                { label: "Listener", bg: "bg-note-green", rot: "rotate-[1.5deg]", d: 1.2 },
                { label: "Founder", bg: "bg-note-orange", rot: "-rotate-1", d: 1.3 },
              ].map(({ label, bg, rot, d }) => (
                <span key={label} className="anim-pop-in" style={{ "--delay": `${d}s` } as React.CSSProperties}>
                  <span className={`${bg} ${rot} inline-block px-4 py-2.5 font-bold text-[15px]`}>{label}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── See it in action (phone previews) ── */}
        <section className="py-20 border-t-2 border-outline bg-surface overflow-hidden">
          <div className="container-app">
            <SectionHeading note="see it in action" title="Voice first, with chat when you need it">
              <p className="mt-3 text-[17px] text-muted max-w-[580px]">
                Talk like you&apos;re on a phone call. Drop a link or a number into the chat without breaking the flow.
              </p>
            </SectionHeading>

            <div className="mt-14 grid gap-14 md:grid-cols-2 justify-items-center">
              <figure className="flex flex-col items-center gap-6 reveal">
                <CallMockup />
                <figcaption className="text-center max-w-[300px]">
                  <span className="flex items-center justify-center gap-2 font-extrabold text-[18px]">
                    <MicDoodle size={28} scroll className="text-primary" /> Voice calls
                  </span>
                  <span className="block mt-1 text-[15px] text-muted">Mute, skip, add a contact or report, one tap each.</span>
                </figcaption>
              </figure>
              <figure className="flex flex-col items-center gap-6 reveal">
                <ChatMockup />
                <figcaption className="text-center max-w-[300px]">
                  <span className="flex items-center justify-center gap-2 font-extrabold text-[18px]">
                    <ChatDoodle size={28} scroll className="text-primary" /> Chat on the side
                  </span>
                  <span className="block mt-1 text-[15px] text-muted">Every message is checked by moderation before it&apos;s delivered.</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ── How a round works ── */}
        <section id="how-it-works" className="py-20 border-t-2 border-outline scroll-mt-20">
          <div className="container-app">
            <SectionHeading note="how it works" title="One round, three parts" />
            <ol className="mt-12 grid gap-8 md:grid-cols-3 relative">
              {[
                { Doodle: MicDoodle, time: "1:00", title: "You pitch", desc: "One idea, one minute, no slides. Your match sees your one-line idea card before the call starts.", color: "yellow" as const },
                { Doodle: ChatDoodle, time: "3:00", title: "They push back", desc: "Questions, doubts, what they would pay for. Honest, because they don't know you.", color: "pink" as const },
                { Doodle: InfinityDoodle, time: "∞", title: "Free talk", desc: "Keep going, swap roles, add each other as contacts, or skip to the next person.", color: "blue" as const },
              ].map(({ Doodle, time, title, desc, color }, i) => (
                <li key={title} className="relative reveal">
                  <StickyNote color={color} tilt={i % 2 === 0 ? -1.5 : 1.5} className="h-full">
                    <div className="flex items-start justify-between">
                      <span className="font-hand text-[28px] text-primary leading-none">{time}</span>
                      <Doodle size={44} scroll className="text-ink" />
                    </div>
                    <h3 className="mt-2 text-[20px] font-extrabold">{title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{desc}</p>
                  </StickyNote>
                  {/* Arrow to the next step (desktop) */}
                  {i < 2 && (
                    <CurlyArrow size={70} scroll className="hidden md:block absolute -right-[52px] top-1/2 -translate-y-1/2 z-10 text-marker" />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Ways to use ── */}
        <section className="py-20 border-t-2 border-outline bg-surface">
          <div className="container-app">
            <SectionHeading note="ways to use pitchline" title="Not just for pitching">
              <p className="mt-3 text-[17px] text-muted max-w-[560px]">
                Founders, students, side-project builders and curious listeners all use it differently.
              </p>
            </SectionHeading>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {USES.map(({ Doodle, title, desc, note }) => (
                <div key={title} className="reveal group bg-surface border-2 border-outline rounded-[16px] p-6 hover:-translate-y-1 hover:shadow-note transition-all">
                  <span className={`${note} inline-flex p-2.5 -rotate-3 group-hover:rotate-3 transition-transform`}>
                    <Doodle size={36} scroll className="text-ink" />
                  </span>
                  <h3 className="mt-4 text-[18px] font-extrabold">{title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Ad slot (below the fold, between content sections) ── */}
        <div className="container-app py-10">
          <AdSlot height={90} variant={0} />
        </div>

        {/* ── Pick your seat ── */}
        <section className="pb-20">
          <div className="container-app">
            <SectionHeading note="pick your seat" title="Who are you today?" />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { role: "Pitcher", desc: "You have an idea and want honest feedback before you build it.", bg: "bg-note-blue" },
                { role: "Listener", desc: "You like hearing new ideas and want to help with sharp questions.", bg: "bg-note-green" },
                { role: "Founder", desc: "You're building something and want a peer to swap notes with.", bg: "bg-note-orange" },
              ].map(({ role, desc, bg }) => (
                <div key={role} className="reveal bg-surface border-2 border-outline rounded-[16px] p-6">
                  <span className={`${bg} inline-block px-3 py-1.5 font-bold text-[15px] -rotate-2`}>{role}</span>
                  <p className="mt-4 text-[16px] leading-relaxed text-muted">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Topics ── */}
        <section id="topics" className="py-20 border-t-2 border-outline bg-surface scroll-mt-20">
          <div className="container-app">
            <SectionHeading note="what do you want to talk about?" title="Pick a topic, or go random">
              <p className="mt-3 text-[17px] text-muted max-w-[560px]">
                We match you with someone on the same topic first, then widen the search so you never wait long.
              </p>
            </SectionHeading>
            <ul className="mt-8 flex flex-wrap gap-3">
              {TOPICS.map((topic, i) => (
                <li
                  key={topic}
                  className="anim-pop-in"
                  style={{ "--delay": `${i * 0.05}s` } as React.CSSProperties}
                >
                  <span
                    className={`${NOTE_BG[i % NOTE_BG.length]} inline-block px-4 py-2.5 font-bold text-[15px] hover:-translate-y-0.5 transition-transform`}
                    style={{ rotate: `${i % 2 === 0 ? -1.5 : 1.5}deg` }}
                  >
                    {topic}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Safety ── */}
        <section className="py-20">
          <div className="container-app">
            <SectionHeading note="the ground rules" title="Anonymous, but not lawless" />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { Doodle: NoCameraDoodle, title: "No camera", desc: "Voice only. No photos, no real names. Just a handle like Founder #4821." },
                { Doodle: ShieldDoodle, title: "18+ and moderated", desc: "Every text message and idea card is checked before anyone sees it." },
                { Doodle: FlagDoodle, title: "One-tap report", desc: "Reporting ends the call and blocks that person for you immediately." },
                { Doodle: SkipDoodle, title: "Skip anytime", desc: "Not a good match? Skip and get the next person in seconds." },
              ].map(({ Doodle, title, desc }) => (
                <div key={title} className="reveal bg-surface border-2 border-outline rounded-[16px] p-6">
                  <Doodle size={40} scroll className="text-primary" />
                  <h3 className="mt-3 text-[17px] font-extrabold">{title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-20 border-t-2 border-outline bg-surface scroll-mt-20">
          <div className="container-app max-w-[820px]">
            <SectionHeading note="questions?" title="Frequently asked" />
            <div className="mt-10 flex flex-col gap-3">
              {FAQS.map(({ q, a }) => (
                <details key={q} className="reveal group border-2 border-outline rounded-[14px] bg-surface open:border-highlight transition-colors">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 text-[17px] font-bold [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown size={20} className="shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="px-5 pb-5 -mt-1 text-[16px] leading-relaxed text-muted">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-24">
          <div className="container-app">
            <div className="reveal relative bg-note-yellow shadow-note px-6 py-14 sm:px-12 text-center -rotate-1">
              <SparkleDoodle size={36} className="absolute top-6 left-8 text-marker anim-wiggle" />
              <SparkleDoodle size={24} className="absolute bottom-8 right-10 text-primary anim-wiggle" />
              <span className="font-hand text-[28px] text-marker">your turn</span>
              <h2 className="mt-1 text-[2rem] sm:text-[2.75rem] font-extrabold tracking-tight">Ready to say it out loud?</h2>
              <Squiggle size={150} scroll className="mx-auto mt-2 text-primary" />
              <p className="mt-3 text-[17px] text-ink/80">Your first pitch takes less than a minute to start.</p>
              <div className="mt-7 grid grid-cols-1 sm:flex sm:flex-wrap sm:justify-center gap-3">
                <StartPitching signedIn={signedIn} className={btnPrimary} />
                <StartPitching signedIn={signedIn} className={btnSecondary} label="I'll give feedback" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="py-4 border-t-2 border-outline bg-surface">
        <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-[14px] text-muted">
          <Link href="/" aria-label="PitchLine home">
            <Logo small />
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-ink transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
            <Link href="/blog" className="hover:text-ink transition-colors">Blog</Link>
          </div>
          <p>© {new Date().getFullYear()} PitchLine · 18+ only</p>
        </div>
      </footer>
    </div>
  );
}
