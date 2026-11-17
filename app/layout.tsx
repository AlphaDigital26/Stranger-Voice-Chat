import type { Metadata, Viewport } from "next";
import { Caveat, Manrope } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/lib/auth";
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
    default: "Stranger Voice Chat — Talk to Strangers Who Share Your Tag",
    template: "%s | Stranger Voice Chat",
  },
  description:
    "Pick a tag like Textile, SaaS or Real Estate and talk by voice with a stranger who picked the same tag. Anonymous, no signup, no camera, 18+.",
  keywords: ["stranger voice chat", "talk to strangers", "voice chat", "anonymous voice chat", "interest-based chat"],
  openGraph: {
    title: "Stranger Voice Chat — Talk to Strangers Who Share Your Tag",
    description: "Pick a tag and get matched by voice with someone who picked the same one. No signup, no camera.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stranger Voice Chat — Same Tag, Instant Voice Call",
    description: "Pick a tag, get matched with a stranger on the same tag, and talk. Free and anonymous.",
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
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}