"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Globe, Moon, Sun, UserRound } from "lucide-react";
import { clsx } from "clsx";
import { useTheme, setTheme, type Theme } from "@/lib/theme";
import TopNav from "@/components/layout/TopNav";
import AdSlot from "@/components/ui/AdSlot";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth";
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
  const { user, resetIdentity } = useAuth();
  const { toast } = useToast();
  const theme = useTheme();

  const [forgetOpen, setForgetOpen] = useState(false);
  const [forgetting, setForgetting] = useState(false);

  // No accounts: "forgetting" drops this device's hidden ID; the next call starts fresh
  const handleForget = async () => {
    setForgetting(true);
    await resetIdentity();
    setForgetting(false);
    setForgetOpen(false);
    router.push("/");
    router.refresh();
    toast("This device has been forgotten. Your next call starts fresh.", "info");
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

        {/* Identity — no accounts, just this device */}
        <Section title="you">
          <Row
            icon={UserRound}
            label="You're anonymous"
            sublabel="No signup, no email. Friends and call history are kept on this device only."
            action={<span className="text-[13px] text-muted whitespace-nowrap">{user ? "Active" : "Not started"}</span>}
          />
          {user && (
            <Row
              icon={Trash2}
              label="Forget this device"
              sublabel="Start fresh with a new anonymous ID"
              destructive
              action={
                <Button variant="destructive" size="sm" onClick={() => setForgetOpen(true)} id="settings-forget">
                  Forget
                </Button>
              }
            />
          )}
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

        <div className="px-1">
          <p className="text-[13px] text-muted leading-relaxed">
            Stranger Voice Chat is an 18+ platform. By continuing to use this service you confirm you meet the age requirement.{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>{" · "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>

        <div className="mt-6">
          <AdSlot height={90} variant={5} />
        </div>
      </main>

      {/* Forget-device confirmation */}
      <Modal
        isOpen={forgetOpen}
        onClose={() => setForgetOpen(false)}
        title="Forget this device?"
        destructive
      >
        <p className="text-[15px] text-muted mb-5 leading-relaxed">
          You&apos;ll get a new anonymous ID. Friends and call history on this device will be gone.{" "}
          <strong className="text-ink">You can&apos;t undo this.</strong>
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setForgetOpen(false)} disabled={forgetting}>
            Cancel
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleForget} loading={forgetting} id="confirm-forget-btn">
            Forget device
          </Button>
        </div>
      </Modal>
    </div>
  );
}
