"use client";

import { useEffect, useRef, ReactNode } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  destructive?: boolean; // If true, clicking scrim does NOT close
  maxWidth?: string;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  destructive = false,
  maxWidth = "max-w-[480px]",
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !destructive && onClose) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, destructive, onClose]);

  // Trap scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={destructive ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={clsx(
          "relative z-10 w-full bg-white rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] animate-slide-in",
          maxWidth,
          className
        )}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            {title && (
              <h2 id="modal-title" className="text-[20px] font-semibold text-[#18181B]">
                {title}
              </h2>
            )}
            {onClose && !destructive && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-1 rounded-[8px] text-[#71717A] hover:bg-[#F4F4F5] transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
