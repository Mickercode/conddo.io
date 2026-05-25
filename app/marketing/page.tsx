import Link from "next/link";
import {
  TrendingUp,
  Minus,
  Info,
  Plus,
  Camera,
  Video,
  MessageCircle,
  CalendarDays,
  FilePlus2,
  Mail,
  MessageSquare,
  Megaphone,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { MarketingTabs } from "@/components/app/MarketingTabs";

type Delta = { icon: LucideIcon; text: string; tone: string };
const stats: { label: string; value: string; valueTone: string; delta: Delta }[] = [
  { label: "Social Reach", value: "47,200", valueTone: "text-primary", delta: { icon: TrendingUp, text: "12% vs last month", tone: "text-success" } },
  { label: "Post Engagement", value: "6.8%", valueTone: "text-ink", delta: { icon: TrendingUp, text: "0.5% growth", tone: "text-success" } },
  { label: "New Leads", value: "34", valueTone: "text-ink", delta: { icon: Minus, text: "Steady", tone: "text-warning" } },
  { label: "Email Open Rate", value: "28%", valueTone: "text-ink", delta: { icon: TrendingUp, text: "3% boost", tone: "text-success" } },
  { label: "Ad Spend", value: "₦85,000", valueTone: "text-ink", delta: { icon: Info, text: "Target: ₦100k", tone: "text-content-muted" } },
];

const posts: { title: string; when: string; icon: LucideIcon; tone: string }[] = [
  { title: "New Hydrating Serum Launch…", when: "Tomorrow, 10:00 AM", icon: Camera, tone: "bg-primary-bg text-primary" },
  { title: "Client spotlight: Glow transformation", when: "Oct 24, 02:30 PM", icon: Video, tone: "bg-info-bg text-info" },
  { title: "Flash Sale Teaser: 24hrs Only", when: "Oct 26, 09:00 AM", icon: MessageCircle, tone: "bg-primary-bg text-primary" },
];

const campaigns = [
  { name: "May Promo", type: "Email Campaign", typeTone: "bg-primary-bg text-primary", status: "Running", a: ["Sent", "1,240"], b: ["Open Rate", "31.2%"] },
  { name: "New collection alert", type: "SMS Blast", typeTone: "bg-warning-bg text-warning", status: "Active", a: ["Delivered", "450"], b: ["Click Rate", "14.5%"] },
];

const funnel = [
  { label: "New", value: 14, width: "100%", color: "bg-primary" },
  { label: "Contacted", value: 8, width: "57%", color: "bg-primary-light" },
  { label: "Interested", value: 7, width: "50%", color: "bg-primary-border" },
  { label: "Converted", value: 5, width: "35%", color: "bg-neutral-strong" },
];

const quickActions: { label: string; icon: LucideIcon }[] = [
  { label: "Schedule post", icon: FilePlus2 },
  { label: "Create email campaign", icon: Mail },
  { label: "Send SMS blast", icon: MessageSquare },
  { label: "Create ad campaign", icon: Megaphone },
];

export default function MarketingPage() {
  return (
    <AppShell
      title="Marketing"
      subtitle="Growth summary for Glam by Adaeze"
      actions={
        <Button variant="primary" size="md">
          <Plus size={17} />
          <span className="hidden sm:inline">New Campaign</span>
        </Button>
      }
    >
      <MarketingTabs active="Overview" />

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-neutral-border bg-neutral-surface p-4">
            <p className="mb-1 text-[11px] uppercase tracking-[0.05em] text-content-secondary">{s.label}</p>
            <p className={`font-mono text-[22px] font-bold leading-none ${s.valueTone}`}>{s.value}</p>
            <div className={`mt-2.5 flex items-center gap-1 ${s.delta.tone}`}>
              <s.delta.icon size={15} />
              <span className="font-mono text-[11px]">{s.delta.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left */}
        <div className="space-y-6">
          {/* Upcoming posts */}
          <section className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
            <div className="flex items-center justify-between border-b border-neutral-border p-5">
              <h3 className="text-[15px] font-medium text-ink">Upcoming Posts</h3>
              <Link href="/marketing/social" className="text-[13px] font-medium text-primary hover:underline">
                View calendar →
              </Link>
            </div>
            <div className="space-y-2 p-4">
              {posts.map((p) => (
                <div key={p.title} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-surface2">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${p.tone}`}>
                    <p.icon size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-ink">{p.title}</p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-content-muted">
                      <CalendarDays size={14} />
                      <span className="text-[12px]">{p.when}</span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-neutral-surface2 px-2.5 py-1 text-[11px] text-content-secondary">Scheduled</span>
                </div>
              ))}
              <Button variant="primary" size="md" className="mt-2 w-full">
                <Plus size={17} /> Schedule new post
              </Button>
            </div>
          </section>

          {/* Active campaigns */}
          <section className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
            <div className="border-b border-neutral-border p-5">
              <h3 className="text-[15px] font-medium text-ink">
                Active Campaigns <span className="font-normal text-content-muted">(Email and SMS)</span>
              </h3>
            </div>
            <div className="space-y-4 p-5">
              {campaigns.map((c) => (
                <div key={c.name} className="rounded-lg border border-neutral-border bg-neutral-surface p-4">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h4 className="text-[15px] font-semibold text-ink">{c.name}</h4>
                      <span className={`mt-1 inline-block rounded px-2 py-0.5 text-[11px] font-medium ${c.typeTone}`}>{c.type}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-[12px] text-success">
                      <span className="h-2 w-2 rounded-full bg-success" /> {c.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[c.a, c.b].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">{label}</p>
                        <p className="font-mono text-[18px] text-ink">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Leads funnel */}
          <section className="rounded-xl border border-neutral-border bg-neutral-surface p-6">
            <h3 className="mb-6 text-[15px] font-medium text-ink">Leads This Month</h3>
            <div className="mb-5 space-y-3">
              {funnel.map((f) => (
                <div key={f.label}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 flex-1 rounded-sm bg-neutral-surface2">
                      <div className={`h-8 rounded-sm ${f.color}`} style={{ width: f.width }} />
                    </div>
                    <span className="w-8 text-right font-mono text-[14px] text-ink">{f.value}</span>
                  </div>
                  <p className="mt-1 text-[12px] text-content-secondary">{f.label}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-neutral-border pt-4">
              <span className="text-[14px] text-content-muted">Conversion Rate</span>
              <span className="font-mono text-[14px] font-bold text-ink">14.7%</span>
            </div>
          </section>

          {/* Quick actions */}
          <section className="rounded-xl border border-neutral-border bg-neutral-surface p-6">
            <h3 className="mb-4 text-[15px] font-medium text-ink">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  className="group flex items-center gap-3 rounded-lg border border-neutral-border px-4 py-3 text-left text-[14px] text-ink transition-colors hover:bg-neutral-surface2"
                >
                  <a.icon size={18} className="text-primary" />
                  <span className="flex-1">{a.label}</span>
                  <ChevronRight size={16} className="text-content-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
