import { clsx } from "clsx";

interface AdSlotProps {
  className?: string;
  height?: number;
}

// AdSense-compliant ad slot component
// ONLY imported in eligible screen route files:
//   landing, /intent, /post-call, /history, /contacts (list), /settings, /blog
// NEVER imported in /call/:sessionId or /contacts/:id/messages
// Per AdSense "Ads in Private Communications" policy + UIUX Brief §12a
export default function AdSlot({ className, height = 90 }: AdSlotProps) {
  return (
    <div className={clsx("w-full", className)}>
      {/* "Sponsored" disclosure — per AdSense policy */}
      <p className="text-[11px] text-[#71717A] font-medium text-center mb-1 uppercase tracking-wide">
        Sponsored
      </p>
      {/* Ad container — fixed min-height prevents layout shift */}
      <div
        className="w-full rounded-[12px] bg-[#F4F4F5] border border-[#E5E5E8] flex items-center justify-center"
        style={{ minHeight: height }}
        aria-label="Advertisement"
        role="complementary"
      >
        {/* Placeholder — replace with real AdSense/Ezoic script tag in production */}
        <p className="text-[12px] text-[#71717A]">Advertisement</p>
      </div>
    </div>
  );
}
