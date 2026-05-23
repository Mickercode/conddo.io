import type { ReactNode } from "react";

type ChipTone = "success" | "warning" | "danger" | "info" | "primary" | "neutral";

const tones: Record<ChipTone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  primary: "bg-primary-bg text-primary",
  neutral: "bg-neutral-surface2 text-content-secondary",
};

/** Status pill — Geist Mono, uppercase, 11px, semantic colour fill. */
export function Chip({
  tone = "neutral",
  children,
}: {
  tone?: ChipTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.05em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
