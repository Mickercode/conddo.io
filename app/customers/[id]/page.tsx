"use client";

import { Phone, Mail, CalendarDays, Plus, Ruler, Users, ShoppingBag, ReceiptText } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { customersApi, tagTone, type CustomerDetail } from "@/lib/api/customers";

const initialsOf = (s: string) =>
  s.trim().split(/[\s@.]+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
const fmtDate = (t: string | null) => {
  if (!t) return "—";
  const d = new Date(t);
  return isNaN(d.getTime()) ? t : `Member since ${d.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}`;
};

function Profile({ c }: { c: CustomerDetail }) {
  const display = c.name || c.email || "Customer";
  const measurements = c.measurements ? Object.entries(c.measurements) : [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
      {/* Left: identity + notes */}
      <div className="space-y-6">
        <div className="rounded-xl border border-neutral-border bg-neutral-surface p-6 text-center">
          <span className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary-bg font-mono text-[32px] font-semibold text-primary">
            {initialsOf(display)}
          </span>
          <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">{display}</h2>
          {c.tag && (
            <div className="mt-2 flex justify-center">
              <Chip tone={tagTone[c.tag]}>{c.tag}</Chip>
            </div>
          )}
          <div className="mt-5 space-y-2.5 border-t border-neutral-border pt-5 text-left">
            <div className="flex items-center gap-2.5 text-content-secondary">
              <Phone size={16} className="shrink-0 text-content-muted" />
              <span className="text-[14px]">{c.phone ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-content-secondary">
              <Mail size={16} className="shrink-0 text-content-muted" />
              <span className="truncate text-[14px]">{c.email ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-content-muted">
              <CalendarDays size={16} className="shrink-0" />
              <span className="text-[14px]">{fmtDate(c.memberSince)}</span>
            </div>
          </div>
          <div className="mt-6 space-y-2.5">
            <Button variant="primary" size="md" className="w-full"><Plus size={17} /> New Order</Button>
            <div className="grid grid-cols-2 gap-2.5">
              <Button variant="secondary" size="md">Send SMS</Button>
              <Button variant="secondary" size="md">Send Email</Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-border bg-neutral-surface p-6">
          <h3 className="mb-3 text-[11px] uppercase tracking-[0.05em] text-content-muted">Internal Notes</h3>
          <textarea
            defaultValue={c.notes ?? ""}
            placeholder="Enter customer specific notes here..."
            className="h-32 w-full resize-none rounded-lg border border-neutral-border bg-neutral-bg p-3 text-[14px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button variant="secondary" size="md" className="mt-3 w-full">Save Notes</Button>
        </div>
      </div>

      {/* Right: metrics + history */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Total Spent", value: naira(c.totalSpent), accent: true },
            { label: "Orders", value: String(c.orders), accent: false },
            { label: "Avg Order Value", value: naira(c.avgOrderValue), accent: false },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
              <p className="mb-2 text-[11px] uppercase tracking-[0.05em] text-content-muted">{m.label}</p>
              <p className={`font-mono text-[22px] font-medium leading-none ${m.accent ? "text-primary" : "text-ink"}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Measurement Profile */}
        <div className="rounded-xl border border-neutral-border bg-neutral-surface">
          <div className="flex items-center justify-between border-b border-neutral-border px-6 py-4">
            <h3 className="text-[15px] font-medium text-ink">Measurement Profile</h3>
            <button className="text-[12px] font-semibold text-primary hover:underline">Update measurements</button>
          </div>
          {measurements.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 px-6 py-5 sm:grid-cols-3">
              {measurements.map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">{label}</p>
                  <p className="font-mono text-[17px] text-ink">{String(value)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-bg text-primary"><Ruler size={22} /></span>
              <p className="text-[14px] text-content-secondary">No measurements on file yet.</p>
            </div>
          )}
        </div>

        {/* Order History — endpoint pending */}
        <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
          <div className="border-b border-neutral-border px-6 py-4">
            <h3 className="text-[15px] font-medium text-ink">Order History</h3>
          </div>
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-bg text-primary"><ShoppingBag size={22} /></span>
            <p className="text-[14px] text-content-secondary">No orders yet.</p>
          </div>
        </div>

        {/* Payment History — endpoint pending */}
        <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
          <div className="border-b border-neutral-border px-6 py-4">
            <h3 className="text-[15px] font-medium text-ink">Payment History</h3>
          </div>
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-bg text-primary"><ReceiptText size={22} /></span>
            <p className="text-[14px] text-content-secondary">No payments recorded yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerProfilePage({ params }: { params: { id: string } }) {
  const { data, loading, error, refetch } = useApiQuery(() => customersApi.get(params.id), [params.id]);

  return (
    <AppShell title="Customer Details" backHref="/customers" actions={<Button variant="primary" size="md"><Plus size={17} /><span className="hidden sm:inline">New Entry</span></Button>}>
      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={!data}
        onRetry={refetch}
        loadingLabel="Loading customer…"
        empty={<EmptyState icon={Users} title="Customer not found" description="This customer may have been removed, or the profile isn't available yet." />}
      >
        {data && <Profile c={data} />}
      </QueryBoundary>
    </AppShell>
  );
}
