"use client";

import { useState } from "react";
import {
  BarChart3, Wallet, ShoppingCart, UserPlus, Receipt, Download, Trophy,
  Repeat, Eye, Target,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { Sparkline } from "@/components/ui/Sparkline";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { analyticsApi, type Overview, type SeriesPoint } from "@/lib/api/analytics";
import { downloadCsv } from "@/lib/csv";

const RANGES = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
];

const TOP_METRICS = [
  { key: "services", label: "Top services" },
  { key: "products", label: "Top products" },
  { key: "categories", label: "Top categories" },
];

const CARDS: { key: keyof Overview; label: string; icon: LucideIcon; currency?: boolean }[] = [
  { key: "revenue", label: "Revenue", icon: Wallet, currency: true },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "newCustomers", label: "New customers", icon: UserPlus },
  { key: "avgOrderValue", label: "Avg order value", icon: Receipt, currency: true },
];

function lastVal(series?: SeriesPoint[] | null): number {
  return series?.length ? series[series.length - 1].value : 0;
}

function fmtPct(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [topMetric, setTopMetric] = useState("services");

  const overviewQ = useApiQuery(() => analyticsApi.overview(range), [range]);
  const revenueQ = useApiQuery(() => analyticsApi.revenue(range), [range]);
  const ordersQ = useApiQuery(() => analyticsApi.orders(range), [range]);
  const customersQ = useApiQuery(() => analyticsApi.customers(range), [range]);
  const topQ = useApiQuery(() => analyticsApi.top(topMetric), [topMetric]);
  const trafficQ = useApiQuery(() => analyticsApi.traffic(range), [range]);

  const overview = overviewQ.data;
  const revenueValues = (revenueQ.data ?? []).map((p) => p.value);
  const orderValues = (ordersQ.data ?? []).map((p) => p.value);
  const cohort = customersQ.data;
  const topRows = topQ.data ?? [];
  const traffic = trafficQ.data;

  const customerTotal = (cohort?.newCustomers ?? 0) + (cohort?.returningCustomers ?? 0);
  const returningPct = customerTotal > 0
    ? (cohort?.returningCustomers ?? 0) / customerTotal
    : 0;

  return (
    <AppShell
      title="Analytics"
      subtitle="Insights and reports"
      actions={
        <Button
          variant="secondary"
          size="md"
          disabled={!overview}
          onClick={() => {
            if (!overview) return;
            const row = {
              range,
              revenue: overview.revenue,
              orders: overview.orders,
              newCustomers: overview.newCustomers,
              avgOrderValue: overview.avgOrderValue,
              returningCustomers: cohort?.returningCustomers ?? 0,
              visits: traffic?.visits ?? 0,
              enquiries: traffic?.enquiries ?? 0,
              conversionRate: traffic?.conversionRate ?? 0,
            };
            downloadCsv(`analytics-${range}`, [row], [
              { header: "Range", accessor: (r) => r.range },
              { header: "Revenue (NGN)", accessor: (r) => r.revenue },
              { header: "Orders", accessor: (r) => r.orders },
              { header: "New customers", accessor: (r) => r.newCustomers },
              { header: "Returning customers", accessor: (r) => r.returningCustomers },
              { header: "Avg order value (NGN)", accessor: (r) => r.avgOrderValue },
              { header: "Visits", accessor: (r) => r.visits },
              { header: "Enquiries", accessor: (r) => r.enquiries },
              { header: "Conversion rate", accessor: (r) => r.conversionRate },
            ]);
          }}
          className="hidden sm:inline-flex"
        >
          <Download size={16} /> Export CSV
        </Button>
      }
    >
      {/* Range selector */}
      <div className="mb-5 inline-flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors ${
              range === r.key ? "bg-cinema-elev text-primary" : "text-white/65 hover:text-white"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <QueryBoundary
        loading={overviewQ.loading}
        error={overviewQ.error}
        isEmpty={!overview}
        onRetry={overviewQ.refetch}
        loadingLabel="Crunching your numbers…"
        empty={
          <EmptyState
            icon={BarChart3}
            title="No analytics yet"
            description="Once you start taking orders and bookings, your revenue, order volume, and customer growth will show up here."
          />
        }
      >
        {overview && (
          <div className="space-y-6">
            {/* Headline KPIs */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {CARDS.map(({ key, label, icon: Icon, currency }) => (
                <div key={key} className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <p className="text-[13px] text-white/65">{label}</p>
                    <Icon size={18} className="text-white/45" />
                  </div>
                  <p className="font-mono text-[24px] font-medium leading-none text-white">
                    {currency ? naira(overview[key]) : overview[key]}
                  </p>
                </div>
              ))}
            </div>

            {/* Revenue + Orders series */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.05em] text-white/45">Revenue trend</p>
                    <p className="mt-1 font-mono text-[20px] font-medium leading-none text-white">
                      {revenueQ.loading ? "…" : naira(lastVal(revenueQ.data))}
                    </p>
                  </div>
                  <Wallet size={18} className="text-white/45" />
                </div>
                <Sparkline
                  values={revenueValues}
                  width={300}
                  height={56}
                  className="w-full text-primary"
                />
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.05em] text-white/45">Orders trend</p>
                    <p className="mt-1 font-mono text-[20px] font-medium leading-none text-white">
                      {ordersQ.loading ? "…" : lastVal(ordersQ.data)}
                    </p>
                  </div>
                  <ShoppingCart size={18} className="text-white/45" />
                </div>
                <Sparkline
                  values={orderValues}
                  width={300}
                  height={56}
                  className="w-full text-emerald-300"
                />
              </div>
            </div>

            {/* Customer cohort + Traffic */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5 lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.05em] text-white/45">Customer mix</p>
                  <UserPlus size={18} className="text-white/45" />
                </div>
                {customersQ.loading ? (
                  <p className="text-[13px] text-white/45">Loading…</p>
                ) : (
                  <>
                    <div className="mb-4 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[11px] text-white/45">New</p>
                        <p className="mt-1 font-mono text-[20px] font-medium text-emerald-300">
                          {cohort?.newCustomers ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-white/45">Returning</p>
                        <p className="mt-1 font-mono text-[20px] font-medium text-primary">
                          {cohort?.returningCustomers ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-white/45">Returning rate</p>
                        <p className="mt-1 font-mono text-[20px] font-medium text-white">
                          {fmtPct(returningPct, 0)}
                        </p>
                      </div>
                    </div>
                    {/* Returning rate bar */}
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.02]">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(100, returningPct * 100).toFixed(1)}%` }}
                      />
                    </div>
                    <Sparkline
                      values={(cohort?.series ?? []).map((p) => p.value)}
                      width={300}
                      height={48}
                      className="mt-4 w-full text-primary"
                    />
                  </>
                )}
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.05em] text-white/45">Traffic</p>
                  <Eye size={18} className="text-white/45" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-white/65">
                      <Eye size={13} /> Visits
                    </span>
                    <span className="font-mono text-[14px] text-white">
                      {trafficQ.loading ? "…" : traffic?.visits ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-white/65">
                      <Repeat size={13} /> Enquiries
                    </span>
                    <span className="font-mono text-[14px] text-white">
                      {trafficQ.loading ? "…" : traffic?.enquiries ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-white/65">
                      <Target size={13} /> Conversion
                    </span>
                    <span className="font-mono text-[14px] text-primary">
                      {trafficQ.loading ? "…" : fmtPct(traffic?.conversionRate ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top-N leaderboard */}
            <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-6 py-4">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-amber-300" />
                  <h2 className="text-[15px] font-medium text-white">
                    {TOP_METRICS.find((m) => m.key === topMetric)?.label ?? "Top"}
                  </h2>
                </div>
                <div className="inline-flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
                  {TOP_METRICS.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setTopMetric(m.key)}
                      className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
                        topMetric === m.key ? "bg-cinema-elev text-primary" : "text-white/65 hover:text-white"
                      }`}
                    >
                      {m.label.replace("Top ", "")}
                    </button>
                  ))}
                </div>
              </div>
              {topQ.loading ? (
                <p className="px-6 py-8 text-center text-[13px] text-white/45">Loading…</p>
              ) : topRows.length === 0 ? (
                <p className="px-6 py-8 text-center text-[13px] text-white/45">
                  Nothing in this leaderboard yet for the selected range.
                </p>
              ) : (
                <ul className="divide-y divide-white/[0.06]">
                  {topRows.slice(0, 10).map((row, i) => {
                    const max = Math.max(...topRows.map((r) => r.value), 1);
                    const pct = (row.value / max) * 100;
                    return (
                      <li key={`${row.label}-${i}`} className="px-6 py-3">
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 text-[13px] text-white">
                            <Chip tone={i === 0 ? "warning" : "neutral"}>#{i + 1}</Chip>
                            <span className="truncate">{row.label}</span>
                          </span>
                          <span className="shrink-0 font-mono text-[12px] text-white/65">
                            {row.value}
                          </span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.02]">
                          <div className="h-full bg-primary/60" style={{ width: `${pct.toFixed(1)}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </QueryBoundary>
    </AppShell>
  );
}
