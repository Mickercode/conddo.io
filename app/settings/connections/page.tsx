"use client";

import { Instagram, Facebook, Twitter, Linkedin, CreditCard, CalendarDays, type LucideIcon } from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";

// The integrations the product supports (app config, not tenant data). Connection
// status + the linked account come from the API.
const CATALOG: { key: string; name: string; desc: string; icon: LucideIcon }[] = [
  { key: "instagram", name: "Instagram", desc: "Publish posts and sync enquiries.", icon: Instagram },
  { key: "facebook", name: "Facebook", desc: "Publish posts and manage your Page.", icon: Facebook },
  { key: "twitter", name: "Twitter / X", desc: "Schedule and publish posts.", icon: Twitter },
  { key: "linkedin", name: "LinkedIn", desc: "Share updates to your company page.", icon: Linkedin },
  { key: "paystack", name: "Paystack", desc: "Accept payments and reconcile invoices.", icon: CreditCard },
  { key: "google", name: "Google Calendar", desc: "Sync bookings to your calendar.", icon: CalendarDays },
];

type Connection = { provider: string; connected: boolean; account?: string };

export default function ConnectionSettings() {
  const { data } = useApiQuery<Connection[]>(() => api.get("/settings/connections"));
  const byProvider = new Map((data ?? []).map((c) => [c.provider, c]));

  return (
    <SettingsShell active="connections" title="Connected Accounts" description="Link the tools you already use to power your website, payments, and marketing.">
      <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
        <ul className="divide-y divide-neutral-border">
          {CATALOG.map((c) => {
            const conn = byProvider.get(c.key);
            const connected = conn?.connected ?? false;
            return (
              <li key={c.key} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-surface2 text-content-secondary">
                    <c.icon size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-ink">{c.name}</p>
                    <p className="truncate text-[13px] text-content-muted">{connected && conn?.account ? conn.account : c.desc}</p>
                  </div>
                </div>
                {connected ? (
                  <Button variant="secondary" size="md">Disconnect</Button>
                ) : (
                  <Button variant="primary" size="md">Connect</Button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </SettingsShell>
  );
}
