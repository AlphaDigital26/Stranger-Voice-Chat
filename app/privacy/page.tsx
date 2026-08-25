import TopNav from "@/components/layout/TopNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — PitchLine",
  description: "Privacy Policy detailing data collection, retention, and usage for PitchLine.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <TopNav />
      <main className="flex-1 container-app max-w-[800px] py-12 px-4">
        <h1 className="text-[2rem] font-bold text-[#18181B] mb-6">Privacy Policy</h1>
        <p className="text-[14px] text-[#71717A] mb-8">Last Updated: August 2026</p>

        <div className="space-y-8 text-[15px] text-[#18181B] leading-relaxed">
          <section>
            <h2 className="text-[1.25rem] font-semibold mb-3">1. Information We Collect</h2>
            <p>
              When you use PitchLine, we collect information you provide directly, such as your email address when signing up, and your payment information if you subscribe to a paid tier. We also collect usage data, connection metadata, and IP addresses for security and matching purposes.
            </p>
          </section>

          <section>
            <h2 className="text-[1.25rem] font-semibold mb-3">2. Audio Privacy (No Recording)</h2>
            <p>
              <strong>PitchLine does NOT record, capture, or store the audio of your live conversations.</strong> Audio streams are transmitted directly between peers or via our ephemeral signaling servers and are immediately discarded. We have no ability to retrieve audio from past sessions.
            </p>
          </section>

          <section>
            <h2 className="text-[1.25rem] font-semibold mb-3">3. Data Retention Policy</h2>
            <p>
              To maintain a safe community, we retain certain non-audio metadata (such as IP addresses, connection timestamps, and in-call text chat logs) strictly for Trust & Safety and moderation purposes. 
              <strong>This data is retained for exactly 30 days</strong> from the date of creation, after which it is automatically permanently deleted, unless it is required to comply with a valid legal request or ongoing moderation dispute.
            </p>
          </section>

          <section>
            <h2 className="text-[1.25rem] font-semibold mb-3">4. Third-Party Services</h2>
            <p className="mb-3">We use trusted third-party service providers to operate the Service:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Authentication:</strong> We use Clerk to securely manage your account and login credentials.</li>
              <li><strong>Payments:</strong> We use Stripe to process payments. We do not store your full credit card details.</li>
              <li><strong>Advertising:</strong> We use Google AdSense to serve ads on select pages (ads are never shown during live calls). AdSense may use cookies to personalize ads based on your browsing behavior.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[1.25rem] font-semibold mb-3">5. Your Rights</h2>
            <p>
              You have the right to access, export, or delete your personal data. You can request account deletion from your settings dashboard. Upon deletion, your identifying information will be soft-deleted and permanently purged after our 30-day retention window expires.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
