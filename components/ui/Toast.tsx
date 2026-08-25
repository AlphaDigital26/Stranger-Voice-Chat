"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { clsx } from "clsx";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = { success: CheckCircle, error: AlertCircle, info: Info };
  const colors = {
    success: "text-[#22C55E]",
    error: "text-[#EF4444]",
    info: "text-[#7C5CFC]",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container — top-right desktop, top-center mobile */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[360px] w-full pointer-events-none sm:right-4 max-sm:right-1/2 max-sm:translate-x-1/2"
      >
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              role="alert"
              className={clsx(
                "flex items-start gap-3 pointer-events-auto",
                "bg-[#18181B] text-white px-4 py-3 rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.3)]",
                "animate-slide-in"
              )}
            >
              <Icon size={18} className={clsx("mt-0.5 shrink-0", colors[t.type])} aria-hidden="true" />
              <p className="text-[14px] flex-1 leading-snug">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 text-white/60 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
