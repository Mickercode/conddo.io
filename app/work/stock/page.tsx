"use client";

import Link from "next/link";
import {
  Package, Truck, History, ClipboardCheck, Upload, AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { WorkShell, type WorkNavItem } from "@/components/app/WorkShell";
import { Chip } from "@/components/ui/Chip";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { inventoryApi } from "@/lib/api/inventory";

const NAV: WorkNavItem[] = [
  { label: "Inventory",     href: "/inventory",                icon: Package },
  { label: "Movements",     href: "/inventory/movements",      icon: History },
  { label: "Reconcile",     href: "/inventory/reconciliation", icon: ClipboardCheck },
];

/** Stock Manager landing — pulls the low-stock + expiring counts so they
 *  can see what needs attention before they even click into Inventory. */
export default function StockLanding() {
  const { data: me } = useApiQuery(meQuery);
  const lowStockQ = useApiQuery(inventoryApi.lowStock);
  const lowStock = lowStockQ.data ?? [];

  const firstName = me?.user.fullName?.trim().split(/\s+/)[0] ?? "";
  const greet = firstName ? `Hi, ${firstName}.` : "Hi there.";

  return (
    <WorkShell title={greet} subtitle="Stock Manager dashboard" nav={NAV}>
      <div className="space-y-6">
        {/* Headline alert */}
        {lowStock.length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning-bg/40 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
              <AlertTriangle size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-medium text-ink">
                {lowStock.length} product{lowStock.length === 1 ? "" : "s"} below reorder threshold
              </p>
              <p className="mt-1 text-[13px] text-content-secondary">
                Receive a restock or update reorder thresholds to silence these alerts.
              </p>
              <ul className="mt-3 space-y-1">
                {lowStock.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-[12px]">
                    <span className="truncate text-ink">{p.name}</span>
                    <Chip tone={p.stock <= 0 ? "danger" : "warning"}>
                      stock {p.stock} / reorder {p.reorderThreshold}
                    </Chip>
                  </li>
                ))}
                {lowStock.length > 5 && (
                  <li className="text-[11px] text-content-muted">+ {lowStock.length - 5} more</li>
                )}
              </ul>
              <Link
                href="/inventory"
                className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-warning hover:underline"
              >
                Open inventory <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <QuickLink
            href="/inventory"
            icon={Package}
            title="Inventory"
            description="Search, edit, add new SKUs."
          />
          <QuickLink
            href="/inventory"
            icon={Truck}
            title="Record restock"
            description="Receive a delivery into stock — multi-line, audit-logged."
            params="restock"
          />
          <QuickLink
            href="/inventory"
            icon={Upload}
            title="Bulk upload"
            description="Drop a CSV to update stock for many SKUs at once."
            params="bulk"
          />
          <QuickLink
            href="/inventory/reconciliation"
            icon={ClipboardCheck}
            title="Run reconciliation"
            description="Physical count vs. system count, variance preview, complete."
          />
        </div>

        <Link
          href="/inventory/movements"
          className="block rounded-xl border border-neutral-border bg-neutral-surface p-4 text-[13px] text-content-secondary hover:border-primary hover:text-primary"
        >
          <span className="inline-flex items-center gap-2 font-medium">
            <History size={14} /> Movement log
          </span>
          <span className="ml-2">— every restock, sale, adjustment, reconciliation in one timeline.</span>
        </Link>
      </div>
    </WorkShell>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  description,
  params,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  params?: string;
}) {
  // params are pass-through hints for child pages that auto-open a modal on
  // mount — Inventory listens for ?action=restock and ?action=bulk.
  const target = params ? `${href}?action=${params}` : href;
  return (
    <Link
      href={target}
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
