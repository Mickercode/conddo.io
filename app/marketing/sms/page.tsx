"use client";

import { Plus, MessageSquare } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { MarketingTabs } from "@/components/app/MarketingTabs";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { api } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";

type CampaignStatus = "sent" | "running" | "scheduled" | "draft";
type SmsCampaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  delivered: number;
  clickRate: string;
  date: string;
};

const statusChip: Record<CampaignStatus, { tone: "success" | "warning" | "neutral"; label: string }> = {
  sent: { tone: "success", label: "Sent" },
  running: { tone: "success", label: "Active" },
  scheduled: { tone: "warning", label: "Scheduled" },
  draft: { tone: "neutral", label: "Draft" },
};

export default function SmsCampaignsPage() {
  const { data, loading, error, refetch } = useApiQuery<SmsCampaign[]>(() => api.get("/marketing/campaigns?type=sms"));
  const campaigns = data ?? [];

  return (
    <AppShell
      title="Marketing"
      actions={
        <Button variant="primary" size="md">
          <Plus size={17} />
          <span className="hidden sm:inline">New SMS blast</span>
        </Button>
      }
    >
      <MarketingTabs active="SMS" />
      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={campaigns.length === 0}
        onRetry={refetch}
        empty={
          <EmptyState
            icon={MessageSquare}
            title="No SMS campaigns yet"
            description="SMS gets read fast — perfect for flash sales and reminders. Send your first blast to your customer list."
            action={<Button variant="primary" size="md"><Plus size={17} /> New SMS blast</Button>}
          />
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-[15px] font-semibold text-ink">{c.name}</h3>
                <Chip tone={statusChip[c.status].tone}>{statusChip[c.status].label}</Chip>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">Delivered</p>
                  <p className="font-mono text-[18px] text-ink">{c.delivered.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">Click rate</p>
                  <p className="font-mono text-[18px] text-ink">{c.clickRate}</p>
                </div>
              </div>
              <p className="mt-3 text-[12px] text-content-muted">{c.date}</p>
            </div>
          ))}
        </div>
      </QueryBoundary>
    </AppShell>
  );
}
