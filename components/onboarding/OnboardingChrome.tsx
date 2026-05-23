"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { routeBySlug, TOTAL_STEPS } from "@/lib/onboarding-steps";

/**
 * Shared onboarding chrome, matching the Stitch design: sticky header
 * (logo · "Step X of 5" · Save & Exit), thin progress bars, and a footer.
 * Each step renders its own centered content as children.
 */
export function OnboardingChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean).pop() ?? "";
  const current = routeBySlug(slug)?.progressIndex ?? 1;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-neutral-border bg-neutral-surface px-6 py-3">
        <Link href="/" aria-label="conddo.io home" className="flex items-center">
          <Image
            src="/conddo_logo.png"
            alt="conddo.io"
            width={1800}
            height={480}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[14px] text-content-secondary">
            Step {current} of {TOTAL_STEPS}
          </span>
          <Link
            href="/"
            className="text-[14px] font-medium text-primary hover:underline"
          >
            Save &amp; Exit
          </Link>
        </div>
      </header>

      {/* Body */}
      <main className="flex grow flex-col items-center px-6 py-10 md:py-14">
        <div className="mx-auto flex w-full max-w-container flex-col items-center">
          {/* Progress bars */}
          <nav aria-label="Progress" className="mb-10 flex gap-2 md:mb-14">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => {
              const done = n < current;
              const active = n === current;
              return (
                <span
                  key={n}
                  className={`h-1.5 rounded-full transition-all ${
                    active
                      ? "w-12 bg-primary"
                      : done
                        ? "w-8 bg-primary/30"
                        : "w-8 bg-neutral-border"
                  }`}
                />
              );
            })}
          </nav>

          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-border bg-neutral-surface py-6 text-center">
        <p className="font-mono text-[12px] text-content-muted">
          © 2026 conddo.io • Simplified Business Management for Africa
        </p>
      </footer>
    </div>
  );
}
