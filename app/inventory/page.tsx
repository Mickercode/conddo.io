"use client";

import { useState } from "react";
import { Plus, Search, Package, AlertTriangle, Pencil, ArrowUpDown } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ProductModal } from "@/components/app/ProductModal";
import { AdjustStockModal } from "@/components/app/AdjustStockModal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { inventoryApi, stockStatus, type Product, type StockStatus } from "@/lib/api/inventory";

const statusChip: Record<StockStatus, { tone: "success" | "warning" | "danger"; label: string }> = {
  in_stock: { tone: "success", label: "In stock" },
  low: { tone: "warning", label: "Low stock" },
  out: { tone: "danger", label: "Out of stock" },
};

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adjusting, setAdjusting] = useState<Product | null>(null);

  const { data, loading, error, refetch } = useApiQuery(
    () => inventoryApi.list({ search, lowStock: lowOnly }),
    [search, lowOnly],
  );
  const categoriesQ = useApiQuery(inventoryApi.categories);
  const products = data ?? [];
  const categories = categoriesQ.data ?? [];

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
        <Button variant="primary" size="md" onClick={openAdd}>
          <Plus size={17} />
          <span className="hidden sm:inline">Add Product</span>
        </Button>
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
        <label className="inline-flex cursor-pointer items-center gap-2 text-[14px] text-content-secondary">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-border text-primary focus:ring-primary"
          />
          Low stock only
        </label>
      </div>

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
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {products.map((p) => {
                  const status = stockStatus(p);
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
      <AdjustStockModal
        open={adjusting !== null}
        onClose={() => setAdjusting(null)}
        product={adjusting}
        onAdjusted={() => refetch()}
      />
    </AppShell>
  );
}
