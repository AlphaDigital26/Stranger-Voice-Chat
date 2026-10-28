"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Download, Trash2, ChevronRight, Globe, MessageSquare, Lock, Moon, Sun } from "lucide-react";
import { clsx } from "clsx";
import { useTheme, setTheme, type Theme } from "@/lib/theme";
import TopNav from "@/components/layout/TopNav";
import AdSlot from "@/components/ui/AdSlot";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/lib/mockAuth";
import { useToast } from "@/components/ui/Toast";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="font-hand font-bold text-[26px] text-marker leading-none mb-2 px-1">{title}</h2>
    <div className="bg-surface border-2 border-outline rounded-[16px] overflow-hidden">
      {children}
    </div>
  </section>
);

/** Dark / Light segmented switch */
function ThemeSwitch() {
  const theme = useTheme();
  const options: Array<{ value: Theme; label: string; Icon: React.ElementType }> = [
    { value: "dark", label: "Dark", Icon: Moon },
    { value: "light", label: "Light", Icon: Sun },
  ];
  return (
    <div role="radiogroup" aria-label="Theme" className="inline-flex shrink-0 p-1 gap-1 rounded-[12px] border-2 border-line bg-paper">
      {options.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className={clsx(
              "inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-[8px] text-[14px] font-bold transition-colors",
              active ? "bg-primary text-on-primary" : "text-muted hover:text-ink hover:bg-paper-2"
            )}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

const selectClass =
  "text-[14px] text-ink bg-surface border-2 border-line rounded-[10px] px-2.5 py-1.5 focus:outline-none focus:border-primary";

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
  <div className="flex items-center gap-3 px-4 py-4 border-b-2 border-dashed last:border-b-0 border-line">
    <Icon size={20} className={destructive ? "text-danger" : "text-ink"} aria-hidden="true" />
    <div className="flex-1 min-w-0">
      <p className={`text-[15px] font-bold ${destructive ? "text-danger" : "text-ink"}`}>{label}</p>
      {sublabel && <p className="text-[13px] text-muted break-words">{sublabel}</p>}
    </div>
    {action}
  </div>
);

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const theme = useTheme();

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

  return (
    <div className="min-h-screen bg-dots flex flex-col">
      <TopNav />

      <main className="flex-1 container-app max-w-[600px] py-10">
        <h1 className="text-[2.25rem] font-extrabold tracking-tight leading-tight mb-8">Settings</h1>

        {/* Appearance section — dark by default, light is opt-in */}
        <Section title="appearance">
          <Row
            icon={theme === "dark" ? Moon : Sun}
            label="Theme"
            sublabel="Saved on this device"
            action={<ThemeSwitch />}
          />
        </Section>

        {/* Account section */}
        <Section title="account">
          <Row
            icon={MessageSquare}
            label="Email"
            sublabel={user?.email ?? "—"}
            action={<span className="text-[13px] text-muted">Read-only</span>}
          />
          <Row
            icon={Lock}
            label="Change password"
            sublabel="Update your account password"
            action={
              <button aria-label="Change password" className="w-10 h-10 flex items-center justify-center rounded-[10px] hover:bg-paper-2 transition-colors">
                <ChevronRight size={20} />
              </button>
            }
          />
          <Row
            icon={LogOut}
            label="Log out"
            action={
              <Button variant="secondary" size="sm" onClick={handleLogOut} id="settings-logout">
                Log out
              </Button>
            }
          />
        </Section>

        {/* Preferences section */}
        <Section title="preferences">
          <Row
            icon={Globe}
            label="Default language"
            sublabel="Pre-selected when you start a call"
            action={
              <select
                className={selectClass}
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
            label="Default country"
            sublabel="Pre-selected when you start a call"
            action={
              <select
                className={selectClass}
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
        <Section title="privacy & data">
          <Row
            icon={Download}
            label="Download my data"
            sublabel="We'll email you a download link"
            action={
              <Button variant="secondary" size="sm" onClick={handleExport} loading={exporting} id="settings-export">
                {exporting ? "Sending…" : "Request"}
              </Button>
            }
          />
          <Row
            icon={Trash2}
            label="Delete my account"
            sublabel="Permanently removes all your data"
            destructive
            action={
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} id="settings-delete">
                Delete
              </Button>
            }
          />
        </Section>

        <div className="px-1">
          <p className="text-[13px] text-muted leading-relaxed">
            PitchLine is an 18+ platform. By continuing to use this service you confirm you meet the age requirement.{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>{" · "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>

        <div className="mt-6">
          <AdSlot height={90} variant={5} />
        </div>
      </main>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
        destructive
      >
        <p className="text-[15px] text-muted mb-5 leading-relaxed">
          This permanently deletes your account, contacts, messages and call history. <strong className="text-ink">You can&apos;t undo this.</strong>
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleDelete} loading={deleting} id="confirm-delete-btn">
            Delete permanently
          </Button>
        </div>
      </Modal>
    </div>
  );
}
