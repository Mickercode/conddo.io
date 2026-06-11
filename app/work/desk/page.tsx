"use client";

import Link from "next/link";
import {
  Wallet, ShoppingCart, BarChart3, ArrowRight, Download, ReceiptText,
} from "lucide-react";
import { WorkShell, type WorkNavItem } from "@/components/app/WorkShell";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { analyticsApi } from "@/lib/api/analytics";
import { naira } from "@/lib/format";

const NAV: WorkNavItem[] = [
  { label: "Orders",    href: "/orders",    icon: ShoppingCart },
  { label: "Payments",  href: "/payments",  icon: Wallet },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

/** Bookkeeper landing — read-only summary. Surfaces the last 30-day
 *  overview so they don't have to navigate to see the headline numbers. */
export default function DeskLanding() {
  const { data: me } = useApiQuery(meQuery);
  const overviewQ = useApiQuery(() => analyticsApi.overview("30d"));
  const overview = overviewQ.data;

  const firstName = me?.user.fullName?.trim().split(/\s+/)[0] ?? "";
  const greet = firstName ? `Hi, ${firstName}.` : "Hi there.";

  return (
    <WorkShell title={greet} subtitle="Bookkeeper dashboard" nav={NAV}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile label="Revenue (30d)" value={overview ? naira(overview.revenue) : "—"} />
          <KpiTile label="Orders (30d)" value={overview ? String(overview.orders) : "—"} />
          <KpiTile label="New customers" value={overview ? String(overview.newCustomers) : "—"} />
          <KpiTile label="Avg order value" value={overview ? naira(overview.avgOrderValue) : "—"} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <QuickLink
            href="/orders"
            icon={ShoppingCart}
            title="Orders"
            description="Browse all orders. Export filtered CSVs."
          />
          <QuickLink
            href="/payments"
            icon={Wallet}
            title="Payments"
            description="Transactions, outstanding balances, daily settlement."
          />
          <QuickLink
            href="/analytics"
            icon={BarChart3}
            title="Analytics"
            description="Trends, leaderboards, customer mix, traffic."
          />
        </div>

        <p className="flex items-center gap-2 rounded-md bg-neutral-surface2 px-4 py-3 text-[12px] text-content-muted">
          <Download size={12} />
          Every list page has an Export CSV button — ready for QuickBooks, Xero, Sage, anything that swallows CSV.
        </p>
      </div>
    </WorkShell>
  );
}

function KpiTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
      <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">{label}</p>
      <p className="mt-1 font-mono text-[22px] font-medium leading-none text-ink">{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-neutral-border bg-neutral-surface p-5 transition-colors hover:border-primary hover:bg-primary-bg/30"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-bg text-primary">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-[13px] text-content-secondary">{description}</p>
      </div>
      <ArrowRight size={16} className="mt-1 shrink-0 text-content-muted transition-colors group-hover:text-primary" />
    </Link>
  );
}
