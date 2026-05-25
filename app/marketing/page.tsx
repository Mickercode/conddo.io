"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, CalendarDays, FilePlus2, Mail, MessageSquare, Megaphone, ChevronRight, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { MarketingTabs } from "@/components/app/MarketingTabs";
import { CreateCampaignModal } from "@/components/app/CreateCampaignModal";
import { Button } from "@/components/ui/Button";
import { useApiQuery } from "@/hooks/useApiQuery";
import { marketingApi, type Kpi, type Tone } from "@/lib/api/marketing";

const toneText: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  primary: "text-primary",
  neutral: "text-content-muted",
};
const fmtKpi = (v: string | number) => (typeof v === "number" ? v.toLocaleString() : v);
const fmtWhen = (t: string | null) => {
  if (!t) return "Draft";
  const d = new Date(t);
  return isNaN(d.getTime()) ? t : d.toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

const QUICK: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "Schedule post", icon: FilePlus2, href: "/marketing/social" },
  { label: "Create email campaign", icon: Mail, href: "/marketing/email" },
  { label: "Send SMS blast", icon: MessageSquare, href: "/marketing/sms" },
  { label: "Manage leads", icon: Megaphone, href: "/marketing/leads" },
];

export default function MarketingPage() {
  const summary = useApiQuery(marketingApi.summary);
  const posts = useApiQuery(() => marketingApi.posts());
  const campaigns = useApiQuery(() => marketingApi.campaigns());
  const funnel = useApiQuery(marketingApi.funnel);
  const [campaignOpen, setCampaignOpen] = useState(false);

  const s = summary.data;
  const kpis: { label: string; kpi?: Kpi }[] = [
    { label: "Social Reach", kpi: s?.socialReach },
    { label: "Post Engagement", kpi: s?.postEngagement },
    { label: "New Leads", kpi: s?.newLeads },
    { label: "Email Open Rate", kpi: s?.emailOpenRate },
    { label: "Ad Spend", kpi: s?.adSpend },
  ];

  const upcoming = (posts.data ?? [])
    .filter((p) => p.scheduledAt && new Date(p.scheduledAt).getTime() >= Date.now() - 864e5)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
    .slice(0, 4);
  const activeCampaigns = (campaigns.data ?? []).filter((c) => c.status?.toLowerCase() !== "draft").slice(0, 4);
  const stages = funnel.data?.stages ?? [];
  const maxStage = Math.max(1, ...stages.map((x) => x.count));

  return (
    <AppShell
      title="Marketing"
      subtitle="Your growth at a glance"
      actions={
        <Button variant="primary" size="md" onClick={() => setCampaignOpen(true)}>
          <Plus size={17} />
          <span className="hidden sm:inline">New Campaign</span>
        </Button>
      }
    >
      <MarketingTabs active="Overview" />

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-neutral-border bg-neutral-surface p-4">
            <p className="mb-1 text-[11px] uppercase tracking-[0.05em] text-content-secondary">{k.label}</p>
            <p className="font-mono text-[22px] font-bold leading-none text-ink">{k.kpi ? fmtKpi(k.kpi.value) : "—"}</p>
            {k.kpi?.delta && (
              <p className={`mt-2.5 font-mono text-[11px] ${toneText[k.kpi.tone] ?? "text-content-muted"}`}>{k.kpi.delta}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left */}
        <div className="space-y-6">
          {/* Upcoming posts */}
          <section className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
            <div className="flex items-center justify-between border-b border-neutral-border p-5">
              <h3 className="text-[15px] font-medium text-ink">Upcoming Posts</h3>
              <Link href="/marketing/social" className="text-[13px] font-medium text-primary hover:underline">View calendar →</Link>
            </div>
            <div className="space-y-2 p-4">
              {upcoming.length > 0 ? (
                upcoming.map((p) => (
                  <Link key={p.id} href="/marketing/social" className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-surface2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-bg text-primary"><CalendarDays size={20} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-ink">{p.title || p.content || "Untitled post"}</p>
                      <p className="mt-0.5 text-[12px] text-content-muted">{fmtWhen(p.scheduledAt)}{p.platform ? ` · ${p.platform}` : ""}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-neutral-surface2 px-2.5 py-1 text-[11px] capitalize text-content-secondary">{p.status}</span>
                  </Link>
                ))
              ) : (
                <p className="px-2 py-6 text-center text-[13px] text-content-secondary">No upcoming posts. Schedule one to fill your calendar.</p>
              )}
              <Button variant="primary" size="md" className="mt-2 w-full" href="/marketing/social">
                <Plus size={17} /> Schedule new post
              </Button>
            </div>
          </section>

          {/* Active campaigns */}
          <section className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
            <div className="border-b border-neutral-border p-5">
              <h3 className="text-[15px] font-medium text-ink">Active Campaigns <span className="font-normal text-content-muted">(Email and SMS)</span></h3>
            </div>
            <div className="space-y-4 p-5">
              {activeCampaigns.length > 0 ? (
                activeCampaigns.map((c) => (
                  <div key={c.id} className="rounded-lg border border-neutral-border bg-neutral-surface p-4">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h4 className="text-[15px] font-semibold text-ink">{c.name}</h4>
                        <span className="mt-1 inline-block rounded bg-primary-bg px-2 py-0.5 text-[11px] font-medium capitalize text-primary">{c.type}</span>
                      </div>
                      <span className="flex items-center gap-1.5 text-[12px] capitalize text-success"><span className="h-2 w-2 rounded-full bg-success" /> {c.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">{c.type?.toLowerCase() === "sms" ? "Delivered" : "Sent"}</p>
                        <p className="font-mono text-[18px] text-ink">{(c.type?.toLowerCase() === "sms" ? c.delivered : c.sent).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">{c.type?.toLowerCase() === "sms" ? "Click rate" : "Open rate"}</p>
                        <p className="font-mono text-[18px] text-ink">{((c.type?.toLowerCase() === "sms" ? c.clickRate : c.openRate) || 0).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-[13px] text-content-secondary">No active campaigns yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Leads funnel */}
          <section className="rounded-xl border border-neutral-border bg-neutral-surface p-6">
            <h3 className="mb-6 text-[15px] font-medium text-ink">Leads Funnel</h3>
            {stages.length > 0 ? (
              <>
                <div className="mb-5 space-y-3">
                  {stages.map((f, i) => (
                    <div key={f.stage}>
                      <div className="flex items-center gap-3">
                        <div className="h-8 flex-1 rounded-sm bg-neutral-surface2">
                          <div className="h-8 rounded-sm bg-primary" style={{ width: `${Math.max(8, (f.count / maxStage) * 100)}%`, opacity: 1 - i * 0.15 }} />
                        </div>
                        <span className="w-8 text-right font-mono text-[14px] text-ink">{f.count}</span>
                      </div>
                      <p className="mt-1 text-[12px] capitalize text-content-secondary">{f.stage}</p>
                    </div>
                  ))}
                </div>
                {funnel.data?.conversionRate != null && (
                  <div className="flex justify-between border-t border-neutral-border pt-4">
                    <span className="text-[14px] text-content-muted">Conversion Rate</span>
                    <span className="font-mono text-[14px] font-bold text-ink">{funnel.data.conversionRate.toFixed(1)}%</span>
                  </div>
                )}
              </>
            ) : (
              <p className="py-4 text-center text-[13px] text-content-secondary">No leads yet.</p>
            )}
          </section>

          {/* Quick actions */}
          <section className="rounded-xl border border-neutral-border bg-neutral-surface p-6">
            <h3 className="mb-4 text-[15px] font-medium text-ink">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              {QUICK.map((a) => (
                <Link key={a.label} href={a.href} className="group flex items-center gap-3 rounded-lg border border-neutral-border px-4 py-3 text-left text-[14px] text-ink transition-colors hover:bg-neutral-surface2">
                  <a.icon size={18} className="text-primary" />
                  <span className="flex-1">{a.label}</span>
                  <ChevronRight size={16} className="text-content-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <CreateCampaignModal open={campaignOpen} onClose={() => setCampaignOpen(false)} type="email" onCreated={() => campaigns.refetch()} />
    </AppShell>
  );
}
