import TopNav from "@/components/layout/TopNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Stranger Voice Chat",
  description: "Privacy Policy detailing data collection, retention, and usage for Stranger Voice Chat.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dots flex flex-col">
      <TopNav />
      <main className="flex-1 container-app max-w-[800px] py-10">
        <article className="bg-surface border-2 border-outline rounded-[16px] px-5 py-8 sm:px-12 sm:py-12">
        <span className="font-hand text-[26px] text-marker">the fine print</span>
        <h1 className="mt-1 text-[2.25rem] font-extrabold tracking-tight leading-tight mb-2">Privacy Policy</h1>
        <p className="text-[14px] text-muted mb-8 pb-8 border-b-2 border-dashed border-line">Last updated: August 2026</p>

        <div className="space-y-8 text-[16px] text-ink leading-[1.7] max-w-[65ch]">
          <section>
            <h2 className="text-[1.25rem] font-extrabold tracking-tight mb-3">1. Information We Collect</h2>
            <p>
              Stranger Voice Chat has no accounts: we never ask for your name, email or phone number. When you start your first call, we create an anonymous ID for your device. We store that ID with your 18+ confirmation, the tag you pick, any country or language preference, and call times, so we can match you and keep the service safe. We also collect connection metadata and IP addresses for security and abuse prevention.
            </p>
          </section>

          <section>
            <h2 className="text-[1.25rem] font-extrabold tracking-tight mb-3">2. Audio Privacy (No Recording)</h2>
            <p>
              <strong>Stranger Voice Chat does NOT record, capture, or store the audio of your live conversations.</strong> Audio streams are transmitted directly between peers or via our ephemeral signaling servers and are immediately discarded. We have no ability to retrieve audio from past sessions.
            </p>
          </section>

          <section>
            <h2 className="text-[1.25rem] font-extrabold tracking-tight mb-3">3. Data Retention Policy</h2>
            <p>
              To maintain a safe community, we retain certain non-audio metadata (such as IP addresses, connection timestamps, and in-call text chat logs) strictly for Trust & Safety and moderation purposes. 
              <strong>This data is retained for exactly 30 days</strong> from the date of creation, after which it is automatically permanently deleted, unless it is required to comply with a valid legal request or ongoing moderation dispute.
            </p>
          </section>

          <section>
            <h2 className="text-[1.25rem] font-extrabold tracking-tight mb-3">4. Third-Party Services</h2>
            <p className="mb-3">We use trusted third-party service providers to operate the Service:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Matching and data:</strong> We use Supabase to create your anonymous device ID and to match you with someone on the same tag.</li>
              <li><strong>Voice:</strong> We use LiveKit to carry the live audio between the two people on a call. Audio is not recorded.</li>
              <li><strong>Advertising:</strong> We use Google AdSense to serve ads on select pages (ads are never shown during live calls). AdSense may use cookies to personalize ads based on your browsing behavior.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[1.25rem] font-extrabold tracking-tight mb-3">5. Your Rights</h2>
            <p>
              You can remove the link between your device and its anonymous ID at any time with Settings → Forget this device. Data tied to that ID is permanently deleted after our 30-day retention window. Because we don&apos;t know who you are, we can only act on requests made from the device itself.
            </p>
          </section>
        </div>
        </article>
      </main>
    </div>
  );
}
