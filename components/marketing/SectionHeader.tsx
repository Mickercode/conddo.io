import type { ReactNode } from "react";

/** The eyebrow + h2 + lede block that opens every marketing section. Keeps
 *  hierarchy identical across pages so the rhythm doesn't drift as more
 *  pages get added. Pass `tone="dark"` when the section sits on a dark
 *  surface; the inverted text colors keep contrast at AA. */
export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = "left",
  tone = "light",
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const isCenter = align === "center";
  return (
    <div
      className={`${isCenter ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} mb-10 md:mb-14`}
    >
      {eyebrow && (
        <span
          className={
            tone === "dark"
              ? "inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-primary-light before:inline-block before:h-1 before:w-1 before:rounded-full before:bg-primary-light"
              : "marketing-eyebrow"
          }
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={
          tone === "dark"
            ? "mt-4 text-balance text-[34px] font-medium leading-[1.1] tracking-[-0.02em] text-white md:text-[44px]"
            : "mt-4 marketing-h2"
        }
      >
        {title}
      </h2>
      {lede && (
        <p
          className={`mt-5 text-pretty text-[16px] leading-relaxed md:text-[17px] ${
            tone === "dark" ? "text-white/70" : "text-content-secondary"
          }`}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
