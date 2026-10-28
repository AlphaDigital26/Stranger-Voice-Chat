import { clsx } from "clsx";

interface AdSlotProps {
  className?: string;
  height?: number;
  /** Which sample creative to show (0–5). Use a different one per page. */
  variant?: number;
}

// Placeholder creatives with made-up brands, so layouts can be judged with a realistic ad in place.
// Replace the body of this component with the real AdSense <ins> tag before launch.
const SAMPLE_ADS = [
  { brand: "Acme Notebooks", mark: "AN", color: "#0F766E", title: "The founder's notebook", text: "Lean canvas, pitch pages and 120 dotted sheets.", cta: "Shop now" },
  { brand: "Example Coffee Co.", mark: "EC", color: "#7C2D12", title: "Fuel for late-night builders", text: "20% off your first bag of fresh-roasted beans.", cta: "Order" },
  { brand: "Sample Cloud", mark: "SC", color: "#4338CA", title: "Host your MVP free for 12 months", text: "Deploy in one click. No card needed.", cta: "Start free" },
  { brand: "Demo Coworking", mark: "DC", color: "#B45309", title: "A desk wherever you build", text: "Day passes from ₹299 in 40 cities.", cta: "Book a desk" },
  { brand: "Specimen UI Kit", mark: "SU", color: "#BE185D", title: "Ship a landing page tonight", text: "500+ templates for startup websites.", cta: "Browse" },
  { brand: "Mock Mic Pro", mark: "MM", color: "#1D4ED8", title: "Sound clear on every call", text: "USB microphone with noise cancelling, ₹1,999.", cta: "Buy now" },
];

// AdSense-compliant ad slot component
// ONLY imported in eligible screen route files:
//   landing, /intent, /post-call, /history, /contacts (list), /settings, /blog
// NEVER imported in /call/:sessionId or /contacts/:id/messages
// Per AdSense "Ads in Private Communications" policy + UIUX Brief §12a
export default function AdSlot({ className, height = 90, variant = 0 }: AdSlotProps) {
  const ad = SAMPLE_ADS[Math.abs(variant) % SAMPLE_ADS.length];

  return (
    <div className={clsx("w-full", className)}>
      {/* "Sponsored" disclosure — per AdSense policy */}
      <p className="text-[11px] text-muted font-medium text-center mb-1">
        <span className="uppercase tracking-wide">Sponsored</span> · sample ad, not a real company
      </p>
      {/* Ad container — fixed min-height prevents layout shift */}
      <div
        // Ads render their own light creative, like real display ads do on a dark site
        className="on-light w-full rounded-[12px] bg-surface border border-line overflow-hidden flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-2 px-4 py-3"
        style={{ minHeight: height }}
        aria-label={`Sample advertisement: ${ad.brand}`}
        role="complementary"
      >

        <span
          className="w-12 h-12 rounded-[10px] flex items-center justify-center text-white text-[16px] font-extrabold shrink-0"
          style={{ background: ad.color }}
          aria-hidden="true"
        >
          {ad.mark}
        </span>

        <div className="flex-1 min-w-[160px]">
          <p className="text-[12px] font-bold" style={{ color: ad.color }}>{ad.brand}</p>
          <p className="text-[15px] font-extrabold leading-snug">{ad.title}</p>
          <p className="text-[13px] text-muted leading-snug">{ad.text}</p>
        </div>

        {/* Not a link: a sample creative shouldn't send people anywhere */}
        <span
          className="shrink-0 px-4 py-2 rounded-[8px] text-white text-[14px] font-bold"
          style={{ background: ad.color }}
        >
          {ad.cta}
        </span>
      </div>
    </div>
  );
}
