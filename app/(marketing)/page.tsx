import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";
import Logo from "@/components/ui/Logo";
import MobileMenu from "@/components/layout/MobileMenu";
import StickyNote from "@/components/ui/StickyNote";
import HandTimer from "@/components/ui/HandTimer";
import { CallMockup, ChatMockup } from "@/components/landing/PhoneMockups";
import HeroBackground from "@/components/landing/HeroBackground";
import {
  MicDoodle, ChatDoodle, BulbDoodle, TargetDoodle, PeopleDoodle,
  MegaphoneDoodle, RocketDoodle, NoCameraDoodle, ShieldDoodle, FlagDoodle, SkipDoodle,
  SparkleDoodle, SoundWavesDoodle, CurlyArrow, Squiggle,
} from "@/components/doodles/Doodles";
import { POPULAR_TAGS, TAG_CATEGORIES } from "@/lib/tags";

export const metadata: Metadata = {
  title: "Stranger Voice Chat — Voice Chat with Strangers Who Share Your Tag",
  description:
    "Pick a tag like Textile, SaaS or Real Estate and talk by voice to a stranger who picked the same tag. No signup, no camera, free. 18+ and moderated.",
};

const USES = [
  { Doodle: TargetDoodle, title: "Find suppliers & buyers", desc: "On #Textile or #Import & Export, talk to people who actually trade in your space.", note: "bg-note-yellow" },
  { Doodle: BulbDoodle, title: "Swap industry tips", desc: "Prices, vendors, regulations: the things you only learn from someone in the same line.", note: "bg-note-pink" },
  { Doodle: RocketDoodle, title: "Test a startup idea", desc: "Pick #Startup Ideas and hear in minutes whether a stranger gets it.", note: "bg-note-blue" },
  { Doodle: PeopleDoodle, title: "Get career advice", desc: "On #Job Hunting or #Career Switch, talk to someone a step ahead of you.", note: "bg-note-green" },
  { Doodle: MegaphoneDoodle, title: "Practise a pitch", desc: "Run your pitch on a real person before the meeting that matters.", note: "bg-note-orange" },
  { Doodle: ChatDoodle, title: "Meet people in your niche", desc: "Hit it off? Add each other as friends and talk again later.", note: "bg-note-yellow" },
];

const FAQS = [
  {
    q: "What is Stranger Voice Chat?",
    a: "A free voice chat for meeting strangers who care about the same thing. You pick a tag, like Textile or SaaS, and we connect you with someone who picked the same tag.",
  },
  {
    q: "Do I need an account?",
    a: "No. There's no signup, no email and no login. Confirm you're 18 or older once, pick a tag and tap Find someone.",
  },
  {
    q: "What if nobody is on my tag?",
    a: "We look for 45 seconds. If nobody with the same tag shows up, you can retry or pick another tag. The tag list shows how many people are waiting on each tag right now.",
  },
  {
    q: "Is Stranger Voice Chat anonymous?",
    a: "Yes. There's no camera, no profile photo and no real name. The other person only knows you picked the same tag.",
  },
  {
    q: "Do you record my calls?",
    a: "No. Voice is never recorded or stored. If someone is reported, we keep only the report details and any text chat, for up to 30 days, so our team can review it.",
  },
  {
    q: "What happens if someone is rude?",
    a: "Tap Report. The call ends immediately, that person is blocked for you, and our team reviews every report. Repeat offenders are banned.",
  },
  {
    q: "Can I talk to the same person again?",
    a: "Yes. If you both tap Add friend during or after the call, you're saved in each other's Friends list on that device.",
  },
  {
    q: "Who can use Stranger Voice Chat?",
    a: "Anyone 18 or older. Conversations are between adults, so everyone confirms their age before their first call.",
  },
  {
    q: "Is it free?",
    a: "Yes. Talking on Stranger Voice Chat is free.",
  },
];

const btnPrimary =
  "inline-flex items-center justify-center px-6 py-3.5 text-[16px] font-bold text-on-primary bg-primary border-2 border-primary hover:bg-primary-hover hover:border-primary-hover hover:-translate-y-0.5 rounded-[12px] transition-all";
const btnSecondary =
  "inline-flex items-center justify-center px-6 py-3.5 text-[16px] font-bold text-ink bg-surface border-2 border-outline hover:bg-paper-2 hover:-translate-y-0.5 rounded-[12px] transition-all";

function SectionHeading({ note, title, children }: { note: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="reveal">
      <span className="font-hand text-[26px] text-marker">{note}</span>
      <h2 className="mt-1 text-[2rem] sm:text-[2.5rem] font-extrabold tracking-tight leading-[1.1]">{title}</h2>
      {children}
    </div>
  );
}

export default function LandingPage() {
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
          <Link href="/" aria-label="Stranger Voice Chat home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-6 lg:gap-8 text-[15px] font-medium" aria-label="Main">
            <Link href="#how-it-works" className="hidden md:block hover:text-primary transition-colors">How it works</Link>
            <Link href="#tags" className="hidden md:block hover:text-primary transition-colors">Tags</Link>
            <Link href="#faq" className="hidden md:block hover:text-primary transition-colors">FAQ</Link>
            <Link href="/blog" className="hidden md:block hover:text-primary transition-colors">Blog</Link>
            <Link
              href="/intent"
              className="px-4 sm:px-5 py-2.5 text-[15px] font-bold text-on-primary bg-primary hover:bg-primary-hover rounded-[10px] transition-colors whitespace-nowrap"
            >
              Start talking
            </Link>
            {/* Phones and small tablets: the section links live in a menu */}
            <MobileMenu
              links={[
                { href: "#how-it-works", label: "How it works" },
                { href: "#tags", label: "Tags" },
                { href: "#faq", label: "FAQ" },
                { href: "/blog", label: "Blog" },
                { href: "/contacts", label: "Friends" },
                { href: "/history", label: "History" },
                { href: "/settings", label: "Settings" },
              ]}
              hideFrom="md:hidden"
              top="top-[72px]"
            />
          </nav>
        </div>
      </header>

      <main>
        {/* ── Hero ── animated backdrop behind, content on top */}
        <section className="relative">
        <HeroBackground />
        <div className="relative container-app grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-10 pt-10 lg:pt-14 pb-20">
          <div className="flex flex-col gap-6 lg:pt-5">
            <span className="font-hand text-[30px] text-marker -rotate-3 self-start leading-none anim-rise-in">
              pick a tag <span className="inline-block anim-wiggle">↓</span>
            </span>

            <h1 className="relative text-[3rem] sm:text-[4rem] lg:text-[4.75rem] font-extrabold leading-none tracking-[-0.035em] anim-rise-in" style={{ "--delay": "0.1s" } as React.CSSProperties}>
              Talk to someone who&apos;s into{" "}
              {/* Phones: plain marker underline so the words can wrap. Desktop: hand-drawn stroke. */}
              <span className="relative underline decoration-highlight decoration-[8px] underline-offset-[10px] lg:no-underline lg:inline-block">
                the same thing.
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
              <SparkleDoodle size={34} className="hidden sm:block absolute -top-3 right-[8%] lg:right-[14%] text-highlight anim-wiggle" />
            </h1>

            <p className="mt-2 text-[18px] sm:text-[19px] leading-relaxed text-muted max-w-[520px] anim-rise-in" style={{ "--delay": "0.2s" } as React.CSSProperties}>
              Choose a tag like Textile, SaaS or Real Estate. We connect you by voice with a stranger who picked the
              same tag. No signup, no camera, free.
            </p>

            {/* Phones: full-width stacked buttons; larger screens: side by side */}
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3 anim-rise-in" style={{ "--delay": "0.3s" } as React.CSSProperties}>
              <Link href="/intent" className={btnPrimary}>Pick a tag</Link>
              <Link href="#tags" className={btnSecondary}>Browse all tags</Link>
            </div>

            {/* Quick picks */}
            <div className="flex flex-wrap gap-2 anim-rise-in" style={{ "--delay": "0.4s" } as React.CSSProperties} aria-label="Popular tags">
              {POPULAR_TAGS.slice(0, 6).map(tag => (
                <Link
                  key={tag.slug}
                  href={`/intent?tag=${tag.slug}`}
                  className="px-3 py-1.5 rounded-[10px] border-2 border-line bg-surface text-[14px] font-bold hover:border-outline hover:-translate-y-0.5 transition-all"
                >
                  #{tag.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Whiteboard collage — two people on the same tag get matched */}
          <div className="relative flex flex-col items-center gap-8 lg:block lg:min-h-[540px]" aria-label="Example: two people who both picked #Textile get connected">
            <div className="relative anim-float lg:absolute lg:left-[20px] lg:top-[10px]">
              <span className="absolute -top-6 -left-6 z-10 anim-pop-in" style={{ "--delay": "1s" } as React.CSSProperties}>
                <span className="absolute inset-0 rounded-full bg-highlight/30 blur-xl motion-safe:animate-pulse" />
                <BulbDoodle size={46} draw className="relative text-highlight" style={{ "--delay": "1.1s" } as React.CSSProperties} />
              </span>
              <StickyNote color="yellow" tilt={-4} drop delay={0.35} className="w-[250px] min-h-[200px]">
                <span className="inline-block px-2 py-0.5 border-2 border-ink text-[13px] font-extrabold">#Textile</span>
                <p className="mt-3 font-hand font-bold text-[27px] leading-[1.1]">Running a weaving unit in Surat. Who else is in cotton?</p>
              </StickyNote>
            </div>
            <div className="relative anim-float lg:absolute lg:right-[10px] lg:top-[90px]" style={{ "--delay": "1.2s" } as React.CSSProperties}>
              <span className="absolute -top-7 -right-5 z-10 anim-wiggle">
                <ChatDoodle size={42} draw className="text-marker" style={{ "--delay": "1.4s" } as React.CSSProperties} />
              </span>
              <StickyNote color="pink" tilt={3} drop delay={0.6} className="w-[240px] min-h-[190px]">
                <span className="inline-block px-2 py-0.5 border-2 border-ink text-[13px] font-extrabold">#Textile</span>
                <p className="mt-3 font-hand font-bold text-[26px] leading-[1.1]">I export towels to the UAE. Happy to share buyers!</p>
              </StickyNote>
            </div>
            <div className="flex items-center gap-3 lg:absolute lg:left-[80px] lg:top-[300px] anim-pop-in" style={{ "--delay": "0.9s" } as React.CSSProperties}>
              <SoundWavesDoodle size={34} flip className="text-primary" />
              {/* Slowly turning dashed ring around the "match" circle */}
              <span className="relative">
                <svg viewBox="0 0 220 220" className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] text-primary/40 anim-spin-slow" aria-hidden="true">
                  <circle cx="110" cy="110" r="104" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 12" strokeLinecap="round" />
                </svg>
                <HandTimer value="✓" caption="matched" size={140} />
              </span>
              <span className="font-hand text-[26px] leading-[1.1] text-primary">
                ← same tag,<br />instant voice call
              </span>
            </div>
          </div>
        </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="py-20 border-t-2 border-outline scroll-mt-20">
          <div className="container-app">
            <SectionHeading note="how it works" title="Same tag, real conversation" />
            <ol className="mt-12 grid gap-8 md:grid-cols-3 relative">
              {[
                { Doodle: TargetDoodle, step: "1", title: "Pick a tag", desc: "Search 130+ tags across industries, tech, business, careers and more. Add a country or language if you like.", color: "yellow" as const },
                { Doodle: PeopleDoodle, step: "2", title: "Get matched on it", desc: "We only connect you with someone who picked the same tag. Nobody there in 45 seconds? Retry or choose another tag.", color: "pink" as const },
                { Doodle: MicDoodle, step: "3", title: "Talk, chat, add a friend", desc: "Voice call with text chat on the side. Skip anytime, or add each other as friends to talk again.", color: "blue" as const },
              ].map(({ Doodle, step, title, desc, color }, i) => (
                <li key={title} className="relative reveal">
                  <StickyNote color={color} tilt={i % 2 === 0 ? -1.5 : 1.5} className="h-full">
                    <div className="flex items-start justify-between">
                      <span className="font-hand text-[32px] text-primary leading-none">{step}</span>
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
                  <span className="block mt-1 text-[15px] text-muted">Mute, skip, add a friend or report, one tap each.</span>
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

        {/* ── All tags ── every tag links straight into the picker */}
        <section id="tags" className="py-20 border-t-2 border-outline scroll-mt-20">
          <div className="container-app">
            <SectionHeading note="130+ tags" title="Find your people">
              <p className="mt-3 text-[17px] text-muted max-w-[600px]">
                Tap a tag to start. You&apos;ll only be connected with someone who picked the same one.
              </p>
            </SectionHeading>
            <div className="mt-10 flex flex-col gap-8">
              {TAG_CATEGORIES.map(cat => (
                <div key={cat.id} className="reveal">
                  <h3 className="font-hand font-bold text-[26px] text-marker leading-none mb-3">{cat.label.toLowerCase()}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {cat.tags.map((tag, i) => (
                      <li key={tag.slug}>
                        <Link
                          href={`/intent?tag=${tag.slug}`}
                          className={`${cat.note} inline-block px-3.5 py-2 font-bold text-[14px] hover:-translate-y-0.5 transition-transform`}
                          style={{ rotate: `${i % 3 === 0 ? -1.2 : i % 3 === 1 ? 1 : 0}deg` }}
                        >
                          #{tag.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Ad slot (below the fold, between content sections) ── */}
        <div className="container-app pb-10">
          <AdSlot height={90} variant={0} />
        </div>

        {/* ── Ways to use ── */}
        <section className="py-20 border-t-2 border-outline bg-surface">
          <div className="container-app">
            <SectionHeading note="ways to use it" title="Strangers with something in common">
              <p className="mt-3 text-[17px] text-muted max-w-[560px]">
                Business owners, founders, students and the curious all use it differently.
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

        {/* ── Safety ── */}
        <section className="py-20">
          <div className="container-app">
            <SectionHeading note="the ground rules" title="Anonymous, but not lawless" />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { Doodle: NoCameraDoodle, title: "No camera, no signup", desc: "Voice only. No photos, no names, no email. Just the tag you share." },
                { Doodle: ShieldDoodle, title: "18+ and moderated", desc: "Everyone confirms they're 18+. Text messages are checked before anyone sees them." },
                { Doodle: FlagDoodle, title: "One-tap report", desc: "Reporting ends the call and blocks that person for you immediately." },
                { Doodle: SkipDoodle, title: "Skip anytime", desc: "Not a good match? Skip and get the next person on your tag." },
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
              <h2 className="mt-1 text-[2rem] sm:text-[2.75rem] font-extrabold tracking-tight">Pick your tag. Say hello.</h2>
              <Squiggle size={150} scroll className="mx-auto mt-2 text-primary" />
              <p className="mt-3 text-[17px] text-ink/80">No signup. Your first call takes less than a minute to start.</p>
              <div className="mt-7 grid grid-cols-1 sm:flex sm:flex-wrap sm:justify-center gap-3">
                <Link href="/intent" className={btnPrimary}>Pick a tag</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="py-4 border-t-2 border-outline bg-surface">
        <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-[14px] text-muted">
          <Link href="/" aria-label="Stranger Voice Chat home">
            <Logo small />
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-ink transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
            <Link href="/blog" className="hover:text-ink transition-colors">Blog</Link>
          </div>
          <p>© {new Date().getFullYear()} Stranger Voice Chat · 18+ only</p>
        </div>
      </footer>
    </div>
  );
}
