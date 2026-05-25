"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Centered dialog used for write-actions (create customer, new order, etc.).
 * Closes on backdrop click or Escape. Depth comes from a hairline border on a
 * solid surface over a dimmed backdrop — no shadows (brand rule).
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-md";

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[92vh] w-full ${maxW} flex-col rounded-t-2xl border border-neutral-border bg-neutral-surface sm:rounded-2xl`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-neutral-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[17px] font-medium tracking-[-0.01em] text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-[13px] text-content-secondary">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 -mt-1 shrink-0 rounded-md p-1.5 text-content-muted hover:bg-neutral-surface2 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-neutral-border px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
