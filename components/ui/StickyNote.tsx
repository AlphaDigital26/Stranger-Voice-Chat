import { ReactNode } from "react";
import { clsx } from "clsx";

export type NoteColor = "yellow" | "pink" | "blue" | "green" | "orange";

interface StickyNoteProps {
  color?: NoteColor;
  /** Tilt in degrees; keep small (-4 to 4) so text stays readable */
  tilt?: number;
  /** Drop onto the board on page load (respects reduced motion) */
  drop?: boolean;
  /** Seconds to wait before dropping, for staggering several notes */
  delay?: number;
  className?: string;
  children: ReactNode;
}

const colors: Record<NoteColor, string> = {
  yellow: "bg-note-yellow",
  pink: "bg-note-pink",
  blue: "bg-note-blue",
  green: "bg-note-green",
  orange: "bg-note-orange",
};

// Signature element of the Whiteboard direction — idea cards, feedback, role tags
export default function StickyNote({ color = "yellow", tilt = 0, drop, delay = 0, className, children }: StickyNoteProps) {
  return (
    <div
      className={clsx("note-tilt p-5 shadow-note text-ink", colors[color], drop && "anim-note-drop", className)}
      style={{ "--tilt": `${tilt}deg`, "--delay": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
