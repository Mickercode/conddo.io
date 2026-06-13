import type { ReactNode, ElementType } from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

/** A 6-column responsive grid that bento cells span using col/row spans.
 *  Each child decides its own span via the `span` prop on BentoCard. The
 *  grid collapses to 1 column on mobile so every cell still feels intentional
 *  on a small viewport. */
export function BentoGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-5 md:auto-rows-[200px]">
      {children}
    </div>
  );
}

/** One bento cell. The `span` prop picks the column footprint at the md+
 *  breakpoint. Mobile is always full width by design — small screens shouldn't
 *  inherit desktop's grid logic, they should read top-to-bottom. */
type Span = "sm" | "md" | "lg" | "xl" | "full";

const COL_SPAN: Record<Span, string> = {
  sm:   "md:col-span-2",
  md:   "md:col-span-3",
  lg:   "md:col-span-4",
  xl:   "md:col-span-5",
  full: "md:col-span-6",
};

type Height = "auto" | "tall" | "xtall";

const ROW_SPAN: Record<Height, string> = {
  auto:  "",                   // single-row default
  tall:  "md:row-span-2",       // ~ 2x the standard auto-row height
  xtall: "md:row-span-3",
};

export function BentoCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  href,
  tone = "light",
  span = "md",
  height = "auto",
  children,
  className = "",
}: {
  icon?: LucideIcon | ElementType;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** When set, the whole card becomes a link. The hover lift still applies. */
  href?: string;
  tone?: "light" | "dark";
  span?: Span;
  height?: Height;
  /** Optional visual / mockup slot rendered below the copy. Falls into the
   *  card's natural padding so callers don't have to worry about offsets. */
  children?: ReactNode;
  className?: string;
}) {
  const base = tone === "dark" ? "bento-card-dark" : "bento-card";
  const eyebrowCls =
    tone === "dark"
      ? "text-[10px] font-medium uppercase tracking-[0.14em] text-primary-light"
      : "text-[10px] font-medium uppercase tracking-[0.14em] text-primary";
  const titleCls =
    tone === "dark"
      ? "text-[18px] font-medium leading-snug text-white md:text-[20px]"
      : "text-[18px] font-medium leading-snug text-ink md:text-[20px]";
  const bodyCls =
    tone === "dark" ? "text-[13.5px] leading-relaxed text-white/65" : "text-[13.5px] leading-relaxed text-content-secondary";

  const inner = (
    <>
      <div className="flex h-full flex-col gap-3 p-6 md:p-7">
        {Icon && (
          <span
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
              tone === "dark" ? "bg-white/10 text-primary-light" : "bg-primary-bg text-primary"
            }`}
          >
            <Icon size={17} strokeWidth={1.75} />
          </span>
        )}
        {eyebrow && <span className={eyebrowCls}>{eyebrow}</span>}
        <h3 className={titleCls}>{title}</h3>
        {description && <p className={bodyCls}>{description}</p>}
        {children && <div className="mt-auto pt-3">{children}</div>}
        {href && (
          <span
            className={`mt-auto inline-flex items-center gap-1.5 text-[13px] font-medium ${
              tone === "dark" ? "text-primary-light" : "text-primary"
            }`}
          >
            Learn more <ArrowRight size={13} />
          </span>
        )}
      </div>
    </>
  );

  const classes = `${base} ${COL_SPAN[span]} ${ROW_SPAN[height]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }
  return <div className={classes}>{inner}</div>;
}
