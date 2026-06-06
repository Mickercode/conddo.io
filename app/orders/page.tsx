"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  CalendarDays,
  CalendarX,
  Clock,
  ChevronRight,
  ShoppingCart,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { NewOrderModal } from "@/components/app/NewOrderModal";
import { AddStageButton, StageActionsMenu } from "@/components/app/StageManager";
import { Button } from "@/components/ui/Button";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { ordersApi, type Order, type Stage } from "@/lib/api/orders";
import { downloadCsv } from "@/lib/csv";

const FILTERS = ["All", "Today", "This week", "Overdue"];

function OrderCard({ card }: { card: Order }) {
  const flagged = Boolean(card.flag);
  return (
    <Link
      href={`/orders/${card.id.toLowerCase()}`}
      className={`block rounded-[10px] border bg-neutral-surface p-4 transition-colors hover:border-primary-light ${
        flagged ? "border-neutral-border border-l-[3px] border-l-danger" : "border-neutral-border"
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        {card.flag ? (
          <span className="font-mono text-[11px] font-bold text-danger">{card.flag}</span>
        ) : (
          <span className="font-mono text-[11px] text-content-muted">#{card.reference ?? card.id}</span>
        )}
        <span className="font-mono text-[13px] text-ink">{naira(card.amount)}</span>
      </div>
      <h3 className="mb-1 text-[14px] font-semibold text-ink">{card.customer}</h3>
      <p className="mb-4 text-[12px] text-content-muted">{card.service}</p>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 ${flagged ? "text-danger" : "text-content-muted"}`}>
          {card.flag === "OVERDUE" ? <CalendarX size={14} /> : card.flag === "URGENT" ? <Clock size={14} /> : <CalendarDays size={14} />}
          <span className={`text-[11px] ${flagged ? "font-medium" : ""}`}>{card.date}</span>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-surface2 font-mono text-[10px] font-bold text-content-secondary">
          {card.initials}
        </span>
      </div>
    </Link>
  );
}

// Local client-side filter — runs over the board we already have rather than
// re-fetching per keystroke. Backend dates come as ISO 8601 (OffsetDateTime).
function matchesFilter(card: Order, filter: string, search: string): boolean {
  if (search) {
    const hay = `${card.customer ?? ""} ${card.reference ?? ""} ${card.service ?? ""}`.toLowerCase();
    if (!hay.includes(search)) return false;
  }
  if (filter === "Overdue") return card.flag === "OVERDUE";
  if (filter === "Today") {
    if (!card.date) return false;
    const d = new Date(card.date);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }
  if (filter === "This week") {
    if (!card.date) return false;
    const d = new Date(card.date);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    return d >= monday && d < nextMonday;
  }
  return true; // "All"
}

export default function OrdersPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const { data, loading, error, refetch } = useApiQuery(ordersApi.board);
  // The board is grouped by stage name; the stages endpoint returns the
  // ids + positions we need for the 3-dot menu's rename / move / delete.
  // Refetched alongside the board on every mutation.
  const stagesQuery = useApiQuery(ordersApi.stages);

  const rawStages = data?.stages ?? [];
  const trimmedSearch = search.trim().toLowerCase();
  const filtering = activeFilter !== "All" || trimmedSearch.length > 0;
  // Re-shape stages with filtered orders + recomputed counts so the column
  // badge reflects what the user actually sees, not the unfiltered total.
  const stages = filtering
    ? rawStages.map((s) => {
        const orders = s.orders.filter((o) => matchesFilter(o, activeFilter, trimmedSearch));
        return { ...s, orders, count: orders.length };
      })
    : rawStages;
  const columns = stages.filter((s) => s.name !== "Delivered");
  const delivered = stages.find((s) => s.name === "Delivered");
  const totalMatches = columns.reduce((n, s) => n + s.count, 0) + (delivered?.count ?? 0);

  const stageList: Stage[] = stagesQuery.data ?? [];
  const stageByName = new Map(stageList.map((s) => [s.name, s]));

  // Reload board + stages together — any mutation (add/rename/move/delete)
  // affects both responses.
  const reloadAll = () => { refetch(); stagesQuery.refetch(); };

  return (
    <AppShell
      title="Orders"
      actions={
        <>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              // Flatten the kanban (all stages, including Delivered) into one
              // row per order — exporting the full pipeline snapshot.
              const allOrders = stages.flatMap((s) =>
                s.orders.map((o) => ({ ...o, stage: s.name })),
              );
              downloadCsv("orders", allOrders, [
                { header: "Reference", accessor: (o) => o.reference ?? o.id },
                { header: "Customer", accessor: (o) => o.customer ?? "" },
                { header: "Service", accessor: (o) => o.service ?? "" },
                { header: "Stage", accessor: (o) => o.stage ?? "" },
                { header: "Amount (NGN)", accessor: (o) => o.amount },
                { header: "Date", accessor: (o) => o.date ?? "" },
                { header: "Flag", accessor: (o) => o.flag ?? "" },
              ]);
            }}
            disabled={stages.length === 0}
            className="hidden sm:inline-flex"
          >
            <Download size={16} />
            Export CSV
          </Button>
          <Button variant="primary" size="md" onClick={() => setNewOpen(true)}>
            <Plus size={17} />
            <span className="hidden sm:inline">New Order</span>
          </Button>
        </>
      }
    >
      {/* Toolbar: segmented filter + search */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg border border-neutral-border bg-neutral-surface2 p-0.5">
          {FILTERS.map((f) => {
            const active = f === activeFilter;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  active ? "bg-neutral-surface text-primary" : "text-content-secondary hover:text-ink"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
        <div className="relative sm:w-64">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, ref, service…"
            className="w-full rounded-lg border border-neutral-border bg-neutral-surface py-2 pl-10 pr-4 text-[14px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {filtering && !loading && !error && (
        <p className="mb-3 text-[12px] text-content-muted">
          {totalMatches === 0
            ? "No orders match your filter."
            : `${totalMatches} ${totalMatches === 1 ? "order" : "orders"} match.`}
          {" "}
          <button
            type="button"
            onClick={() => { setSearch(""); setActiveFilter("All"); }}
            className="font-medium text-primary hover:underline"
          >
            Clear
          </button>
        </p>
      )}

      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={stages.length === 0}
        onRetry={refetch}
        loadingLabel="Loading your pipeline…"
        gatedFeatureTitle="Order management"
        empty={
          <EmptyState
            icon={ShoppingCart}
            title="No orders yet"
            description="New orders move through your production pipeline here, from received to delivered."
            action={<Button variant="primary" size="md" onClick={() => setNewOpen(true)}><Plus size={17} /> Create your first order</Button>}
          />
        }
      >
        {/* Kanban board */}
        <div className="-mx-4 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8">
          <div className="flex items-start gap-4">
            {columns.map((stage) => {
              const stageMeta = stageByName.get(stage.name) ?? { id: null, name: stage.name, position: 0 };
              return (
                <div
                  key={stage.name}
                  className="flex min-h-[460px] w-72 shrink-0 flex-col rounded-xl border border-neutral-border bg-neutral-surface2 p-3"
                >
                  <div className="mb-4 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[13px] font-bold text-ink">{stage.name}</h2>
                      <span className="rounded bg-neutral-surface px-1.5 py-0.5 text-[10px] font-bold text-content-muted">
                        {stage.count}
                      </span>
                    </div>
                    <StageActionsMenu
                      stage={stageMeta}
                      allStages={stageList}
                      hasOrders={stage.count > 0}
                      onChanged={reloadAll}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    {stage.orders.map((card) => (
                      <OrderCard key={card.id} card={card} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Delivered — collapsed */}
            {delivered && (
              <div className="flex min-h-[460px] w-12 shrink-0 cursor-pointer flex-col items-center rounded-xl border border-neutral-border bg-neutral-surface2 py-3 transition-colors hover:bg-neutral-surface">
                <ChevronRight size={18} className="mb-4 text-content-muted" />
                <div className="flex rotate-180 flex-col items-center gap-2 [writing-mode:vertical-lr]">
                  <h2 className="text-[13px] font-bold text-ink">Delivered</h2>
                  <span className="rounded bg-neutral-surface px-1 py-1.5 text-[10px] font-bold text-content-muted">{delivered.count}</span>
                </div>
              </div>
            )}

            {/* Add stage */}
            <AddStageButton onAdded={reloadAll} />
          </div>
        </div>
      </QueryBoundary>

      <NewOrderModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(order) => {
          refetch();
          router.push(`/orders/${order.id}`);
        }}
      />
    </AppShell>
  );
}
