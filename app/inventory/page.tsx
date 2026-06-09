"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Package, AlertTriangle, Pencil, ArrowUpDown, CalendarClock, Tag, Truck, History, ClipboardCheck } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ProductModal } from "@/components/app/ProductModal";
import { AdjustStockModal } from "@/components/app/AdjustStockModal";
import { PharmacyAdjustModal } from "@/components/app/PharmacyAdjustModal";
import { RestockModal } from "@/components/app/RestockModal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import {
  inventoryApi,
  stockStatus,
  expiryStatusOf,
  type Product,
  type StockStatus,
  type ExpiryStatus,
} from "@/lib/api/inventory";
import { meQuery } from "@/lib/api/account";
import { verticalOf } from "@/lib/verticalCopy";

const statusChip: Record<StockStatus, { tone: "success" | "warning" | "danger"; label: string }> = {
  in_stock: { tone: "success", label: "In stock" },
  low: { tone: "warning", label: "Low stock" },
  out: { tone: "danger", label: "Out of stock" },
};

const expiryChip: Record<ExpiryStatus, { tone: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  fresh: { tone: "success", label: "Fresh" },
  expiring_soon: { tone: "warning", label: "≤ 30 days" },
  expired: { tone: "danger", label: "Expired" },
  none: { tone: "neutral", label: "—" },
};

function fmtDate(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export default function InventoryPage() {
  const { data: me } = useApiQuery(meQuery);
  const isPharmacy = verticalOf(me) === "pharmacy";

  const [search, setSearch] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [expiringWithinDays, setExpiringWithinDays] = useState<number | null>(null);
  const [productOpen, setProductOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [restockOpen, setRestockOpen] = useState(false);

  const { data, loading, error, refetch } = useApiQuery(
    () => inventoryApi.list({
      search,
      lowStock: lowOnly,
      expiringWithinDays: expiringWithinDays ?? undefined,
    }),
    [search, lowOnly, expiringWithinDays],
  );
  const categoriesQ = useApiQuery(inventoryApi.categories);
  const products = data ?? [];
  const categories = categoriesQ.data ?? [];

  // Only surface the expiry column / filter for tenants that track expiry —
  // detected by ANY product carrying an expiryDate. Keeps fashion/retail
  // inventory clean while making pharmacy inventory expiry-aware.
  const tracksExpiry = products.some((p) => p.expiryDate);
  const expiringCount = products.filter((p) => {
    const s = expiryStatusOf(p);
    return s === "expiring_soon" || s === "expired";
  }).length;

  function openAdd() {
    setEditing(null);
    setProductOpen(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setProductOpen(true);
  }

  return (
    <AppShell
      title="Inventory"
      subtitle="Products and stock levels"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {isPharmacy && (
            <>
              <Link
                href="/inventory/movements"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-border bg-neutral-surface px-3 text-[13px] font-medium text-content-secondary transition-colors hover:border-primary hover:text-primary"
                title="Stock movement log"
              >
                <History size={15} />
                <span className="hidden lg:inline">Movements</span>
              </Link>
              <Link
                href="/inventory/reconciliation"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-border bg-neutral-surface px-3 text-[13px] font-medium text-content-secondary transition-colors hover:border-primary hover:text-primary"
                title="Run a stock reconciliation"
              >
                <ClipboardCheck size={15} />
                <span className="hidden lg:inline">Reconcile</span>
              </Link>
              <button
                type="button"
                onClick={() => setRestockOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary-bg px-3 text-[13px] font-medium text-primary transition-colors hover:bg-primary hover:text-white"
              >
                <Truck size={15} />
                <span className="hidden sm:inline">Restock</span>
              </button>
            </>
          )}
          <Link
            href="/inventory/categories"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-border bg-neutral-surface px-3 text-[13px] font-medium text-content-secondary transition-colors hover:border-primary hover:text-primary"
          >
            <Tag size={15} />
            <span className="hidden sm:inline">Categories</span>
          </Link>
          <Button variant="primary" size="md" onClick={openAdd}>
            <Plus size={17} />
            <span className="hidden sm:inline">Add Product</span>
          </Button>
        </div>
      }
    >
      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-sm sm:flex-1">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search products or SKUs"
            className="w-full rounded-lg border border-neutral-border bg-neutral-surface py-2.5 pl-11 pr-4 text-[14px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-[14px] text-content-secondary">
            <input
              type="checkbox"
              checked={lowOnly}
              onChange={(e) => setLowOnly(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-border text-primary focus:ring-primary"
            />
            Low stock only
          </label>
          {tracksExpiry && (
            <div className="inline-flex items-center gap-1 rounded-lg border border-neutral-border bg-neutral-surface p-0.5">
              {[
                { label: "All", v: null },
                { label: "≤ 30d", v: 30 },
                { label: "≤ 60d", v: 60 },
                { label: "≤ 90d", v: 90 },
              ].map((o) => {
                const active = expiringWithinDays === o.v;
                return (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => setExpiringWithinDays(o.v)}
                    className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
                      active ? "bg-warning-bg text-warning" : "text-content-secondary hover:text-ink"
                    }`}
                    aria-pressed={active}
                    title={o.v ? `Expiring within ${o.v} days` : "Any expiry"}
                  >
                    {o.label === "All" ? "Any expiry" : `Expiring ${o.label}`}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {tracksExpiry && expiringCount > 0 && expiringWithinDays === null && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning-bg px-4 py-3 text-[13px] text-warning">
          <CalendarClock size={16} />
          {expiringCount} {expiringCount === 1 ? "item is" : "items are"} expiring soon or already expired.{" "}
          <button
            type="button"
            onClick={() => setExpiringWithinDays(30)}
            className="font-medium underline hover:no-underline"
          >
            Show them
          </button>
        </div>
      )}

      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={products.length === 0}
        onRetry={refetch}
        loadingLabel="Loading inventory…"
        empty={
          <EmptyState
            icon={Package}
            title={search || lowOnly ? "No matching products" : "No products yet"}
            description={
              search || lowOnly
                ? "Try a different search or clear the low-stock filter."
                : "Add your products and services to track stock levels and get low-stock alerts."
            }
            action={
              !search && !lowOnly ? (
                <Button variant="primary" size="md" onClick={openAdd}>
                  <Plus size={17} /> Add your first product
                </Button>
              ) : undefined
            }
          />
        }
      >
        <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-neutral-border bg-neutral-surface2 text-[11px] uppercase tracking-[0.05em] text-content-secondary">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 text-right font-medium">Price</th>
                  <th className="px-5 py-3 text-right font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  {tracksExpiry && <th className="px-5 py-3 font-medium">Expires</th>}
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {products.map((p) => {
                  const status = stockStatus(p);
                  const exp = expiryStatusOf(p);
                  return (
                    <tr key={p.id} className="group transition-colors hover:bg-neutral-surface2">
                      <td className="px-5 py-3.5">
                        <p className="text-[14px] text-ink">{p.name}</p>
                        {p.sku && <p className="font-mono text-[12px] text-content-muted">{p.sku}</p>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[14px] text-content-secondary">{p.category ?? "—"}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-[13px] text-ink">{naira(p.price)}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <span className={`inline-flex items-center gap-1 font-mono text-[13px] ${status === "in_stock" ? "text-ink" : "text-warning"}`}>
                          {status !== "in_stock" && <AlertTriangle size={13} />}
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Chip tone={statusChip[status].tone}>{statusChip[status].label}</Chip>
                      </td>
                      {tracksExpiry && (
                        <td className="whitespace-nowrap px-5 py-3.5">
                          {p.expiryDate ? (
                            <div className="flex flex-col gap-1">
                              <span className={`font-mono text-[12px] ${exp === "expired" ? "text-danger" : exp === "expiring_soon" ? "text-warning" : "text-content-secondary"}`}>
                                {fmtDate(p.expiryDate)}
                              </span>
                              <Chip tone={expiryChip[exp].tone}>{expiryChip[exp].label}</Chip>
                            </div>
                          ) : (
                            <span className="text-[12px] text-content-muted">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => setAdjusting(p)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-content-secondary hover:bg-neutral-surface hover:text-ink"
                          >
                            <ArrowUpDown size={14} /> Adjust
                          </button>
                          <button
                            onClick={() => openEdit(p)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-primary hover:bg-primary-bg"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </QueryBoundary>

      <ProductModal
        open={productOpen}
        onClose={() => setProductOpen(false)}
        product={editing}
        categories={categories}
        onSaved={() => { refetch(); categoriesQ.refetch(); }}
      />
      {isPharmacy ? (
        <PharmacyAdjustModal
          open={adjusting !== null}
          onClose={() => setAdjusting(null)}
          product={adjusting}
          onAdjusted={() => refetch()}
        />
      ) : (
        <AdjustStockModal
          open={adjusting !== null}
          onClose={() => setAdjusting(null)}
          product={adjusting}
          onAdjusted={() => refetch()}
        />
      )}
      <RestockModal
        open={restockOpen}
        onClose={() => setRestockOpen(false)}
        onRestocked={() => refetch()}
      />
    </AppShell>
  );
}
