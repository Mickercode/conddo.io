"use client";

import { Instagram, Facebook, Twitter, Linkedin, CreditCard, CalendarDays, type LucideIcon } from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";

// The integrations the product supports (app config, not tenant data). The
// connect / disconnect flow is gated on the integrations module which hasn't
// landed yet — the catalog renders as a preview with disabled buttons.
const CATALOG: { key: string; name: string; desc: string; icon: LucideIcon }[] = [
  { key: "instagram", name: "Instagram", desc: "Publish posts and sync enquiries.", icon: Instagram },
  { key: "facebook", name: "Facebook", desc: "Publish posts and manage your Page.", icon: Facebook },
  { key: "twitter", name: "Twitter / X", desc: "Schedule and publish posts.", icon: Twitter },
  { key: "linkedin", name: "LinkedIn", desc: "Share updates to your company page.", icon: Linkedin },
  { key: "paystack", name: "Paystack", desc: "Accept payments and reconcile invoices.", icon: CreditCard },
  { key: "google", name: "Google Calendar", desc: "Sync bookings to your calendar.", icon: CalendarDays },
];

export default function ConnectionSettings() {
  return (
    <SettingsShell active="connections" title="Connected Accounts" description="Link the tools you already use to power your website, payments, and marketing.">
      <p className="mb-4 rounded-lg border border-neutral-border bg-neutral-surface2 px-4 py-3 text-[13px] text-content-secondary">
        Connecting accounts will be available shortly — the catalog below is a preview.
      </p>
      <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
        <ul className="divide-y divide-neutral-border">
          {CATALOG.map((c) => (
            <li key={c.key} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-surface2 text-content-secondary">
                  <c.icon size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-ink">{c.name}</p>
                  <p className="truncate text-[13px] text-content-muted">{c.desc}</p>
                </div>
              </div>
              <span className="rounded-full bg-neutral-surface2 px-3 py-1 text-[11px] font-medium text-content-muted">
                Coming soon
              </span>
            </li>
          ))}
        </ul>
      </div>
    </SettingsShell>
  );
}
