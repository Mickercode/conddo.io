"use client";

import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { AddLeadModal } from "@/components/app/AddLeadModal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { MarketingTabs } from "@/components/app/MarketingTabs";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { marketingApi } from "@/lib/api/marketing";

type Tone = "info" | "warning" | "primary" | "success" | "neutral";
const stageTone = (stage: string): Tone => {
  const s = stage.toLowerCase();
  if (s.includes("convert")) return "success";
  if (s.includes("interest")) return "primary";
  if (s.includes("contact")) return "warning";
  if (s.includes("lost")) return "neutral";
  return "info";
};
const titleCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);
const fmtDate = (t: string | null) => {
  if (!t) return "—";
  const d = new Date(t);
  return isNaN(d.getTime()) ? t : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

export default function LeadsPage() {
  const funnel = useApiQuery(marketingApi.funnel);
  const leads = useApiQuery(() => marketingApi.leads());
  const [addOpen, setAddOpen] = useState(false);

  const rows = leads.data ?? [];
  const stages = funnel.data?.stages ?? [];
  const conversionRate = funnel.data?.conversionRate;

  function refetchAll() {
    leads.refetch();
    funnel.refetch();
  }

  return (
    <AppShell
      title="Marketing"
      actions={
        <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
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
            action={<Button variant="primary" size="md" onClick={() => setAddOpen(true)}><Plus size={17} /> Add a lead</Button>}
          />
        }
      >
        <div className="space-y-6">
          {/* Funnel summary */}
          {stages.length > 0 && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stages.map((s) => (
                <div key={s.stage} className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
                  <p className="mb-2 text-[12px] text-white/65">{titleCase(s.stage)}</p>
                  <p className="font-mono text-[24px] font-medium leading-none text-white">{s.count}</p>
                </div>
              ))}
            </div>
          )}
          {conversionRate != null && (
            <p className="text-[13px] text-white/65">
              Conversion rate: <span className="font-mono font-medium text-white">{conversionRate.toFixed(1)}%</span>
            </p>
          )}

          {/* Leads table */}
          <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] uppercase tracking-[0.05em] text-white/65">
                    <th className="px-5 py-3 font-medium">Lead</th>
                    <th className="px-5 py-3 font-medium">Source</th>
                    <th className="px-5 py-3 font-medium">Stage</th>
                    <th className="px-5 py-3 font-medium">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {rows.map((l) => (
                    <tr key={l.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5">
                        <p className="text-[14px] text-white">{l.name}</p>
                        {(l.email || l.phone) && <p className="text-[12px] text-white/45">{l.phone || l.email}</p>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[14px] text-white/65">{l.source ?? "—"}</td>
                      <td className="px-5 py-3.5"><Chip tone={stageTone(l.stage)}>{titleCase(l.stage)}</Chip></td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[14px] text-white/65">{fmtDate(l.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </QueryBoundary>

      <AddLeadModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={refetchAll} />
    </AppShell>
  );
}
