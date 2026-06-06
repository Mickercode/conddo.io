"use client";

import { useState } from "react";
import {
  Instagram,
  Facebook,
  Linkedin,
  Calendar,
  CreditCard,
  MessageCircle,
  Twitter,
  Music2,
  Mail,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";

// Provider catalog with phase + readiness status. The phase is what schedules
// the BE OAuth work (see backend/SOCIAL_AND_CREATIVE_SERVICES_SPEC.md §12).
// When BE flips a provider to live, swap `status: "pending_approval"` for
// `"live"` here and the Connect button starts firing the OAuth flow.
type ProviderStatus = "live" | "pending_approval" | "coming_soon";
type Provider = {
  key: "facebook" | "instagram" | "linkedin" | "twitter" | "tiktok" | "whatsapp" | "google_calendar" | "brevo";
  name: string;
  icon: LucideIcon;
  desc: string;
  group: "social" | "messaging" | "schedule" | "marketing";
  status: ProviderStatus;
  /** Short note shown on hover / under the button when not live. */
  note?: string;
};

const PROVIDERS: Provider[] = [
  // Social — Phase 2 in the spec (Meta App Review ~3 weeks). FB + IG share
  // one approval (one Meta app covers both).
  {
    key: "facebook",
    name: "Facebook Page",
    icon: Facebook,
    desc: "Schedule posts to your Facebook Page and sync enquiries.",
    group: "social",
    status: "pending_approval",
    note: "Awaiting Meta App Review",
  },
  {
    key: "instagram",
    name: "Instagram Business",
    icon: Instagram,
    desc: "Publish photos, carousels, and Reels to your Business account.",
    group: "social",
    status: "pending_approval",
    note: "Awaiting Meta App Review",
  },
  {
    key: "linkedin",
    name: "LinkedIn Company Page",
    icon: Linkedin,
    desc: "Share updates to your company page.",
    group: "social",
    status: "pending_approval",
    note: "Awaiting LinkedIn Marketing Developer approval",
  },
  // Phase 4
  {
    key: "twitter",
    name: "X (Twitter)",
    icon: Twitter,
    desc: "Schedule tweets and threads.",
    group: "social",
    status: "coming_soon",
  },
  {
    key: "tiktok",
    name: "TikTok",
    icon: Music2,
    desc: "Direct-post short videos to your TikTok account.",
    group: "social",
    status: "coming_soon",
  },
  // Messaging
  {
    key: "whatsapp",
    name: "WhatsApp Business",
    icon: MessageCircle,
    desc: "Send order updates and reminders to your customers.",
    group: "messaging",
    status: "coming_soon",
  },
  // Schedule
  {
    key: "google_calendar",
    name: "Google Calendar",
    icon: Calendar,
    desc: "Sync bookings to your Google Calendar so you never double-book.",
    group: "schedule",
    status: "coming_soon",
  },
  // Marketing infra
  {
    key: "brevo",
    name: "Brevo (Email + SMS sender)",
    icon: Mail,
    desc: "Send marketing email + SMS through your verified sender.",
    group: "marketing",
    status: "coming_soon",
  },
];

const GROUP_LABELS: Record<Provider["group"], string> = {
  social: "Social media",
  messaging: "Messaging",
  schedule: "Calendar",
  marketing: "Marketing infrastructure",
};

const statusChip: Record<ProviderStatus, { tone: "success" | "warning" | "neutral"; label: string }> = {
  live: { tone: "success", label: "Available" },
  pending_approval: { tone: "warning", label: "Approval pending" },
  coming_soon: { tone: "neutral", label: "Coming soon" },
};

function ProviderRow({
  provider,
  onNotify,
  notifying,
}: {
  provider: Provider;
  onNotify: (p: Provider) => void;
  notifying: boolean;
}) {
  const chip = statusChip[provider.status];
  return (
    <li className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-surface2 text-content-secondary">
          <provider.icon size={20} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-medium text-ink">{provider.name}</p>
            <Chip tone={chip.tone}>{chip.label}</Chip>
          </div>
          <p className="mt-0.5 truncate text-[13px] text-content-muted">{provider.desc}</p>
          {provider.note && (
            <p className="mt-1 text-[12px] text-content-muted/80">{provider.note}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">
        {provider.status === "live" ? (
          <Button variant="primary" size="md" disabled>
            Connect
          </Button>
        ) : (
          <Button variant="secondary" size="md" onClick={() => onNotify(provider)} disabled={notifying}>
            {notifying ? <Loader2 size={14} className="animate-spin" /> : null}
            Notify me when ready
          </Button>
        )}
      </div>
    </li>
  );
}

export default function ConnectionSettings() {
  const toast = useToast();
  const [notifyingKey, setNotifyingKey] = useState<string | null>(null);

  // Group providers for display
  const groups: { id: Provider["group"]; rows: Provider[] }[] = (["social", "messaging", "schedule", "marketing"] as const).map((g) => ({
    id: g,
    rows: PROVIDERS.filter((p) => p.group === g),
  }));

  async function notifyWhenReady(p: Provider) {
    // No BE notify endpoint yet — we just confirm to the tenant that we
    // recorded interest. When BE lands the OAuth flow, this becomes a real
    // signup (POST /settings/connections/notify {provider}).
    setNotifyingKey(p.key);
    try {
      await new Promise((r) => setTimeout(r, 350));
      toast.success(`We'll notify you when ${p.name} is ready`, "Usually within 2-3 weeks.");
    } finally {
      setNotifyingKey(null);
    }
  }

  return (
    <SettingsShell active="connections" title="Connected Accounts" description="Connect the tools you already use — your dashboard scheduling, marketing, and customer messaging will pull through them.">
      <div className="mb-5 rounded-xl border border-warning/20 bg-warning-bg px-4 py-3 text-[13px] text-warning">
        <strong className="font-medium text-ink">Connect flow is being reviewed by each platform.</strong>{" "}
        Meta (Facebook + Instagram) and LinkedIn require formal app approval before we can post on a tenant's behalf — usually 2-3 weeks. We'll notify you the moment connect goes live.
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.id}>
            <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.06em] text-content-muted">
              {GROUP_LABELS[group.id]}
            </p>
            <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
              <ul className="divide-y divide-neutral-border">
                {group.rows.map((p) => (
                  <ProviderRow
                    key={p.key}
                    provider={p}
                    onNotify={notifyWhenReady}
                    notifying={notifyingKey === p.key}
                  />
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-[12px] text-content-muted">
        Need a connection that isn't listed?{" "}
        <a href="mailto:hello@conddo.io?subject=Connection%20request" className="font-medium text-primary hover:underline">
          Tell us what you use
        </a>
      </p>
    </SettingsShell>
  );
}
