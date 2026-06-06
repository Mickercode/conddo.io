"use client";

import { useState } from "react";
import { BarChart3, Wallet, ShoppingCart, UserPlus, Receipt, Download, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { analyticsApi, type Overview } from "@/lib/api/analytics";
import { downloadCsv } from "@/lib/csv";

const RANGES = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
];

const CARDS: { key: keyof Overview; label: string; icon: LucideIcon; currency?: boolean }[] = [
  { key: "revenue", label: "Revenue", icon: Wallet, currency: true },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "newCustomers", label: "New customers", icon: UserPlus },
  { key: "avgOrderValue", label: "Avg order value", icon: Receipt, currency: true },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const { data, loading, error, refetch } = useApiQuery(() => analyticsApi.overview(range), [range]);

  return (
    <AppShell
      title="Analytics"
      subtitle="Insights and reports"
      actions={
        <Button
          variant="secondary"
          size="md"
          disabled={!data}
          onClick={() => {
            if (!data) return;
            const row = {
              range,
              revenue: data.revenue,
              orders: data.orders,
              newCustomers: data.newCustomers,
              avgOrderValue: data.avgOrderValue,
            };
            downloadCsv(`analytics-${range}`, [row], [
              { header: "Range", accessor: (r) => r.range },
              { header: "Revenue (NGN)", accessor: (r) => r.revenue },
              { header: "Orders", accessor: (r) => r.orders },
              { header: "New customers", accessor: (r) => r.newCustomers },
              { header: "Avg order value (NGN)", accessor: (r) => r.avgOrderValue },
            ]);
          }}
          className="hidden sm:inline-flex"
        >
          <Download size={16} /> Export CSV
        </Button>
      }
    >
      {/* Range selector */}
      <div className="mb-5 inline-flex rounded-lg border border-neutral-border bg-neutral-surface2 p-0.5">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors ${
              range === r.key ? "bg-neutral-surface text-primary" : "text-content-secondary hover:text-ink"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={!data}
        onRetry={refetch}
        loadingLabel="Crunching your numbers…"
        empty={
          <EmptyState
            icon={BarChart3}
            title="No analytics yet"
            description="Once you start taking orders and bookings, your revenue, order volume, and customer growth will show up here."
          />
        }
      >
        {data && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {CARDS.map(({ key, label, icon: Icon, currency }) => (
              <div key={key} className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
                <div className="mb-3 flex items-start justify-between">
                  <p className="text-[13px] text-content-secondary">{label}</p>
                  <Icon size={18} className="text-content-muted" />
                </div>
                <p className="font-mono text-[24px] font-medium leading-none text-ink">
                  {currency ? naira(data[key]) : data[key]}
                </p>
              </div>
            ))}
          </div>
        )}
      </QueryBoundary>
    </AppShell>
  );
}
