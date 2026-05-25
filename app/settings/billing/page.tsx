"use client";

import { CreditCard, Download } from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { api } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";

type SubStatus = "active" | "trialing" | "past_due" | "cancelled";
type Subscription = {
  plan: string;
  status: SubStatus;
  amount: number;
  interval: string;
  renewalDate: string;
  trialEndsAt?: string;
};
type Invoice = { id: string; date: string; amount: number; status: "paid" | "failed" | "pending" };

const statusChip: Record<SubStatus, { tone: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  active: { tone: "success", label: "Active" },
  trialing: { tone: "warning", label: "Trial" },
  past_due: { tone: "danger", label: "Past due" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};

export default function BillingSettings() {
  const sub = useApiQuery<Subscription>(() => api.get("/billing/subscription"));
  const inv = useApiQuery<Invoice[]>(() => api.get("/billing/invoices"));
  const invoices = inv.data ?? [];

  return (
    <SettingsShell active="billing" title="Subscription & Billing" description="Manage your plan, payment method, and invoices.">
      <QueryBoundary
        loading={sub.loading}
        error={sub.error}
        isEmpty={!sub.data}
        onRetry={sub.refetch}
        empty={
          <EmptyState
            icon={CreditCard}
            title="No active subscription"
            description="Your current plan, renewal date, and invoice history will appear here once your subscription is active."
            action={<Button variant="primary" size="md">Choose a plan</Button>}
          />
        }
      >
        {sub.data && (
          <div className="space-y-6">
            {/* Current plan */}
            <div className="rounded-xl border border-neutral-border bg-neutral-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-[18px] font-medium text-ink">{sub.data.plan}</h3>
                    <Chip tone={statusChip[sub.data.status].tone}>{statusChip[sub.data.status].label}</Chip>
                  </div>
                  <p className="font-mono text-[14px] text-content-secondary">
                    {naira(sub.data.amount)}/{sub.data.interval}
                  </p>
                  <p className="mt-2 text-[13px] text-content-muted">
                    {sub.data.status === "trialing" && sub.data.trialEndsAt
                      ? `Trial ends ${sub.data.trialEndsAt}`
                      : `Renews ${sub.data.renewalDate}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="md">Manage payment</Button>
                  <Button variant="primary" size="md">Change plan</Button>
                </div>
              </div>
            </div>

            {/* Invoices */}
            <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
              <div className="border-b border-neutral-border px-6 py-4">
                <h3 className="text-[15px] font-medium text-ink">Billing history</h3>
              </div>
              {invoices.length > 0 ? (
                <table className="w-full text-left">
                  <tbody className="divide-y divide-neutral-border">
                    {invoices.map((i) => (
                      <tr key={i.id} className="transition-colors hover:bg-neutral-surface2">
                        <td className="px-6 py-3.5 font-mono text-[13px] text-content-secondary">{i.date}</td>
                        <td className="px-6 py-3.5 font-mono text-[13px] text-ink">{naira(i.amount)}</td>
                        <td className="px-6 py-3.5">
                          <Chip tone={i.status === "paid" ? "success" : i.status === "failed" ? "danger" : "warning"}>{i.status}</Chip>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button aria-label="Download invoice" className="text-content-muted hover:text-primary">
                            <Download size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-6 py-8 text-center text-[14px] text-content-secondary">No invoices yet.</p>
              )}
            </div>
          </div>
        )}
      </QueryBoundary>
    </SettingsShell>
  );
}
