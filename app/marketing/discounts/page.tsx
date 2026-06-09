"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus, Tag, Check, X, Trash2, Loader2, AlertCircle, ArrowLeft, Lock,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { NewDiscountModal } from "@/components/app/NewDiscountModal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { naira } from "@/lib/format";
import { verticalOf } from "@/lib/verticalCopy";
import {
  discountsApi,
  type Discount,
  type DiscountStatus,
  effectivePrice,
  discountChipLabel,
  productDisplayName,
} from "@/lib/api/discounts";
import { ApiError } from "@/lib/api/client";

const STATUS_TONES: Record<DiscountStatus, "warning" | "success" | "danger" | "neutral"> = {
  PENDING_APPROVAL: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  EXPIRED: "neutral",
};

const STATUS_LABELS: Record<DiscountStatus, string> = {
  PENDING_APPROVAL: "Pending approval",
  APPROVED: "Live",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

const FILTERS: { id: DiscountStatus | "ALL"; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "PENDING_APPROVAL", label: "Pending" },
  { id: "APPROVED", label: "Live" },
  { id: "REJECTED", label: "Rejected" },
  { id: "EXPIRED", label: "Expired" },
];

function fmtWhen(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function DiscountRow({
  d,
  isAdmin,
  tenantSlug,
  onChanged,
}: {
  d: Discount;
  isAdmin: boolean;
  tenantSlug: string;
  onChanged: () => void;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState<"approve" | "reject" | "delete" | null>(null);

  async function approve() {
    setBusy("approve");
    try {
      await discountsApi.approve(tenantSlug, d.id, { action: "APPROVE" });
      toast.success("Discount approved", discountChipLabel(d));
      onChanged();
    } catch (err) {
      toast.error("Couldn't approve", err instanceof ApiError ? err.message : "Please try again.");
    } finally { setBusy(null); }
  }

  async function reject() {
    const note = window.prompt("Reason for rejecting this discount?");
    if (!note?.trim()) return;
    setBusy("reject");
    try {
      await discountsApi.approve(tenantSlug, d.id, { action: "REJECT", note: note.trim() });
      toast.success("Discount rejected", "The staff member who created it will be notified.");
      onChanged();
    } catch (err) {
      toast.error("Couldn't reject", err instanceof ApiError ? err.message : "Please try again.");
    } finally { setBusy(null); }
  }

  async function remove() {
    if (!window.confirm(`Delete this discount? This can't be undone.`)) return;
    setBusy("delete");
    try {
      await discountsApi.remove(tenantSlug, d.id);
      toast.success("Discount deleted");
      onChanged();
    } catch (err) {
      toast.error("Couldn't delete", err instanceof ApiError ? err.message : "Please try again.");
    } finally { setBusy(null); }
  }

  return (
    <li className="flex flex-col gap-3 px-5 py-4 hover:bg-neutral-surface2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-bg text-primary">
          <Tag size={15} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[14px] font-medium text-ink">{productDisplayName(d.product)}</p>
            <Chip tone={STATUS_TONES[d.status]}>{STATUS_LABELS[d.status]}</Chip>
            <Chip tone="primary">{discountChipLabel(d)}</Chip>
          </div>
          <p className="mt-0.5 font-mono text-[12px] text-content-muted">
            <span className="line-through">{naira(d.product.price)}</span>
            <span className="ml-2 text-ink">→ {naira(effectivePrice(d))}</span>
            <span className="ml-2">·</span>
            <span className="ml-2">{fmtWhen(d.startsAt)} → {fmtWhen(d.endsAt) || "no expiry"}</span>
          </p>
          {d.createdBy?.name && (
            <p className="mt-0.5 text-[11px] text-content-muted">
              Created by {d.createdBy.name}
              {d.approvedBy?.name && d.status === "APPROVED" && ` · approved by ${d.approvedBy.name}`}
              {d.status === "REJECTED" && d.rejectionNote && ` · rejected: ${d.rejectionNote}`}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {d.status === "PENDING_APPROVAL" && isAdmin && (
          <>
            <Button variant="primary" size="md" onClick={approve} disabled={busy !== null}>
              {busy === "approve" ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Approve
            </Button>
            <Button variant="secondary" size="md" onClick={reject} disabled={busy !== null}>
              {busy === "reject" ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Reject
            </Button>
          </>
        )}
        {d.status === "PENDING_APPROVAL" && !isAdmin && (
          <span className="inline-flex items-center gap-1 text-[11px] text-content-muted">
            <Lock size={11} /> Awaiting admin
          </span>
        )}
        {(d.status === "APPROVED" || d.status === "REJECTED" || d.status === "EXPIRED") && (
          <button
            type="button"
            onClick={remove}
            disabled={busy !== null}
            aria-label="Delete"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-content-muted hover:bg-danger-bg hover:text-danger disabled:opacity-50"
          >
            {busy === "delete" ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        )}
      </div>
    </li>
  );
}

/** Pharmacy discount manager (Spec v2 §12B). Any staff role can CREATE a
 *  discount (lands in PENDING_APPROVAL); only TENANT_ADMIN can APPROVE or
 *  REJECT. EXPIRED is set automatically by the BE scheduled job. */
export default function DiscountsPage() {
  const { data: me } = useApiQuery(meQuery);
  const tenantSlug = me?.tenant?.slug ?? "";
  const isAdmin = me?.user?.role?.toUpperCase().includes("ADMIN") ?? false;
  const vertical = verticalOf(me);
  const isPharmacy = vertical === "pharmacy";

  const [filter, setFilter] = useState<DiscountStatus | "ALL">("ALL");
  const [createOpen, setCreateOpen] = useState(false);

  const { data, loading, error, refetch } = useApiQuery(
    () => tenantSlug ? discountsApi.list(tenantSlug, filter === "ALL" ? {} : { status: filter }) : Promise.resolve({ data: [] as Discount[] }),
    [tenantSlug, filter],
  );
  const discounts = data ?? [];
  const pendingCount = discounts.filter((d) => d.status === "PENDING_APPROVAL").length;

  return (
    <AppShell
      title="Discounts"
      subtitle="Time-bound pricing changes for your products"
      actions={
        tenantSlug && isPharmacy ? (
          <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
            <Plus size={17} />
            <span className="hidden sm:inline">New discount</span>
          </Button>
        ) : undefined
      }
    >
      <Link
        href="/marketing"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-content-secondary hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to Marketing
      </Link>

      {!isPharmacy ? (
        <EmptyState
          icon={Tag}
          title="Discounts aren't enabled for your vertical yet"
          description="The pharmacy discount system is in active rollout. We'll bring it to other verticals next — drop us a note if you'd like it sooner."
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-1 rounded-lg border border-neutral-border bg-neutral-surface p-0.5">
              {FILTERS.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
                      active ? "bg-primary-bg text-primary" : "text-content-secondary hover:text-ink"
                    }`}
                    aria-pressed={active}
                  >
                    {f.label}
                    {f.id === "PENDING_APPROVAL" && pendingCount > 0 && filter !== "PENDING_APPROVAL" && (
                      <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-warning px-1 text-[10px] font-medium text-white">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {pendingCount > 0 && filter === "ALL" && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning-bg px-4 py-3 text-[13px] text-warning">
              <AlertCircle size={15} />
              {pendingCount} discount{pendingCount === 1 ? "" : "s"} awaiting{" "}
              {isAdmin ? <>your approval. <button type="button" onClick={() => setFilter("PENDING_APPROVAL")} className="font-medium underline hover:no-underline">Review them</button></> : "admin approval."}
            </div>
          )}

          <QueryBoundary
            loading={loading}
            error={error}
            isEmpty={discounts.length === 0}
            onRetry={refetch}
            loadingLabel="Loading discounts…"
            gatedFeatureTitle="Pharmacy discounts"
            empty={
              <EmptyState
                icon={Tag}
                title={filter === "ALL" ? "No discounts yet" : `No ${STATUS_LABELS[filter as DiscountStatus].toLowerCase()} discounts`}
                description={
                  filter === "ALL"
                    ? "Create a discount on a product. It goes to an admin for approval before customers see the new price."
                    : "Adjust the filter above to see discounts in another status."
                }
                action={
                  filter === "ALL" ? (
                    <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
                      <Plus size={17} /> Create your first discount
                    </Button>
                  ) : undefined
                }
              />
            }
          >
            <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
              <ul className="divide-y divide-neutral-border">
                {discounts.map((d) => (
                  <DiscountRow
                    key={d.id}
                    d={d}
                    isAdmin={isAdmin}
                    tenantSlug={tenantSlug}
                    onChanged={refetch}
                  />
                ))}
              </ul>
            </div>
          </QueryBoundary>

          <NewDiscountModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            tenantSlug={tenantSlug}
            onCreated={refetch}
          />
        </>
      )}
    </AppShell>
  );
}
