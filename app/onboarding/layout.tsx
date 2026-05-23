import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Stepper } from "@/components/onboarding/Stepper";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Top bar */}
      <header className="border-b border-neutral-border bg-neutral-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
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
          <Link
            href="/"
            className="text-[14px] text-content-secondary transition-colors hover:text-ink"
          >
            Save &amp; exit
          </Link>
        </div>
      </header>

      {/* Stepper */}
      <div className="border-b border-neutral-border bg-neutral-surface">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <Stepper />
        </div>
      </div>

      {/* Step content — white card on the off-white page */}
      <main className="mx-auto max-w-3xl px-6 py-10 md:py-14">
        <div className="rounded-xl border border-neutral-border bg-neutral-surface p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
