import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Caveat, Manrope } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { clerkAppearance } from "@/components/layout/AuthShell";
import { THEME_INIT_SCRIPT } from "@/lib/themeConfig";
import Script from "next/script";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "700"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: {
    default: "PitchLine — Talk to a Stranger About Your Idea",
    template: "%s | PitchLine",
  },
  description:
    "Instantly connect by voice with strangers to pitch ideas, get feedback, and have real founder conversations. Anonymous, AI-moderated, 18+.",
  keywords: ["startup feedback", "idea validation", "founder chat", "voice chat", "pitch idea"],
  openGraph: {
    title: "PitchLine — Talk to a Stranger About Your Idea",
    description: "Anonymous voice conversations for idea discussion and founder feedback. No camera, instant match.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PitchLine — Voice Stranger App for Ideas",
    description: "Instantly pitch your idea to a stranger. Get real feedback in under 30 seconds.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0D0E12",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${caveat.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="font-sans bg-paper text-ink antialiased">
        {/* Dark is the default; apply a saved light theme before first paint.
            beforeInteractive scripts are injected into <head> by Next.js. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ClerkProvider appearance={clerkAppearance}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}