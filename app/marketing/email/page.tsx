"use client";

import { useState } from "react";
import { Plus, Mail } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { CreateCampaignModal } from "@/components/app/CreateCampaignModal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { MarketingTabs } from "@/components/app/MarketingTabs";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { marketingApi } from "@/lib/api/marketing";

type Tone = "success" | "warning" | "neutral";
const statusTone = (s: string): Tone => {
  const v = s.toLowerCase();
  if (v.includes("sent") || v.includes("run") || v.includes("active") || v.includes("complete")) return "success";
  if (v.includes("schedul")) return "warning";
  return "neutral";
};
const titleCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);
const fmtDate = (t: string | null) => {
  if (!t) return "Draft";
  const d = new Date(t);
  return isNaN(d.getTime()) ? t : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

export default function EmailCampaignsPage() {
  const { data, loading, error, refetch } = useApiQuery(() => marketingApi.campaigns("type=email"));
  const campaigns = data ?? [];
  const [addOpen, setAddOpen] = useState(false);

  return (
    <AppShell
      title="Marketing"
      actions={
        <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
          <Plus size={17} />
          <span className="hidden sm:inline">New email campaign</span>
        </Button>
      }
    >
      <MarketingTabs active="Email" />
      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={campaigns.length === 0}
        onRetry={refetch}
        gatedFeatureTitle="Email campaigns"
        empty={
          <EmptyState
            icon={Mail}
            title="No email campaigns yet"
            description="Reach your customers' inboxes with announcements, promos, and updates. Create your first campaign to get started."
            action={<Button variant="primary" size="md" onClick={() => setAddOpen(true)}><Plus size={17} /> New email campaign</Button>}
          />
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-[15px] font-semibold text-ink">{c.name}</h3>
                <Chip tone={statusTone(c.status)}>{titleCase(c.status)}</Chip>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">Recipients</p>
                  <p className="font-mono text-[18px] text-ink">{(c.sent || c.audienceSize || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">Open rate</p>
                  <p className="font-mono text-[18px] text-ink">{c.openRate ? `${c.openRate.toFixed(1)}%` : "—"}</p>
                </div>
              </div>
              <p className="mt-3 text-[12px] text-content-muted">{fmtDate(c.scheduledAt)}</p>
            </div>
          ))}
        </div>
      </QueryBoundary>

      <CreateCampaignModal open={addOpen} onClose={() => setAddOpen(false)} type="email" onCreated={refetch} />
    </AppShell>
  );
}
