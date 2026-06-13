"use client";

import { useState } from "react";
import { Plus, Search, Layers, AlertTriangle, Pencil, ArrowUpDown } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { NewFabricModal } from "@/components/app/NewFabricModal";
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
  low: { tone: "warning", label: "Low" },
  out: { tone: "danger", label: "Out" },
};

// Fashion-specific quantity formatter — same number, but in yards instead of
// the bare integer the generic inventory page uses. "12 yds" / "0.5 yd".
function yards(n: number): string {
  return `${n} ${n === 1 ? "yd" : "yds"}`;
}

/** Fashion-specific inventory view. Hits the generic /inventory/products
 *  endpoint but rebrands fields ("stock" → "yards in stock", "price" →
 *  "₦/yd") and surfaces a "total value tied up in fabric" KPI so the owner
 *  can size their cash exposure at a glance. */
export default function FabricPage() {
  const [search, setSearch] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adjusting, setAdjusting] = useState<Product | null>(null);

  const { data, loading, error, refetch } = useApiQuery(
    () => inventoryApi.list({ search, lowStock: lowOnly, size: 100 }),
    [search, lowOnly],
  );
  const fabrics = data ?? [];

  const totalYards = fabrics.reduce((n, p) => n + (p.stock || 0), 0);
  const totalValue = fabrics.reduce((n, p) => n + (p.stock || 0) * (p.price || 0), 0);
  const lowCount = fabrics.filter((p) => stockStatus(p) !== "in_stock").length;

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setModalOpen(true);
  }

  return (
    <AppShell
      title="Fabric"
      subtitle="Track yards in stock so you never run out mid-job"
      actions={
        <Button variant="primary" size="md" onClick={openAdd}>
          <Plus size={17} />
          <span className="hidden sm:inline">Add fabric</span>
        </Button>
      }
    >
      {/* KPIs — only render when we have data so the cards don't flash zeros
          during the initial load. */}
      {fabrics.length > 0 && !loading && (
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
            <p className="text-[12px] uppercase tracking-[0.05em] text-white/45">Total yards in stock</p>
            <p className="mt-1 font-mono text-[22px] text-white">{yards(totalYards)}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
            <p className="text-[12px] uppercase tracking-[0.05em] text-white/45">Value tied up</p>
            <p className="mt-1 font-mono text-[22px] text-white">{naira(totalValue)}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
            <p className="text-[12px] uppercase tracking-[0.05em] text-white/45">Needs reordering</p>
            <p className={`mt-1 font-mono text-[22px] ${lowCount > 0 ? "text-amber-300" : "text-white"}`}>
              {lowCount} {lowCount === 1 ? "fabric" : "fabrics"}
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-sm sm:flex-1">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/45" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search by name or supplier ref"
            className="w-full rounded-lg border border-white/[0.06] bg-cinema-elev py-2.5 pl-11 pr-4 text-[14px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-[14px] text-white/65">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
            className="h-4 w-4 rounded border-white/[0.06] text-primary focus:ring-primary"
          />
          Needs reordering only
        </label>
      </div>

      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={fabrics.length === 0}
        onRetry={refetch}
        loadingLabel="Loading fabric…"
        empty={
          <EmptyState
            icon={Layers}
            title={search || lowOnly ? "No matching fabric" : "No fabric tracked yet"}
            description={
              search || lowOnly
                ? "Try a different search or clear the reorder filter."
                : "Add the fabrics you keep in stock. We'll warn you when a roll is running low so you can reorder before your next job."
            }
            action={
              !search && !lowOnly ? (
                <Button variant="primary" size="md" onClick={openAdd}>
                  <Plus size={17} /> Add your first fabric
                </Button>
              ) : undefined
            }
          />
        }
      >
        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] uppercase tracking-[0.05em] text-white/65">
                  <th className="px-5 py-3 font-medium">Fabric</th>
                  <th className="px-5 py-3 text-right font-medium">Yards in stock</th>
                  <th className="px-5 py-3 text-right font-medium">Price / yd</th>
                  <th className="px-5 py-3 text-right font-medium">Value</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {fabrics.map((p) => {
                  const status = stockStatus(p);
                  const value = (p.stock || 0) * (p.price || 0);
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5">
                        <p className="text-[14px] text-white">{p.name}</p>
                        {p.sku && <p className="font-mono text-[12px] text-white/45">{p.sku}</p>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <span className={`inline-flex items-center gap-1 font-mono text-[13px] ${status === "in_stock" ? "text-white" : "text-amber-300"}`}>
                          {status !== "in_stock" && <AlertTriangle size={13} />}
                          {yards(p.stock)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-[13px] text-white">{naira(p.price)}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-[13px] text-white/65">{naira(value)}</td>
                      <td className="px-5 py-3.5">
                        <Chip tone={statusChip[status].tone}>{statusChip[status].label}</Chip>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setAdjusting(p)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-white/65 hover:bg-cinema-elev hover:text-white"
                          >
                            <ArrowUpDown size={14} /> Adjust
                          </button>
                          <button
                            onClick={() => openEdit(p)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-primary hover:bg-primary/[0.08]"
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

      <NewFabricModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fabric={editing}
        onSaved={() => refetch()}
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
