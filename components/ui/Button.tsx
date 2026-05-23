"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "secondary-dark" | "on-violet";
type Size = "lg" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none";

const sizes: Record<Size, string> = {
  lg: "h-14 px-7 text-[15px]",
  md: "h-11 px-5 text-[15px]",
};

const variants: Record<Variant, string> = {
  // Violet fill, white text. No shadow — depth comes from colour.
  primary: "bg-primary text-white hover:bg-primary-hover",
  // White surface, hard ink hairline, dark text.
  secondary: "bg-neutral-surface text-ink border border-ink hover:bg-neutral-surface2",
  // Text-only violet, for low-priority actions (e.g. Back).
  ghost: "text-content-secondary hover:text-ink",
  // For dark sections: translucent white outline that fills on hover.
  "secondary-dark":
    "bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white/60",
  // For violet surfaces: solid white, violet label.
  "on-violet": "bg-white text-primary hover:bg-white/90",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

/**
 * Renders a Next.js Link when `href` is provided, otherwise a native button.
 * Lets onboarding use the same component for both navigation and form actions.
 */
export function Button(
  props: CommonProps &
    ({ href: string } | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)),
) {
  const { children, variant = "primary", size = "lg", className = "" } = props;
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }

  const { href: _href, variant: _v, size: _s, className: _c, children: _ch, ...buttonProps } =
    props as CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
  return (
    <button className={cls} {...buttonProps}>
      {children}
    </button>
  );
}
