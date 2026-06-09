"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ClipboardCheck, Check, AlertTriangle, Loader2, Save, Sparkles,
  ListChecks, Search,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { inventoryApi, type Product } from "@/lib/api/inventory";
import {
  pharmacyInventoryApi,
  RECONCILIATION_RESUME_KEY,
  type CompleteReconciliationResult,
  type ReconciliationItem,
} from "@/lib/api/pharmacyInventory";
import { ApiError } from "@/lib/api/client";

function fmtWhen(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/** Count-entry + completion summary for a reconciliation. Each row carries
 *  one input where the pharmacist enters the physical count; rows with a
 *  filled count compute variance live. Submit Counts persists; Complete
 *  applies variances as RECONCILIATION movements and ends the session. */
export default function ReconciliationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const toast = useToast();
  const recId = params.id;

  const recQ = useApiQuery(() => pharmacyInventoryApi.getReconciliation(recId), [recId]);
  const productsQ = useApiQuery(() => inventoryApi.list({ size: 500 }));

  const session = recQ.data?.reconciliation;
  const items = session?.items ?? [];
  const products: Product[] = productsQ.data ?? [];
  const productNames = useMemo(() => {
    const m = new Map<string, string>();
    products.forEach((p) => m.set(p.id, p.name));
    return m;
  }, [products]);

  // Local edit state — productId → entered count string. Seeded from the
  // session's countedQty (server-persisted) on first load.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!session) return;
    const next: Record<string, string> = {};
    items.forEach((it) => {
      if (it.countedQty != null) next[it.productId] = String(it.countedQty);
    });
    setDrafts(next);
  }, [session?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [search, setSearch] = useState("");
  const [savingCounts, setSavingCounts] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [summary, setSummary] = useState<CompleteReconciliationResult["summary"] | null>(null);

  // Variance preview from draft state (falls back to server value when unmodified).
  function variance(it: ReconciliationItem): number | null {
    const draft = drafts[it.productId];
    if (draft !== undefined && draft !== "") {
      const v = Number(draft);
      return Number.isFinite(v) ? v - it.systemQty : null;
    }
    return it.variance;
  }

  const visibleItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      const name = (productNames.get(it.productId) ?? it.productId).toLowerCase();
      return name.includes(q);
    });
  }, [items, search, productNames]);

  const counts = items.map((it) => ({ it, v: variance(it) }));
  const filledCount = counts.filter((c) => drafts[c.it.productId] !== undefined && drafts[c.it.productId] !== "").length;
  const varianceCount = counts.filter((c) => c.v != null && c.v !== 0).length;
  const totalVariance = counts.reduce((sum, c) => sum + (c.v ?? 0), 0);
  const allCountedOrPersisted = items.every((it) =>
    drafts[it.productId] !== undefined && drafts[it.productId] !== ""
      ? true
      : it.countedQty != null,
  );

  function patchCount(productId: string, value: string) {
    setDrafts((prev) => ({ ...prev, [productId]: value }));
  }

  async function saveCounts() {
    const payload = Object.entries(drafts)
      .filter(([, v]) => v !== "" && Number.isFinite(Number(v)))
      .map(([productId, v]) => ({ productId, countedQty: Number(v) }));
    if (payload.length === 0) {
      toast.error("Nothing to save", "Enter at least one count first.");
      return;
    }
    setSavingCounts(true);
    try {
      await pharmacyInventoryApi.submitCounts(recId, { counts: payload });
      toast.success("Counts saved", `${payload.length} count${payload.length === 1 ? "" : "s"} persisted. Variances calculated.`);
      recQ.refetch();
    } catch (err) {
      toast.error(
        "Couldn't save counts",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setSavingCounts(false);
    }
  }

  async function complete() {
    // Save any unsaved drafts first so they're applied when we complete.
    const hasUnsaved = Object.entries(drafts).some(([pid, v]) => {
      if (v === "") return false;
      const persisted = items.find((it) => it.productId === pid)?.countedQty;
      return persisted == null || persisted !== Number(v);
    });
    if (hasUnsaved && !window.confirm("You have unsaved counts. Save them and complete? Cancel to save first.")) {
      return;
    }
    if (hasUnsaved) {
      await saveCounts();
    }
    if (!window.confirm(`Complete this reconciliation? ${varianceCount} variance${varianceCount === 1 ? "" : "s"} will be applied as RECONCILIATION movements. This can't be undone.`)) {
      return;
    }
    setCompleting(true);
    try {
      const { data } = await pharmacyInventoryApi.completeReconciliation(recId);
      setSummary(data.summary);
      window.localStorage.removeItem(RECONCILIATION_RESUME_KEY);
      toast.success(
        "Reconciliation complete",
        `${data.summary.adjustmentsApplied} adjustment${data.summary.adjustmentsApplied === 1 ? "" : "s"} applied.`,
      );
    } catch (err) {
      toast.error(
        "Couldn't complete",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setCompleting(false);
    }
  }

  // Render the completion summary view once `summary` is set OR session is COMPLETED on load.
  const isComplete = summary != null || session?.status === "COMPLETED";

  return (
    <AppShell
      title={isComplete ? "Reconciliation complete" : "Counting…"}
      subtitle={session?.notes || `Started ${fmtWhen(session?.startedAt)}`}
    >
      <Link
        href="/inventory/reconciliation"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-content-secondary hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to Reconciliation
      </Link>

      <QueryBoundary
        loading={recQ.loading}
        error={recQ.error}
        isEmpty={!session}
        onRetry={recQ.refetch}
        loadingLabel="Loading reconciliation…"
        empty={<EmptyState icon={ClipboardCheck} title="Reconciliation not found" description="This session may have been removed, or the id is wrong." />}
      >
        {isComplete ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-success/20 bg-success-bg p-5">
              <div className="mb-2 flex items-center gap-2">
                <Check size={18} className="text-success" />
                <p className="text-[15px] font-medium text-ink">
                  Reconciliation complete
                </p>
              </div>
              <p className="text-[13px] text-content-secondary">
                Completed {fmtWhen(session?.completedAt)}.
              </p>
            </div>

            {summary && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <SummaryStat label="Total products" value={summary.totalProducts} />
                <SummaryStat label="Matched" value={summary.matched} tone="success" />
                <SummaryStat
                  label="Variances"
                  value={summary.variance}
                  tone={summary.variance > 0 ? "warning" : "neutral"}
                />
                <SummaryStat
                  label="Adjustments applied"
                  value={summary.adjustmentsApplied}
                  tone="primary"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                href="/inventory/movements"
                className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary-bg px-3 py-1.5 text-[13px] font-medium text-primary hover:bg-primary hover:text-white"
              >
                View the audit trail
              </Link>
              <button
                type="button"
                onClick={() => router.push("/inventory")}
                className="inline-flex items-center gap-1.5 rounded-md border border-neutral-border bg-neutral-surface px-3 py-1.5 text-[13px] font-medium text-content-secondary hover:border-primary hover:text-primary"
              >
                Back to Inventory
              </button>
            </div>
          </div>
        ) : session ? (
          <>
            {/* Progress strip */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-border bg-neutral-surface px-4 py-3">
              <div className="flex flex-wrap items-center gap-3 text-[13px]">
                <span className="flex items-center gap-1.5 text-content-secondary">
                  <ListChecks size={14} className="text-content-muted" />
                  {filledCount} of {items.length} counted
                </span>
                <span className="flex items-center gap-1.5 text-content-secondary">
                  <AlertTriangle size={14} className={varianceCount > 0 ? "text-warning" : "text-content-muted"} />
                  {varianceCount} variance{varianceCount === 1 ? "" : "s"}
                </span>
                {totalVariance !== 0 && (
                  <span className={`font-mono text-[12px] ${totalVariance > 0 ? "text-success" : "text-danger"}`}>
                    {totalVariance > 0 ? "+" : ""}{totalVariance} unit{Math.abs(totalVariance) === 1 ? "" : "s"} net
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" size="md" onClick={saveCounts} disabled={savingCounts || completing}>
                  {savingCounts ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : (<><Save size={14} /> Save counts</>)}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={complete}
                  disabled={completing || savingCounts || !allCountedOrPersisted}
                  title={allCountedOrPersisted ? "Apply variances and end the session" : "Count every product first"}
                >
                  {completing ? <><Loader2 size={14} className="animate-spin" /> Completing…</> : (<><Sparkles size={14} /> Complete reconciliation</>)}
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by product name"
                className="w-full max-w-sm rounded-lg border border-neutral-border bg-neutral-surface py-2 pl-10 pr-3 text-[13px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none"
              />
            </div>

            {/* Items table */}
            <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-neutral-border bg-neutral-surface2 text-[11px] uppercase tracking-[0.05em] text-content-secondary">
                      <th className="px-5 py-3 font-medium">Product</th>
                      <th className="px-5 py-3 text-right font-medium">System qty</th>
                      <th className="px-5 py-3 text-right font-medium">Counted</th>
                      <th className="px-5 py-3 text-right font-medium">Variance</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-border">
                    {visibleItems.map((it) => {
                      const name = productNames.get(it.productId) ?? `Product ${it.productId.slice(0, 8)}…`;
                      const v = variance(it);
                      const filled = drafts[it.productId] !== undefined && drafts[it.productId] !== "";
                      return (
                        <tr key={it.productId} className="hover:bg-neutral-surface2">
                          <td className="px-5 py-2.5 text-[13px] text-ink">{name}</td>
                          <td className="px-5 py-2.5 text-right font-mono text-[13px] text-content-secondary">{it.systemQty}</td>
                          <td className="px-5 py-2.5 text-right">
                            <input
                              type="number"
                              inputMode="numeric"
                              min={0}
                              value={drafts[it.productId] ?? ""}
                              onChange={(e) => patchCount(it.productId, e.target.value)}
                              placeholder="—"
                              className="h-8 w-20 rounded-md border border-neutral-strong bg-neutral-bg px-2 text-right font-mono text-[13px] text-ink focus:border-primary focus:outline-none"
                            />
                          </td>
                          <td className="px-5 py-2.5 text-right">
                            {v == null ? (
                              <span className="font-mono text-[12px] text-content-muted">—</span>
                            ) : v === 0 ? (
                              <span className="font-mono text-[12px] text-content-secondary">0</span>
                            ) : (
                              <span className={`font-mono text-[12px] ${v > 0 ? "text-success" : "text-danger"}`}>
                                {v > 0 ? "+" : ""}{v}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-2.5">
                            {it.resolved ? (
                              <Chip tone="success">Saved</Chip>
                            ) : filled ? (
                              <Chip tone="warning">Unsaved</Chip>
                            ) : (
                              <Chip tone="neutral">Pending</Chip>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {visibleItems.length === 0 && search && (
              <p className="mt-3 text-center text-[13px] text-content-muted">
                No products match &ldquo;{search}&rdquo;.
              </p>
            )}
          </>
        ) : null}
      </QueryBoundary>
    </AppShell>
  );
}

function SummaryStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "success" | "warning" | "danger" | "primary" | "neutral";
}) {
  const toneText: Record<typeof tone, string> = {
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    primary: "text-primary",
    neutral: "text-ink",
  };
  return (
    <div className="rounded-lg border border-neutral-border bg-neutral-surface p-4">
      <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">{label}</p>
      <p className={`mt-1 font-mono text-[24px] font-medium leading-none ${toneText[tone]}`}>{value}</p>
    </div>
  );
}
