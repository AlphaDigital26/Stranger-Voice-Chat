import { clsx } from "clsx";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

export type IntentTagSlug = "pitch_idea" | "give_feedback" | "open_discussion" | "founder_chat";

interface IntentCardProps {
  slug: IntentTagSlug;
  label: string;
  description: string;
  icon: string; // emoji icon
  isSelected: boolean;
  onSelect: (slug: IntentTagSlug) => void;
}

export default function IntentCard({
  slug,
  label,
  description,
  icon,
  isSelected,
  onSelect,
}: IntentCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      role="radio"
      aria-checked={isSelected}
      aria-label={`${label}: ${description}`}
      onClick={() => onSelect(slug)}
      className={clsx(
        "relative w-full text-left p-4 sm:p-5 rounded-[16px] border-2 transition-all duration-300 cursor-pointer group",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC] focus-visible:ring-offset-2",
        isSelected
          ? "border-[#7C5CFC] bg-[rgba(124,92,252,0.06)] shadow-glow z-10"
          : "border-[#E5E5E8] bg-white hover:border-[#7C5CFC]/40 hover:bg-[rgba(124,92,252,0.02)] shadow-sm"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <span
          className="text-2xl sm:text-3xl mt-0.5 shrink-0 select-none"
          aria-hidden="true"
        >
          {icon}
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p
            className={clsx(
              "text-[15px] sm:text-[16px] font-semibold leading-snug",
              isSelected ? "text-[#7C5CFC]" : "text-[#18181B]"
            )}
          >
            {label}
          </p>
          <p className="text-[13px] text-[#71717A] mt-0.5 leading-snug">{description}</p>
        </div>

        {/* Checkmark */}
        <div
          className={clsx(
            "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 mt-0.5",
            isSelected
              ? "border-[#7C5CFC] bg-[#7C5CFC]"
              : "border-[#E5E5E8] group-hover:border-[#7C5CFC]/50"
          )}
        >
          {isSelected && <Check size={12} strokeWidth={3} className="text-white" />}
        </div>
      </div>
    </motion.button>
  );
}

// Intent tag metadata
export const INTENT_TAGS: Array<{
  slug: IntentTagSlug;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    slug: "pitch_idea",
    label: "Pitch My Idea",
    description: "Share a concept or project and get honest outside feedback.",
    icon: "🚀",
  },
  {
    slug: "give_feedback",
    label: "Give Feedback",
    description: "Listen to someone's idea and share your genuine perspective.",
    icon: "💬",
  },
  {
    slug: "open_discussion",
    label: "Open Discussion",
    description: "Explore startup topics, trends, or ideas together — no agenda.",
    icon: "🧠",
  },
  {
    slug: "founder_chat",
    label: "Founder Chat",
    description: "Connect with another builder — share learnings, war stories, wins.",
    icon: "🤝",
  },
];
