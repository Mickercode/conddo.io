"use client";

import {
  Check,
  LayoutGrid,
  Globe,
  ChevronRight,
  Copy,
  UserPlus,
  ShoppingBag,
  Instagram,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useOnboarding } from "@/lib/onboarding-store";

const tasks: { label: string; icon: LucideIcon }[] = [
  { label: "Add your first customer", icon: UserPlus },
  { label: "Create your first order", icon: ShoppingBag },
  { label: "Connect Instagram", icon: Instagram },
];

// Built from the Stitch "Onboarding Completion" screen (step 5 of 5).
export default function ReadyStep() {
  const { fullName, businessName } = useOnboarding();
  const firstName = fullName.trim().split(/\s+/)[0];
  const greeting = firstName ? `You're all set, ${firstName}.` : "You're all set!";
  const business = businessName.trim() || "Your business";
  const slug = businessName.trim()
    ? businessName.trim().toLowerCase().replace(/\s+/g, "-")
    : "your-business";

  return (
    <div className="w-full max-w-2xl">
      {/* Success header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary">
          <Check size={30} className="text-primary" strokeWidth={2.5} />
        </span>
        <h1 className="text-[28px] leading-tight tracking-[-0.02em] md:text-[34px]">
          {greeting}
        </h1>
        <p className="mt-2 text-[16px] text-content-secondary">
          {business} is now on conddo.io.
        </p>
      </div>

      {/* Status cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-bg text-primary">
              <LayoutGrid size={20} />
            </span>
            <Chip tone="success">Live</Chip>
          </div>
          <h3 className="text-[15px] font-medium text-ink">Your dashboard is ready</h3>
          <p className="mt-1 text-[14px] leading-relaxed text-content-secondary">
            Start adding customers, orders, and inventory right now.
          </p>
        </div>
        <div className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-bg text-primary">
              <Globe size={20} />
            </span>
            <Chip tone="warning">In progress</Chip>
          </div>
          <h3 className="text-[15px] font-medium text-ink">Your website is being built</h3>
          <p className="mt-1 text-[14px] leading-relaxed text-content-secondary">
            Our team is working on your website. You&apos;ll get a notification when it&apos;s ready.
          </p>
        </div>
      </div>

      {/* Head-start checklist */}
      <div className="mb-8 rounded-xl border border-neutral-border bg-neutral-surface p-5">
        <p className="mb-3 text-[14px] font-medium text-ink">While you wait, get a head start:</p>
        <ul className="divide-y divide-neutral-border">
          {tasks.map(({ label, icon: Icon }) => (
            <li key={label}>
              <a
                href="#"
                className="flex items-center justify-between py-3 transition-colors hover:text-primary"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-surface2 text-content-secondary">
                    <Icon size={16} />
                  </span>
                  <span className="text-[14px] text-ink">{label}</span>
                </span>
                <ChevronRight size={18} className="text-content-muted" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-5">
        <Button href="/dashboard" variant="primary" size="lg" className="w-full max-w-sm">
          Go to my dashboard
        </Button>
        <div className="text-center">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-content-muted">
            Share your conddo.io link
          </p>
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-border bg-neutral-surface px-3.5 py-1.5">
            <span className="font-mono text-[13px] text-primary">{slug}.conddo.io</span>
            <Copy size={14} className="text-content-muted" />
          </span>
        </div>
      </div>
    </div>
  );
}
