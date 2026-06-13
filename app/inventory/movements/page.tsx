"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowDown, ArrowUp, History, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { inventoryApi, type Product } from "@/lib/api/inventory";
import { meQuery } from "@/lib/api/account";
import { verticalOf } from "@/lib/verticalCopy";
import {
  pharmacyInventoryApi,
  MOVEMENT_TYPE_LABELS,
  movementTone,
  type StockMovement,
  type MovementType,
} from "@/lib/api/pharmacyInventory";

const TYPE_FILTERS: { id: MovementType | "ALL"; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "SALE_ONLINE", label: "Online sales" },
  { id: "SALE_POS", label: "POS sales" },
  { id: "RESTOCK", label: "Restocks" },
  { id: "ADJUSTMENT", label: "Adjustments" },
  { id: "RECONCILIATION", label: "Reconciliations" },
];

function fmtWhen(s: string): string {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function MovementRow({ m, productName }: { m: StockMovement; productName: string }) {
  const positive = m.quantityChange >= 0;
  const label = MOVEMENT_TYPE_LABELS[m.movementType] ?? m.movementType;
  return (
    <li className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.02]">
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
        positive ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/[0.06] text-rose-200"
      }`}>
        {positive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[14px] font-medium text-white">{productName}</p>
          <Chip tone={movementTone(m.movementType)}>{label}</Chip>
        </div>
        <p className="mt-0.5 font-mono text-[12px] text-white/45">
          <span className={positive ? "text-emerald-300" : "text-rose-200"}>
            {positive ? "+" : ""}{m.quantityChange}
          </span>
          <span className="ml-2">·</span>
          <span className="ml-2">{m.quantityBefore} → {m.quantityAfter}</span>
          {m.referenceKind && (
            <>
              <span className="ml-2">·</span>
              <span className="ml-2 lowercase">{m.referenceKind}</span>
            </>
          )}
        </p>
        {m.note && <p className="mt-1 text-[12px] text-white/65">{m.note}</p>}
      </div>
      <span className="shrink-0 font-mono text-[11px] text-white/45">{fmtWhen(m.createdAt)}</span>
    </li>
  );
}

/** Pharmacy stock movement log (Spec v2 §12A). Every change to inventory
 *  — online sale, POS sale, restock, manual adjustment, reconciliation
 *  variance — lands here as an immutable audit row. */
export default function MovementsPage() {
  const { data: me } = useApiQuery(meQuery);
  const isPharmacy = verticalOf(me) === "pharmacy";
  const [filter, setFilter] = useState<MovementType | "ALL">("ALL");

  const movementsQ = useApiQuery(
    () => pharmacyInventoryApi.movements(filter === "ALL" ? {} : { movementType: filter }),
    [filter],
  );
  // Pull products in parallel so we can render names instead of bare ids.
  const productsQ = useApiQuery(() => inventoryApi.list({ size: 500 }));
  const movements = movementsQ.data ?? [];
  const products: Product[] = productsQ.data ?? [];

  const productNames = useMemo(() => {
    const m = new Map<string, string>();
    products.forEach((p) => m.set(p.id, p.name));
    return m;
  }, [products]);

  return (
    <AppShell title="Stock movements" subtitle="Every change to your inventory, in order.">
      <Link
        href="/inventory"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-white/65 hover:text-white"
      >
        <ArrowLeft size={14} /> Back to Inventory
      </Link>

      {!isPharmacy ? (
        <EmptyState
          icon={History}
          title="Movement log is pharmacy-only"
          description="Detailed movement logging is a pharmacy feature today. Other verticals see stock-level changes via the per-product Adjust action."
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-lg border border-white/[0.06] bg-cinema-elev p-0.5">
              {TYPE_FILTERS.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
                      active ? "bg-primary/[0.08] text-primary" : "text-white/65 hover:text-white"
                    }`}
                    aria-pressed={active}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          <QueryBoundary
            loading={movementsQ.loading}
            error={movementsQ.error}
            isEmpty={movements.length === 0}
            onRetry={movementsQ.refetch}
            loadingLabel="Loading movements…"
            gatedFeatureTitle="Stock movement log"
            empty={
              <EmptyState
                icon={History}
                title={filter === "ALL" ? "No movements yet" : "Nothing in this filter"}
                description={
                  filter === "ALL"
                    ? "Every stock change — sales, restocks, adjustments — will appear here. Sell something, record a restock, or run a reconciliation to fill the log."
                    : "Switch the filter above to see other movement types."
                }
              />
            }
          >
            <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
              <ul className="divide-y divide-white/[0.06]">
                {movements.map((m) => (
                  <MovementRow
                    key={m.id}
                    m={m}
                    productName={productNames.get(m.productId) ?? `Product ${m.productId.slice(0, 8)}…`}
                  />
                ))}
              </ul>
            </div>
          </QueryBoundary>

          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-white/45">
            <AlertCircle size={11} />
            Movements are append-only — they're never edited or deleted, so this is the source of truth for any inventory audit.
          </p>
        </>
      )}
    </AppShell>
  );
}
