"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/marketing/Wordmark";

/** Wraps every auth surface (login, signup, onboarding step, accept-invite,
 *  forgot/reset password) with the cinematic dark shell so the conversion
 *  funnel matches the marketing site.
 *
 *  Layout:
 *    - Floating wordmark top-left (back to marketing /)
 *    - Optional back link (e.g. for inner onboarding steps)
 *    - Centered glass card holding the page's form
 *    - Optional footer microcopy
 *
 *  Sets the html background to cinema-base on mount + restores on unmount
 *  (same pattern as MarketingShell) so iOS overscroll matches. */
export function CinematicAuthShell({
  back,
  footer,
  children,
}: {
  /** Optional back link rendered top-right of the shell — e.g. for
   *  onboarding sub-steps that should let the user return to a prior step. */
  back?: { label: string; href: string };
  /** Optional small text rendered under the form card. */
  footer?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.backgroundColor;
    html.style.backgroundColor = "#0a0a0c";
    return () => {
      html.style.backgroundColor = prev;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-cinema-base text-white overflow-hidden">
      {/* Ambient radial glow — the same family as the marketing hero,
          quieter. Sets the cinematic tone without competing with the form. */}
      <div className="absolute inset-0 bg-cinema-glow opacity-90 pointer-events-none" aria-hidden />
      <div className="marketing-hero-dark-grid absolute inset-0 opacity-30 pointer-events-none" aria-hidden />

      {/* Top bar — wordmark + optional back link. */}
      <div className="relative">
        <div className="container-x flex items-center justify-between pt-6 md:pt-8">
          <Link href="/" aria-label="conddo.io home" className="inline-flex items-center">
            <Wordmark tone="light" />
          </Link>
          {back && (
            <Link
              href={back.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 font-medium text-[12.5px] text-white/75 backdrop-blur transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft size={13} />
              {back.label}
            </Link>
          )}
        </div>
      </div>

      {/* Centered content column. Auth pages render a glass card here; this
          shell just holds the layout chrome. */}
      <div className="relative container-x flex min-h-[calc(100svh-80px)] items-center justify-center py-12 md:py-16">
        <div className="w-full max-w-md">
          {children}
          {footer && (
            <div className="mt-8 text-center text-[12.5px] text-white/45">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Glass card primitive used by every auth form. Caller renders its own
 *  heading + form inside. Consistent padding + border across surfaces so
 *  the funnel reads as one shell rather than seven look-alikes. */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="cinema-tile p-8 md:p-9">
      <h1 className="text-balance text-[28px] md:text-[32px] font-semibold tracking-tighter text-white leading-[1.1]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2.5 text-[14.5px] text-white/55 leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className="mt-7">{children}</div>
    </div>
  );
}

/** Field building blocks — auth pages compose these so every input has
 *  identical chrome + spacing. */
export const fieldLabelCls =
  "mb-1.5 block text-[11px] font-medium uppercase tracking-loose text-white/55";

export const fieldInputCls =
  "h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-[15px] text-white placeholder:text-white/35 transition-colors focus:border-primary-light focus:bg-white/[0.06] focus:outline-none";

export const fieldHelpCls = "mt-1.5 text-[12.5px] text-white/50";

export const fieldErrorCls = "mt-1.5 text-[12.5px] text-rose-300";
