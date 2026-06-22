"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Package, User, Calendar, ChevronRight, Download } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { fashionOrderApi, type FashionOrder } from "@/lib/api/fashion";

// Fashion-specific order stages
const FASHION_STAGES = [
  { name: "Received", position: 1 },
  { name: "Processing", position: 2 },
  { name: "Production", position: 3 },
  { name: "Quality Check", position: 4 },
  { name: "Ready", position: 5 },
  { name: "Shipped", position: 6 },
  { name: "Delivered", position: 7 },
];

const stageColors: Record<string, string> = {
  Received: "bg-blue-500/20 text-blue-300",
  Processing: "bg-purple-500/20 text-purple-300",
  Production: "bg-amber-500/20 text-amber-300",
  "Quality Check": "bg-cyan-500/20 text-cyan-300",
  Ready: "bg-green-500/20 text-green-300",
  Shipped: "bg-indigo-500/20 text-indigo-300",
  Delivered: "bg-gray-500/20 text-gray-300",
};

export default function FashionOrdersPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch orders from API
  const { data: orders = [], loading, error, refetch } = useApiQuery(
    () => fashionOrderApi.list({
      search: search || undefined,
      stage: stageFilter === "all" ? undefined : stageFilter,
    })
  );

  // Group by stage for kanban-like view
  const stages = FASHION_STAGES.filter((s) => s.name !== "Delivered");
  const deliveredStage = FASHION_STAGES.find((s) => s.name === "Delivered");

  const ordersByStage = stages.map((stage) => ({
    ...stage,
    orders: (orders || []).filter((o: FashionOrder) => o.stage === stage.name),
  }));

  const deliveredOrders = (orders || []).filter((o: FashionOrder) => o.stage === "Delivered");

  return (
    <AppShell
      title="Fashion Orders"
      subtitle="Manage shoe orders with size and color tracking"
      actions={
        <>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              // Export functionality
              console.log("Export CSV");
            }}
            className="hidden sm:inline-flex"
          >
            <Download size={16} />
            Export CSV
          </Button>
          <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
            <Plus size={17} />
            <span className="hidden sm:inline">New Order</span>
          </Button>
        </>
      }
    >
      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-sm sm:flex-1">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/45" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search by customer or reference"
            className="w-full rounded-lg border border-white/[0.06] bg-cinema-elev py-2.5 pl-11 pr-4 text-[14px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-lg border border-white/[0.06] bg-cinema-elev px-3 py-2 text-[14px] text-white focus:border-primary-light focus:outline-none"
        >
          <option value="all">All Stages</option>
          {FASHION_STAGES.map((stage) => (
            <option key={stage.name} value={stage.name}>{stage.name}</option>
          ))}
        </select>
      </div>

      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={!orders || orders.length === 0}
        onRetry={() => refetch()}
        loadingLabel="Loading orders…"
        empty={
          <EmptyState
            icon={Package}
            title={search || stageFilter !== "all" ? "No matching orders" : "No fashion orders yet"}
            description={
              search || stageFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "Create your first fashion order to start tracking shoe orders with size and color details."
            }
            action={
              !search && stageFilter === "all" ? (
                <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
                  <Plus size={17} /> Create your first order
                </Button>
              ) : undefined
            }
          />
        }
      >
        {/* Kanban-style board */}
        <div className="-mx-4 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8">
          <div className="flex items-start gap-4">
            {ordersByStage.map((stage) => (
              <div
                key={stage.name}
                className="flex min-h-[460px] w-72 shrink-0 flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
              >
                <div className="mb-4 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[13px] font-bold text-white">{stage.name}</h2>
                    <span className="rounded bg-cinema-elev px-1.5 py-0.5 text-[10px] font-bold text-white/45">
                      {stage.orders.length}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {stage.orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            ))}

            {/* Delivered - collapsed */}
            {deliveredOrders.length > 0 && (
              <div className="flex min-h-[460px] w-12 shrink-0 cursor-pointer flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 transition-colors hover:bg-cinema-elev">
                <ChevronRight size={18} className="mb-4 text-white/45" />
                <div className="flex rotate-180 flex-col items-center gap-2 [writing-mode:vertical-lr]">
                  <h2 className="text-[13px] font-bold text-white">Delivered</h2>
                  <span className="rounded bg-cinema-elev px-1 py-1.5 text-[10px] font-bold text-white/45">
                    {deliveredOrders.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </QueryBoundary>

      {/* New Order Modal - Placeholder */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-white/[0.06] bg-cinema-elev p-6">
            <h3 className="mb-4 text-[16px] font-semibold text-white">New Fashion Order</h3>
            <p className="text-[13px] text-white/65">
              Fashion order creation modal coming soon. This will include customer selection, shoe product selection with size/color, quantity, and delivery details.
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

function OrderCard({ order }: { order: FashionOrder }) {
  const flagged = Boolean(order.flag);
  return (
    <Link
      href={`/orders/${order.id.toLowerCase()}`}
      className={`block rounded-[10px] border bg-cinema-elev p-4 transition-colors hover:border-primary-light ${
        flagged ? "border-white/[0.06] border-l-[3px] border-l-danger" : "border-white/[0.06]"
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        {order.flag ? (
          <span className="font-mono text-[11px] font-bold text-rose-200">{order.flag}</span>
        ) : (
          <span className="font-mono text-[11px] text-white/45">#{order.reference}</span>
        )}
        <span className="font-mono text-[13px] text-white">{naira(order.totalAmount)}</span>
      </div>
      <h3 className="mb-1 text-[14px] font-semibold text-white">{order.customerName}</h3>
      
      {/* Show items summary */}
      <div className="mb-3 space-y-1">
        {order.items.slice(0, 2).map((item, idx) => (
          <p key={idx} className="text-[12px] text-white/45">
            {item.quantity}x {item.shoeName} ({item.size}, {item.color})
          </p>
        ))}
        {order.items.length > 2 && (
          <p className="text-[11px] text-white/35">+{order.items.length - 2} more items</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Chip tone="neutral">{order.stage}</Chip>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.02] font-mono text-[10px] font-bold text-white/65">
          {order.customerName.split(" ").map((n: string) => n[0]).join("")}
        </span>
      </div>
    </Link>
  );
}
