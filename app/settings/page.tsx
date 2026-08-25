"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Download, Trash2, ChevronRight, Globe, MessageSquare, Lock } from "lucide-react";
import TopNav from "@/components/layout/TopNav";
import AdSlot from "@/components/ui/AdSlot";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/lib/mockAuth";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleLogOut = () => {
    signOut();
    router.push("/");
  };

  const handleExport = async () => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 1500));
    setExporting(false);
    toast("We'll email you a link to download your data shortly.", "info");
  };

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise(r => setTimeout(r, 1500));
    setDeleting(false);
    setDeleteOpen(false);
    signOut();
    router.push("/");
    toast("Your account has been deleted.", "info");
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <h2 className="text-[12px] font-semibold text-[#71717A] uppercase tracking-wider mb-2 px-1">{title}</h2>
      <div className="bg-white border border-[#E5E5E8] rounded-[12px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        {children}
      </div>
    </div>
  );

  const Row = ({
    icon: Icon,
    label,
    sublabel,
    action,
    destructive = false,
  }: {
    icon: React.ElementType;
    label: string;
    sublabel?: string;
    action: React.ReactNode;
    destructive?: boolean;
  }) => (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b last:border-b-0 border-[#F4F4F5]">
      <Icon size={18} className={destructive ? "text-[#EF4444]" : "text-[#71717A]"} aria-hidden="true" />
      <div className="flex-1">
        <p className={`text-[14px] font-medium ${destructive ? "text-[#EF4444]" : "text-[#18181B]"}`}>{label}</p>
        {sublabel && <p className="text-[12px] text-[#71717A]">{sublabel}</p>}
      </div>
      {action}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <TopNav />

      <main className="flex-1 container-app max-w-[520px] py-8 px-4">
        <h1 className="text-[1.75rem] font-bold text-[#18181B] mb-6">Settings</h1>

        {/* Account section */}
        <Section title="Account">
          <Row
            icon={MessageSquare}
            label="Email"
            sublabel={user?.email ?? "—"}
            action={<span className="text-[12px] text-[#71717A]">Read-only</span>}
          />
          <Row
            icon={Lock}
            label="Change Password"
            sublabel="Update your account password"
            action={
              <button className="flex items-center text-[#7C5CFC] hover:text-[#6547E0] transition-colors">
                <ChevronRight size={18} />
              </button>
            }
          />
          <Row
            icon={LogOut}
            label="Log Out"
            action={
              <Button variant="secondary" size="sm" onClick={handleLogOut} id="settings-logout">
                Log Out
              </Button>
            }
          />
        </Section>

        {/* Preferences section */}
        <Section title="Preferences">
          <Row
            icon={Globe}
            label="Default Language"
            sublabel="Pre-selected on the intent screen"
            action={
              <select
                className="text-[13px] text-[#18181B] border border-[#E5E5E8] rounded-[8px] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/40"
                defaultValue="English"
                aria-label="Default language preference"
              >
                {["Any", "English", "Hindi", "Spanish", "French", "German"].map(l => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            }
          />
          <Row
            icon={Globe}
            label="Default Country"
            sublabel="Pre-selected on the intent screen"
            action={
              <select
                className="text-[13px] text-[#18181B] border border-[#E5E5E8] rounded-[8px] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/40"
                defaultValue="Worldwide"
                aria-label="Default country preference"
              >
                {["Worldwide", "United States", "India", "United Kingdom", "Canada"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            }
          />
        </Section>

        {/* Privacy section */}
        <Section title="Privacy & Data">
          <Row
            icon={Download}
            label="Download My Data"
            sublabel="GDPR / CCPA — you'll receive an email link"
            action={
              <Button variant="secondary" size="sm" onClick={handleExport} loading={exporting} id="settings-export">
                {exporting ? "Sending..." : "Request"}
              </Button>
            }
          />
          <Row
            icon={Trash2}
            label="Delete My Account"
            sublabel="Permanently removes all your data"
            destructive
            action={
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} id="settings-delete">
                Delete
              </Button>
            }
          />
        </Section>

        <div className="mt-4 px-1">
          <p className="text-[12px] text-[#71717A] leading-relaxed">
            PitchLine is an 18+ platform. By continuing to use this service you confirm you meet the age requirement.{" "}
            <a href="/terms" className="text-[#7C5CFC] hover:underline">Terms of Service</a>{" · "}
            <a href="/privacy" className="text-[#7C5CFC] hover:underline">Privacy Policy</a>
          </p>
        </div>

        <div className="mt-6">
          <AdSlot height={90} />
        </div>
      </main>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
        destructive
      >
        <p className="text-[14px] text-[#71717A] mb-5 leading-relaxed">
          This will permanently delete your account and all associated data. <strong className="text-[#18181B]">This cannot be undone.</strong>
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleDelete} loading={deleting} id="confirm-delete-btn">
            Delete Permanently
          </Button>
        </div>
      </Modal>
    </div>
  );
}
