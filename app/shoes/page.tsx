"use client";

import { useState } from "react";
import { Plus, Search, Layers, Package, Edit, Trash2, Filter } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { fashionProductApi, type FashionProduct } from "@/lib/api/fashion";

// Shoe-specific attributes
const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];
const SHOE_COLORS = ["Black", "White", "Brown", "Tan", "Navy", "Red", "Blue", "Gray", "Beige"];
const SHOE_MATERIALS = ["Leather", "Suede", "Canvas", "Synthetic", "Textile", "Rubber"];
const SHOE_CATEGORIES = ["Sneakers", "Formal", "Casual", "Boots", "Sandals", "Loafers", "Athletic"];

export default function ShoesPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [materialFilter, setMaterialFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShoe, setEditingShoe] = useState<FashionProduct | null>(null);

  // Fetch shoes from API
  const { data: shoes = [], loading, error, refetch } = useApiQuery(
    () => fashionProductApi.list({
      search: search || undefined,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      material: materialFilter === "all" ? undefined : materialFilter,
    })
  );

  const totalStock = (shoes || []).reduce((sum: number, shoe: FashionProduct) => sum + shoe.totalStock, 0);
  const totalValue = (shoes || []).reduce((sum: number, shoe: FashionProduct) => sum + (shoe.totalStock * shoe.basePrice), 0);
  const lowStockCount = (shoes || []).filter((shoe: FashionProduct) => shoe.hasLowStock).length;

  return (
    <AppShell
      title="Shoe Catalog"
      subtitle="Manage your shoe inventory with size and color tracking"
      actions={
        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          <Plus size={17} />
          <span className="hidden sm:inline">Add shoe</span>
        </Button>
      }
    >
      {/* KPI Cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
          <p className="text-[12px] uppercase tracking-[0.05em] text-white/45">Total pairs in stock</p>
          <p className="mt-1 font-mono text-[22px] text-white">{totalStock}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
          <p className="text-[12px] uppercase tracking-[0.05em] text-white/45">Inventory value</p>
          <p className="mt-1 font-mono text-[22px] text-white">{naira(totalValue)}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
          <p className="text-[12px] uppercase tracking-[0.05em] text-white/45">Low stock items</p>
          <p className={`mt-1 font-mono text-[22px] ${lowStockCount > 0 ? "text-amber-300" : "text-white"}`}>
            {lowStockCount}
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
            placeholder="Search by name or SKU"
            className="w-full rounded-lg border border-white/[0.06] bg-cinema-elev py-2.5 pl-11 pr-4 text-[14px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-3">
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
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-cinema-elev px-3 py-2 text-[14px] text-white focus:border-primary-light focus:outline-none"
          >
            <option value="all">All Materials</option>
            {SHOE_MATERIALS.map((mat) => (
              <option key={mat} value={mat}>{mat}</option>
            ))}
          </select>
        </div>
      </div>

      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={!shoes || shoes.length === 0}
        onRetry={() => refetch()}
        loadingLabel="Loading shoes…"
        empty={
          <EmptyState
            icon={Package}
            title={search || categoryFilter !== "all" || materialFilter !== "all" ? "No matching shoes" : "No shoes in catalog yet"}
            description={
              search || categoryFilter !== "all" || materialFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "Add your first shoe to start tracking inventory by size and color."
            }
            action={
              !search && categoryFilter === "all" && materialFilter === "all" ? (
                <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
                  <Plus size={17} /> Add your first shoe
                </Button>
              ) : undefined
            }
          />
        }
      >
        <div className="space-y-4">
          {(shoes || []).map((shoe: FashionProduct) => (
            <div key={shoe.id} className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-white">{shoe.name}</h3>
                    <Chip tone={shoe.active ? "success" : "neutral"}>{shoe.active ? "active" : "inactive"}</Chip>
                  </div>
                  <p className="font-mono text-[12px] text-white/45">SKU: {shoe.sku || "N/A"}</p>
                  <div className="mt-2 flex items-center gap-3 text-[12px] text-white/65">
                    <span>{shoe.category}</span>
                    <span>·</span>
                    <span>{shoe.material}</span>
                    <span>·</span>
                    <span className="font-mono">{naira(shoe.basePrice)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingShoe(shoe)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/65 hover:bg-cinema-elev hover:text-white"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/65 hover:bg-red-500/10 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Size/Color Grid */}
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="mb-3 text-[12px] uppercase tracking-[0.05em] text-white/45">Stock by size & color</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {shoe.variants.map((variant) => (
                    <div
                      key={`${variant.size}-${variant.color}`}
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-cinema-elev px-3 py-2"
                    >
                      <div>
                        <p className="text-[13px] font-medium text-white">{variant.size}</p>
                        <p className="text-[11px] text-white/45">{variant.color}</p>
                      </div>
                      <span className={`font-mono text-[13px] ${variant.stock < 5 ? "text-amber-300" : "text-white"}`}>
                        {variant.stock}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </QueryBoundary>

      {/* Add/Edit Shoe Modal - Placeholder for now */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-white/[0.06] bg-cinema-elev p-6">
            <h3 className="mb-4 text-[16px] font-semibold text-white">
              {editingShoe ? "Edit shoe" : "Add new shoe"}
            </h3>
            <p className="text-[13px] text-white/65">
              Shoe creation modal coming soon. This will include name, SKU, category, material, base price, and size/color inventory setup.
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
