import Link from "next/link";
import Logo from "@/components/ui/Logo";

// Shared frame for the sign-in / sign-up screens (Direction F)
export default function AuthShell({ note, children }: { note: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dots flex flex-col items-center justify-center gap-6 px-4 py-12">
      <Link href="/" aria-label="PitchLine home">
        <Logo />
      </Link>
      <span className="font-hand text-[28px] text-marker -rotate-2">{note}</span>
      {children}
    </div>
  );
}

// Clerk widget styling that matches the design tokens in globals.css
export const clerkAppearance = {
  variables: {
    colorPrimary: "#7D94FF",
    colorTextOnPrimaryBackground: "#0D0E12",
    colorBackground: "#15171D",
    colorInputBackground: "#0D0E12",
    colorInputText: "#EDEEF2",
    colorText: "#EDEEF2",
    colorTextSecondary: "#A2A8B7",
    colorNeutral: "#EDEEF2",
    colorDanger: "#FF7A66",
    colorSuccess: "#3DD68C",
    fontFamily: "var(--font-manrope), system-ui, sans-serif",
    borderRadius: "12px",
  },
  elements: {
    card: { border: "2px solid #474C5C", boxShadow: "0 24px 60px -12px rgba(0,0,0,0.75)" },
  },
};
