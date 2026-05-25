"use client";

import { Plus, Megaphone } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { MarketingTabs } from "@/components/app/MarketingTabs";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { api } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";

type AdStatus = "active" | "paused" | "ended" | "draft";
type AdCampaign = {
  id: string;
  name: string;
  platform: string;
  status: AdStatus;
  spend: number;
  reach: number;
  date: string;
};

const statusChip: Record<AdStatus, { tone: "success" | "warning" | "neutral"; label: string }> = {
  active: { tone: "success", label: "Active" },
  paused: { tone: "warning", label: "Paused" },
  ended: { tone: "neutral", label: "Ended" },
  draft: { tone: "neutral", label: "Draft" },
};

export default function AdsPage() {
  const { data, loading, error, refetch } = useApiQuery<AdCampaign[]>(() => api.get("/marketing/ads"));
  const ads = data ?? [];

  return (
    <AppShell
      title="Marketing"
      actions={
        <Button variant="primary" size="md">
          <Plus size={17} />
          <span className="hidden sm:inline">New ad campaign</span>
        </Button>
      }
    >
      <MarketingTabs active="Ads" />
      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={ads.length === 0}
        onRetry={refetch}
        empty={
          <EmptyState
            icon={Megaphone}
            title="No ad campaigns yet"
            description="Run Instagram and Facebook ads to reach new customers, and track spend and reach right here."
            action={<Button variant="primary" size="md"><Plus size={17} /> New ad campaign</Button>}
          />
        }
      >
        <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-neutral-border bg-neutral-surface2 text-[11px] uppercase tracking-[0.05em] text-content-secondary">
                  <th className="px-5 py-3 font-medium">Campaign</th>
                  <th className="px-5 py-3 font-medium">Platform</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Spend</th>
                  <th className="px-5 py-3 text-right font-medium">Reach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {ads.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-neutral-surface2">
                    <td className="px-5 py-3.5 text-[14px] text-ink">{a.name}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[14px] text-content-secondary">{a.platform}</td>
                    <td className="px-5 py-3.5"><Chip tone={statusChip[a.status].tone}>{statusChip[a.status].label}</Chip></td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-[13px] text-ink">{naira(a.spend)}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-[13px] text-ink">{a.reach.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </QueryBoundary>
    </AppShell>
  );
}
