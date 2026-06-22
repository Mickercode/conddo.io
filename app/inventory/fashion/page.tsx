"use client";

import { useState } from "react";
import { Plus, Search, Layers, AlertTriangle, ArrowUpDown, Package, Filter } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { fashionProductApi, type FashionProduct } from "@/lib/api/fashion";

// Fashion-specific inventory attributes
const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];
const SHOE_COLORS = ["Black", "White", "Brown", "Tan", "Navy", "Red", "Blue", "Gray", "Beige"];
const SHOE_CATEGORIES = ["Sneakers", "Formal", "Casual", "Boots", "Sandals", "Loafers", "Athletic"];

interface FashionInventoryItem {
  id: string;
  shoeId: string;
  shoeName: string;
  sku: string;
  size: string;
  color: string;
  category: string;
  stock: number;
  reorderLevel: number;
  unitPrice: number;
  totalValue: number;
  lastRestocked: string;
  status: "in_stock" | "low" | "out";
}

const statusConfig = {
  in_stock: { tone: "success" as const, label: "In stock" },
  low: { tone: "warning" as const, label: "Low stock" },
  out: { tone: "danger" as const, label: "Out of stock" },
};

export default function FashionInventoryPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [colorFilter, setColorFilter] = useState<string>("all");
  const [lowOnly, setLowOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch products from API
  const { data: products = [], loading, error, refetch } = useApiQuery(
    () => fashionProductApi.list({
      search: search || undefined,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      lowStockOnly: lowOnly || undefined,
    })
  );

  // Transform products into inventory items
  const inventoryItems: FashionInventoryItem[] = (products || []).flatMap((product: FashionProduct) =>
    product.variants.map((variant, idx) => ({
      id: `${product.id}-${variant.size}-${variant.color}`,
      shoeId: product.id,
      shoeName: product.name,
      sku: product.sku || `${product.name}-${variant.size}-${variant.color}`,
      size: variant.size,
      color: variant.color,
      category: product.category,
      stock: variant.stock,
      reorderLevel: 5,
      unitPrice: product.basePrice,
      totalValue: variant.stock * product.basePrice,
      lastRestocked: new Date().toISOString().split('T')[0],
      status: variant.stock === 0 ? "out" : variant.stock < 5 ? "low" : "in_stock" as const,
    }))
  );

  // Filter inventory items
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSize = sizeFilter === "all" || item.size === sizeFilter;
    const matchesColor = colorFilter === "all" || item.color === colorFilter;
    return matchesSize && matchesColor;
  });

  const totalPairs = filteredItems.reduce((sum: number, item: FashionInventoryItem) => sum + item.stock, 0);
  const totalValue = filteredItems.reduce((sum: number, item: FashionInventoryItem) => sum + item.totalValue, 0);
  const lowStockCount = filteredItems.filter((item: FashionInventoryItem) => item.status === "low" || item.status === "out").length;

  return (
    <AppShell
      title="Fashion Inventory"
      subtitle="Track shoe inventory by size and color"
      actions={
        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          <Plus size={17} />
          <span className="hidden sm:inline">Add inventory</span>
        </Button>
      }
    >
      {/* KPI Cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
          <p className="text-[12px] uppercase tracking-[0.05em] text-white/45">Total pairs in stock</p>
          <p className="mt-1 font-mono text-[22px] text-white">{totalPairs}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
          <p className="text-[12px] uppercase tracking-[0.05em] text-white/45">Inventory value</p>
          <p className="mt-1 font-mono text-[22px] text-white">{naira(totalValue)}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
          <p className="text-[12px] uppercase tracking-[0.05em] text-white/45">Needs reordering</p>
          <p className={`mt-1 font-mono text-[22px] ${lowStockCount > 0 ? "text-amber-300" : "text-white"}`}>
            {lowStockCount} {lowStockCount === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-sm sm:flex-1">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/45" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search by shoe name or SKU"
            className="w-full rounded-lg border border-white/[0.06] bg-cinema-elev py-2.5 pl-11 pr-4 text-[14px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-cinema-elev px-3 py-2 text-[14px] text-white focus:border-primary-light focus:outline-none"
          >
            <option value="all">All Categories</option>
            {SHOE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-cinema-elev px-3 py-2 text-[14px] text-white focus:border-primary-light focus:outline-none"
          >
            <option value="all">All Sizes</option>
            {SHOE_SIZES.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <select
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-cinema-elev px-3 py-2 text-[14px] text-white focus:border-primary-light focus:outline-none"
          >
            <option value="all">All Colors</option>
            {SHOE_COLORS.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
          <label className="inline-flex cursor-pointer items-center gap-2 text-[14px] text-white/65">
            <input
              type="checkbox"
              checked={lowOnly}
              onChange={(e) => setLowOnly(e.target.checked)}
              className="h-4 w-4 rounded border-white/[0.06] text-primary focus:ring-primary"
            />
            Low stock only
          </label>
        </div>
      </div>

      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={!products || products.length === 0}
        onRetry={() => refetch()}
        loadingLabel="Loading inventory…"
        empty={
          <EmptyState
            icon={Package}
            title={search || categoryFilter !== "all" || sizeFilter !== "all" || colorFilter !== "all" || lowOnly ? "No matching inventory" : "No inventory tracked yet"}
            description={
              search || categoryFilter !== "all" || sizeFilter !== "all" || colorFilter !== "all" || lowOnly
                ? "Try adjusting your filters or search terms."
                : "Add your first inventory item to start tracking shoe stock by size and color."
            }
            action={
              !search && categoryFilter === "all" && sizeFilter === "all" && colorFilter === "all" && !lowOnly ? (
                <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
                  <Plus size={17} /> Add your first item
                </Button>
              ) : undefined
            }
          />
        }
      >
        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] uppercase tracking-[0.05em] text-white/65">
                  <th className="px-5 py-3 font-medium">Shoe</th>
                  <th className="px-5 py-3 font-medium">Size</th>
                  <th className="px-5 py-3 font-medium">Color</th>
                  <th className="px-5 py-3 text-right font-medium">Stock</th>
                  <th className="px-5 py-3 text-right font-medium">Reorder Level</th>
                  <th className="px-5 py-3 text-right font-medium">Unit Price</th>
                  <th className="px-5 py-3 text-right font-medium">Total Value</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredItems.map((item) => {
                  const config = statusConfig[item.status];
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5">
                        <p className="text-[14px] text-white">{item.shoeName}</p>
                        <p className="font-mono text-[12px] text-white/45">{item.sku}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[13px] text-white">{item.size}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-white">{item.color}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <span className={`inline-flex items-center gap-1 font-mono text-[13px] ${item.status === "in_stock" ? "text-white" : "text-amber-300"}`}>
                          {item.status !== "in_stock" && <AlertTriangle size={13} />}
                          {item.stock}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-[13px] text-white/65">{item.reorderLevel}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-[13px] text-white">{naira(item.unitPrice)}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-[13px] text-white/65">{naira(item.totalValue)}</td>
                      <td className="px-5 py-3.5">
                        <Chip tone={config.tone}>{config.label}</Chip>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-white/65 hover:bg-cinema-elev hover:text-white"
                          >
                            <ArrowUpDown size={14} /> Adjust
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

      {/* Add Inventory Modal - Placeholder */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-white/[0.06] bg-cinema-elev p-6">
            <h3 className="mb-4 text-[16px] font-semibold text-white">Add Inventory Item</h3>
            <p className="text-[13px] text-white/65">
              Inventory item creation modal coming soon. This will include shoe selection, size, color, stock quantity, and reorder level.
            </p>
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" size="md" onClick={() => setModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
