import { clsx } from "clsx";
import { Check } from "lucide-react";

export type IntentTagSlug = "pitch_idea" | "give_feedback" | "open_discussion" | "founder_chat";

interface IntentCardProps {
  slug: IntentTagSlug;
  label: string;
  description: string;
  note: string; // sticky-note background class
  isSelected: boolean;
  onSelect: (slug: IntentTagSlug) => void;
}

// Sticky-note radio card (Direction F). Selected = ink outline + marker check.
export default function IntentCard({
  slug,
  label,
  description,
  note,
  isSelected,
  onSelect,
}: IntentCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={`${label}: ${description}`}
      onClick={() => onSelect(slug)}
      className={clsx(
        "relative w-full h-full text-left p-5 border-2 transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        note,
        isSelected
          ? "border-ink shadow-note -rotate-1"
          : "border-transparent hover:border-ink/40 hover:-rotate-1"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-hand font-bold text-[28px] leading-none">{label}</p>
          <p className="mt-2 text-[14px] text-ink/75 leading-snug">{description}</p>
        </div>

        {/* Marker check */}
        <span
          className={clsx(
            "shrink-0 w-6 h-6 rounded-full border-2 border-ink flex items-center justify-center transition-colors",
            isSelected ? "bg-ink" : "bg-surface/70"
          )}
          aria-hidden="true"
        >
          {isSelected && <Check size={14} strokeWidth={3} className="text-white" />}
        </span>
      </div>
    </button>
  );
}

// Intent tag metadata
export const INTENT_TAGS: Array<{
  slug: IntentTagSlug;
  label: string;
  description: string;
  note: string;
}> = [
  {
    slug: "pitch_idea",
    label: "Pitch my idea",
    description: "Share a concept or project and get honest outside feedback.",
    note: "bg-note-yellow",
  },
  {
    slug: "give_feedback",
    label: "Give feedback",
    description: "Listen to someone's idea and share your genuine perspective.",
    note: "bg-note-pink",
  },
  {
    slug: "open_discussion",
    label: "Open discussion",
    description: "Explore startup topics, trends, or ideas together. No agenda.",
    note: "bg-note-blue",
  },
  {
    slug: "founder_chat",
    label: "Founder chat",
    description: "Connect with another builder and swap learnings, war stories, wins.",
    note: "bg-note-green",
  },
];
