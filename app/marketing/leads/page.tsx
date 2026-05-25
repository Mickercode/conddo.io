"use client";

import { Plus, UserPlus } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { MarketingTabs } from "@/components/app/MarketingTabs";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { api } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";

type LeadStage = "New" | "Contacted" | "Interested" | "Converted" | "Lost";
type Lead = { id: string; name: string; source: string; stage: LeadStage; lastContact: string };
type FunnelStage = { label: string; value: number };

const stageTone: Record<LeadStage, "info" | "warning" | "primary" | "success" | "neutral"> = {
  New: "info",
  Contacted: "warning",
  Interested: "primary",
  Converted: "success",
  Lost: "neutral",
};

export default function LeadsPage() {
  const funnel = useApiQuery<FunnelStage[]>(() => api.get("/marketing/leads/funnel"));
  const leads = useApiQuery<Lead[]>(() => api.get("/marketing/leads"));
  const rows = leads.data ?? [];
  const stages = funnel.data ?? [];

  return (
    <AppShell
      title="Marketing"
      actions={
        <Button variant="primary" size="md">
          <Plus size={17} />
          <span className="hidden sm:inline">Add lead</span>
        </Button>
      }
    >
      <MarketingTabs active="Leads" />
      <QueryBoundary
        loading={leads.loading}
        error={leads.error}
        isEmpty={rows.length === 0}
        onRetry={leads.refetch}
        empty={
          <EmptyState
            icon={UserPlus}
            title="No leads yet"
            description="Enquiries from your website and social channels land here. Track them from New to Converted."
            action={<Button variant="primary" size="md"><Plus size={17} /> Add a lead</Button>}
          />
        }
      >
        <div className="space-y-6">
          {/* Funnel summary */}
          {stages.length > 0 && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stages.map((s) => (
                <div key={s.label} className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
                  <p className="mb-2 text-[12px] text-content-secondary">{s.label}</p>
                  <p className="font-mono text-[24px] font-medium leading-none text-ink">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Leads table */}
          <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="border-b border-neutral-border bg-neutral-surface2 text-[11px] uppercase tracking-[0.05em] text-content-secondary">
                    <th className="px-5 py-3 font-medium">Lead</th>
                    <th className="px-5 py-3 font-medium">Source</th>
                    <th className="px-5 py-3 font-medium">Stage</th>
                    <th className="px-5 py-3 font-medium">Last contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border">
                  {rows.map((l) => (
                    <tr key={l.id} className="transition-colors hover:bg-neutral-surface2">
                      <td className="px-5 py-3.5 text-[14px] text-ink">{l.name}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[14px] text-content-secondary">{l.source}</td>
                      <td className="px-5 py-3.5"><Chip tone={stageTone[l.stage]}>{l.stage}</Chip></td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[14px] text-content-secondary">{l.lastContact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </QueryBoundary>
    </AppShell>
  );
}
