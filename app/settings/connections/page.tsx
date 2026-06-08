"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Instagram, Facebook, Linkedin, Calendar, MessageCircle, Twitter,
  Music2, Mail, Loader2, Check, X, AlertCircle, ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  socialApi,
  type AyrshareProvider,
  type SocialAccountPlatform,
} from "@/lib/api/social";
import { ApiError, isPlanUpgradeRequired, planUpgradeDetails } from "@/lib/api/client";

// "live" = Ayrshare covers this provider end-to-end (the BE shipment
// b7eccb0 wires it). "coming_soon" = on the roadmap but no integration
// yet (WhatsApp Business, Google Calendar, Brevo are all separate vendor
// decisions, not part of Ayrshare).
type Provider = {
  key: AyrshareProvider | "whatsapp" | "google_calendar" | "brevo";
  name: string;
  icon: LucideIcon;
  desc: string;
  group: "social" | "messaging" | "schedule" | "marketing";
  status: "live" | "coming_soon";
  note?: string;
};

const PROVIDERS: Provider[] = [
  { key: "facebook",  name: "Facebook Page",        icon: Facebook,      desc: "Schedule posts to your Facebook Page and sync enquiries.", group: "social",    status: "live" },
  { key: "instagram", name: "Instagram Business",   icon: Instagram,     desc: "Publish photos, carousels, and Reels to your Business account.", group: "social",    status: "live" },
  { key: "linkedin",  name: "LinkedIn Company Page", icon: Linkedin,     desc: "Share updates to your company page.", group: "social",    status: "live" },
  { key: "twitter",   name: "X (Twitter)",          icon: Twitter,       desc: "Schedule tweets and threads.", group: "social",    status: "live" },
  { key: "tiktok",    name: "TikTok",               icon: Music2,        desc: "Direct-post short videos to your TikTok account.", group: "social",    status: "live" },
  { key: "whatsapp",  name: "WhatsApp Business",    icon: MessageCircle, desc: "Send order updates and reminders to your customers.", group: "messaging", status: "coming_soon" },
  { key: "google_calendar", name: "Google Calendar", icon: Calendar,     desc: "Sync bookings to your Google Calendar so you never double-book.", group: "schedule",  status: "coming_soon" },
  { key: "brevo",     name: "Brevo (Email + SMS sender)", icon: Mail,    desc: "Send marketing email + SMS through your verified sender.", group: "marketing", status: "coming_soon" },
];

const GROUP_LABELS: Record<Provider["group"], string> = {
  social:    "Social media",
  messaging: "Messaging",
  schedule:  "Calendar",
  marketing: "Marketing infrastructure",
};

function fmtProvider(p: Provider) { return p.name; }

// useSearchParams() requires a Suspense boundary in Next 14 App Router so the
// build doesn't deopt the whole settings tree into client-only rendering.
export default function ConnectionSettings() {
  return (
    <Suspense fallback={null}>
      <ConnectionSettingsInner />
    </Suspense>
  );
}

function ConnectionSettingsInner() {
  const toast = useToast();
  const search = useSearchParams();
  const reconnect = search.get("reconnect") === "1";

  const accountsQ = useApiQuery(socialApi.accounts);
  const [busy, setBusy] = useState<string | null>(null);

  // Build a quick { provider → connected, externalName } map from the live
  // accounts response. Falls back to "not connected" for providers we
  // support but the BE hasn't returned (treats missing as not-connected).
  const accountByProvider = new Map<string, SocialAccountPlatform>();
  (accountsQ.data?.platforms ?? []).forEach((p) => {
    accountByProvider.set(p.provider, p);
  });

  // Refresh accounts after the Ayrshare-redirect-back lands on the page.
  // Toast the user so they know we're refreshing.
  useEffect(() => {
    if (!reconnect) return;
    toast.success("Refreshing your connections…");
    accountsQ.refetch();
    // Strip the query param so refreshing the page doesn't re-fire this.
    const url = new URL(window.location.href);
    url.searchParams.delete("reconnect");
    window.history.replaceState({}, "", url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconnect]);

  // Detect a plan-gate (Launcher tenants hit Growth-gated social_scheduler).
  // Show an upgrade banner up top and disable the Connect actions.
  const gateError = accountsQ.error && isPlanUpgradeRequired(accountsQ.error) ? accountsQ.error : null;
  const gateHint = gateError ? planUpgradeDetails(gateError) : null;

  async function connect(p: Provider) {
    if (p.status !== "live") {
      toast.toast({ tone: "info", title: "Coming soon", description: `${p.name} integration isn't live yet — we'll notify you when it is.` });
      return;
    }
    setBusy(p.key);
    try {
      const { data } = await socialApi.connectLink({ provider: p.key as AyrshareProvider });
      if (!data.connectUrl) throw new Error("BE didn't return a connect URL");
      toast.success("Opening connection dialog…");
      // Full-page navigate (not a tab) so Ayrshare's hosted page can bounce
      // back to /settings/connections?reconnect=1 — same-window flow.
      window.location.href = data.connectUrl;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Please try again.";
      toast.error(`Couldn't open ${p.name} connection`, msg);
    } finally {
      setBusy(null);
    }
  }

  async function disconnect(p: Provider) {
    if (!confirm(`Disconnect ${p.name}? Scheduled posts to this channel will fail until you reconnect.`)) return;
    setBusy(p.key);
    try {
      await socialApi.disconnect(p.key as AyrshareProvider);
      toast.success(`${p.name} disconnected`);
      accountsQ.refetch();
    } catch (err) {
      toast.error(`Couldn't disconnect ${p.name}`, err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const groups: { id: Provider["group"]; rows: Provider[] }[] = (["social", "messaging", "schedule", "marketing"] as const).map((g) => ({
    id: g,
    rows: PROVIDERS.filter((p) => p.group === g),
  }));

  return (
    <SettingsShell active="connections" title="Connected Accounts" description="Connect the tools you already use — your dashboard scheduling, marketing, and customer messaging will pull through them.">
      {gateError ? (
        <div className="mb-5 rounded-xl border border-warning/20 bg-warning-bg px-4 py-3 text-[13px] text-warning">
          <strong className="font-medium text-ink">Social scheduling is a Growth feature.</strong>{" "}
          {gateHint?.requiredPlan && gateHint.requiredPlanPrice && (
            <>{gateHint.requiredPlan} unlocks Facebook + Instagram + LinkedIn + X + TikTok from ₦{gateHint.requiredPlanPrice.toLocaleString("en-NG")}/month. </>
          )}
          <a href={gateHint?.upgradeUrl ?? "/settings/billing"} className="font-medium underline hover:no-underline">Upgrade your plan</a> to enable.
        </div>
      ) : (
        <div className="mb-5 rounded-xl border border-neutral-border bg-neutral-surface px-4 py-3 text-[13px] text-content-secondary">
          <strong className="font-medium text-ink">Connect once, post everywhere.</strong>{" "}
          We use a single gateway for all your social channels. Click Connect on any platform → authorise in the hosted dialog → return here. Sessions are shared across all your devices.
        </div>
      )}

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.id}>
            <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.06em] text-content-muted">
              {GROUP_LABELS[group.id]}
            </p>
            <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
              <ul className="divide-y divide-neutral-border">
                {group.rows.map((p) => {
                  const live = accountByProvider.get(p.key);
                  const connected = live?.connected ?? false;
                  const externalName = live?.externalName ?? null;
                  const isLive = p.status === "live";
                  const isBusy = busy === p.key;
                  const isGated = Boolean(gateError) && isLive;
                  return (
                    <li key={p.key} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-surface2 text-content-secondary">
                          <p.icon size={20} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[14px] font-medium text-ink">{fmtProvider(p)}</p>
                            {isLive ? (
                              connected ? (
                                <Chip tone="success">
                                  <span className="inline-flex items-center gap-1"><Check size={11} /> Connected</span>
                                </Chip>
                              ) : isGated ? (
                                <Chip tone="warning">Upgrade required</Chip>
                              ) : (
                                <Chip tone="neutral">Not connected</Chip>
                              )
                            ) : (
                              <Chip tone="neutral">Coming soon</Chip>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-[13px] text-content-muted">{p.desc}</p>
                          {connected && externalName && (
                            <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-content-secondary">
                              <ExternalLink size={11} /> {externalName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {!isLive ? (
                          <Button variant="secondary" size="md" disabled className="opacity-60">
                            Coming soon
                          </Button>
                        ) : connected ? (
                          <Button
                            variant="secondary"
                            size="md"
                            onClick={() => disconnect(p)}
                            disabled={isBusy}
                          >
                            {isBusy ? <><Loader2 size={14} className="animate-spin" /> Disconnecting…</> : (<><X size={14} /> Disconnect</>)}
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => connect(p)}
                            disabled={isBusy || isGated}
                            title={isGated ? "Upgrade to Growth to enable" : `Connect ${p.name}`}
                          >
                            {isBusy ? <><Loader2 size={14} className="animate-spin" /> Opening…</> : "Connect"}
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Tiny help / refresh affordance */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[12px] text-content-muted">
        <p>
          Need a connection that isn't listed?{" "}
          <a href="mailto:hello@conddo.io?subject=Connection%20request" className="font-medium text-primary hover:underline">
            Tell us what you use
          </a>
        </p>
        <button
          type="button"
          onClick={() => accountsQ.refetch()}
          disabled={accountsQ.loading}
          className="inline-flex items-center gap-1 rounded-md border border-neutral-border px-2.5 py-1 hover:bg-neutral-surface2 hover:text-ink disabled:opacity-50"
        >
          {accountsQ.loading ? <Loader2 size={11} className="animate-spin" /> : <AlertCircle size={11} />} Refresh
        </button>
      </div>
    </SettingsShell>
  );
}
