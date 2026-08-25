"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
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
        <div className="flex items-center gap-3 p-3 bg-[#FEF2F2] rounded-[10px]">
          <AlertTriangle size={18} className="text-[#EF4444] shrink-0" />
          <p className="text-[13px] text-[#71717A] leading-snug">
            Submitting this report will end the call immediately. Our team will review it shortly.
          </p>
        </div>

        {/* Reason selector */}
        <fieldset>
          <legend className="text-[14px] font-medium text-[#18181B] mb-3">
            Select a reason
          </legend>
          <div className="flex flex-col gap-2">
            {REASONS.map(({ code, label }) => (
              <label
                key={code}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer border transition-all duration-100 hover:border-[#7C5CFC]/40"
                style={{
                  borderColor: selectedReason === code ? "#7C5CFC" : "#E5E5E8",
                  background: selectedReason === code ? "rgba(124,92,252,0.05)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={code}
                  checked={selectedReason === code}
                  onChange={() => setSelectedReason(code)}
                  className="accent-[#7C5CFC]"
                  aria-label={label}
                />
                <span className="text-[14px] text-[#18181B]">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Optional note for "Other" */}
        {selectedReason === "other" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#18181B]">
              Additional details <span className="text-[#71717A] font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 280))}
              placeholder="Describe what happened..."
              rows={3}
              className="w-full px-3 py-2 text-[14px] text-[#18181B] bg-white border border-[#E5E5E8] rounded-[8px] resize-none focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/40 placeholder:text-[#71717A]"
            />
            <p className="text-[11px] text-[#71717A] text-right">{note.length}/280</p>
          </div>
        )}

        {/* Error */}
        {submitError && (
          <p className="text-[13px] text-[#EF4444]" role="alert">{submitError}</p>
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
            Submit Report & End Call
          </Button>
        </div>
      </div>
    </Modal>
  );
}
