"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

type ReasonCode = "harassment" | "hate_speech" | "sexual_content" | "spam_self_promo" | "other";

const REASONS: { code: ReasonCode; label: string }[] = [
  { code: "harassment", label: "Harassment" },
  { code: "hate_speech", label: "Hate speech" },
  { code: "sexual_content", label: "Sexual content" },
  { code: "spam_self_promo", label: "Spam / self-promotion" },
  { code: "other", label: "Other" },
];

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: ReasonCode, note?: string) => void;
  isSubmitting?: boolean;
  submitError?: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  submitError,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReasonCode | null>(null);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit(selectedReason, selectedReason === "other" ? note : undefined);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report this conversation"
      destructive={false}
    >
      <div className="flex flex-col gap-5">
        {/* Icon */}
        <div className="flex items-center gap-3 p-3 bg-danger-soft border-2 border-danger rounded-[12px]">
          <AlertTriangle size={18} className="text-danger shrink-0" />
          <p className="text-[14px] text-ink leading-snug">
            Reporting ends the call right away and blocks this person for you. Our team reviews every report.
          </p>
        </div>

        {/* Reason selector */}
        <fieldset>
          <legend className="text-[15px] font-bold text-ink mb-3">
            What happened?
          </legend>
          <div className="flex flex-col gap-2">
            {REASONS.map(({ code, label }) => (
              <label
                key={code}
                className={clsx(
                  "flex items-center gap-3 px-3 py-3 rounded-[12px] cursor-pointer border-2 transition-colors duration-100",
                  selectedReason === code ? "border-outline bg-note-pink" : "border-line hover:border-outline/50"
                )}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={code}
                  checked={selectedReason === code}
                  onChange={() => setSelectedReason(code)}
                  className="accent-primary"
                  aria-label={label}
                />
                <span className="text-[15px] font-medium text-ink">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Optional note for "Other" */}
        {selectedReason === "other" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="report-note" className="text-[14px] font-bold text-ink">
              More details <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="report-note"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 280))}
              placeholder="Describe what happened…"
              rows={3}
              className="w-full px-3 py-2.5 text-[15px] text-ink bg-surface border-2 border-line rounded-[12px] resize-none focus:outline-none focus:border-primary placeholder:text-muted"
            />
            <p className="text-[11px] text-muted text-right">{note.length}/280</p>
          </div>
        )}

        {/* Error */}
        {submitError && (
          <p className="text-[13px] text-danger" role="alert">{submitError}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            loading={isSubmitting}
          >
            Report &amp; end call
          </Button>
        </div>
      </div>
    </Modal>
  );
}
