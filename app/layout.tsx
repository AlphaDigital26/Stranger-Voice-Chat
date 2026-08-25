import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

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
  themeColor: "#7C5CFC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="font-sans bg-bg text-text-primary antialiased">
        <ClerkProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}