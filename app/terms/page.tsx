import TopNav from "@/components/layout/TopNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — PitchLine",
  description: "Terms of Service and User Agreement for PitchLine.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <TopNav />
      <main className="flex-1 container-app max-w-[800px] py-12 px-4">
        <h1 className="text-[2rem] font-bold text-[#18181B] mb-6">Terms of Service</h1>
        <p className="text-[14px] text-[#71717A] mb-8">Last Updated: August 2026</p>

        <div className="space-y-8 text-[15px] text-[#18181B] leading-relaxed">
          <section>
            <h2 className="text-[1.25rem] font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using PitchLine ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-[1.25rem] font-semibold mb-3">2. Eligibility and Age Requirements</h2>
            <p>
              You must be at least 18 years old to use PitchLine. By using the Service, you represent and warrant that you are 18 or older. We reserve the right to suspend or terminate your account if we determine you have violated this requirement.
            </p>
          </section>

          <section>
            <h2 className="text-[1.25rem] font-semibold mb-3">3. User Conduct and Interactions</h2>
            <p className="mb-3">
              PitchLine connects you with strangers for anonymous voice conversations. You agree to use the Service respectfully and constructively. You must not:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Engage in harassment, hate speech, threats, or abusive behavior.</li>
              <li>Share explicit, illicit, or illegal content.</li>
              <li>Use the Service for spam, unauthorized advertising, or soliciting.</li>
              <li>Attempt to bypass our moderation systems or access other users' private information.</li>
            </ul>
            <p className="mt-3">
              We do not monitor live audio, but users can report violating behavior. We reserve the right to ban users at our sole discretion based on user reports.
            </p>
          </section>

          <section>
            <h2 className="text-[1.25rem] font-semibold mb-3">4. Disclaimer of Liability</h2>
            <p>
              PitchLine acts solely as a matching platform. We do not endorse, verify, or guarantee the accuracy of any feedback, advice, or statements made by other users. You interact with strangers at your own risk. PitchLine and its operators shall not be held liable for any damages, losses, or disputes arising from your interactions on the Service.
            </p>
          </section>

          <section>
            <h2 className="text-[1.25rem] font-semibold mb-3">5. Payments and Subscriptions</h2>
            <p>
              Certain features may be subject to a fee. All payments are processed securely via our third-party payment provider (Stripe). By subscribing to a paid tier, you agree to our recurring billing terms. Subscriptions can be canceled at any time, but prior charges are non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-[1.25rem] font-semibold mb-3">6. Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time, without notice or liability, for any reason, including violation of these Terms.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
