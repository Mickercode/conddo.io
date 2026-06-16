"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus, ListChecks, Check, X, Loader2, CalendarClock, Phone, MessageSquare,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { BetaFeatureGate } from "@/components/app/BetaFeatureGate";
import { ScheduleFollowupModal } from "@/components/app/ScheduleFollowupModal";
import { CompleteFollowupModal } from "@/components/app/CompleteFollowupModal";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { verticalOf } from "@/lib/verticalCopy";
import {
  followupsApi,
  FOLLOWUP_STATUS_LABELS,
  followupProductName,
  type Followup,
  type FollowupStatus,
} from "@/lib/api/followups";
import { ApiError } from "@/lib/api/client";

const STATUS_TONES: Record<FollowupStatus, "warning" | "success" | "danger" | "neutral"> = {
  PENDING:   "warning",
  COMPLETED: "success",
  MISSED:    "danger",
  CANCELLED: "neutral",
};

const FILTERS: { id: FollowupStatus | "ALL"; label: string }[] = [
  { id: "ALL",       label: "All" },
  { id: "PENDING",   label: "Pending" },
  { id: "COMPLETED", label: "Completed" },
  { id: "MISSED",    label: "Missed" },
  { id: "CANCELLED", label: "Cancelled" },
];

function fmtWhen(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function isOverdue(f: Followup): boolean {
  return f.status === "PENDING" && new Date(f.dueDate).getTime() < Date.now();
}

function FollowupRow({
  f,
  onComplete,
  onChanged,
}: {
  f: Followup;
  onComplete: (f: Followup) => void;
  onChanged: () => void;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const overdue = isOverdue(f);
  const productName = followupProductName(f.product);

  async function cancel() {
    if (!window.confirm("Cancel this follow-up?")) return;
    setBusy(true);
    try {
      await followupsApi.cancel(f.id);
      toast.success("Follow-up cancelled");
      onChanged();
    } catch (err) {
      toast.error("Couldn't cancel", err instanceof ApiError ? err.message : "Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <li className="flex flex-col gap-3 px-5 py-4 hover:bg-white/[0.02] sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
          overdue ? "bg-rose-500/[0.06] text-rose-200" : "bg-primary/[0.08] text-primary"
        }`}>
          <ListChecks size={15} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[14px] font-medium text-white">{f.customer.name || "—"}</p>
            <Chip tone={STATUS_TONES[f.status]}>{FOLLOWUP_STATUS_LABELS[f.status]}</Chip>
            {overdue && <Chip tone="danger">Overdue</Chip>}
            {productName && <Chip tone="neutral">{productName}</Chip>}
          </div>
          <p className="mt-1 text-[13px] text-white/65">{f.checkNote}</p>
          <p className="mt-1.5 inline-flex items-center gap-1 font-mono text-[11px] text-white/45">
            <CalendarClock size={11} /> Due {fmtWhen(f.dueDate)}
          </p>
          {f.outcome && (
            <div className="mt-2 rounded-md bg-emerald-500/15 px-3 py-2 text-[12px] text-white/65">
              <p className="font-medium text-emerald-300">Outcome: {f.outcomeType}</p>
              <p className="mt-0.5">{f.outcome}</p>
              {f.completedBy?.name && (
                <p className="mt-0.5 text-[10px] text-white/45">
                  Logged by {f.completedBy.name} · {fmtWhen(f.completedAt)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {f.status === "PENDING" && (
          <>
            {f.customer.phone && (
              <a
                href={`tel:${f.customer.phone}`}
                aria-label={`Call ${f.customer.name ?? ""}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.06] bg-cinema-elev text-white/65 hover:border-primary hover:text-primary"
                title={f.customer.phone}
              >
                <Phone size={14} />
              </a>
            )}
            <Button variant="primary" size="md" onClick={() => onComplete(f)} disabled={busy}>
              <Check size={13} /> Log outcome
            </Button>
            <Button variant="secondary" size="md" onClick={cancel} disabled={busy}>
              {busy ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

export default function PharmacyFollowupsPage() {
  const { data: me } = useApiQuery(meQuery);
  const isPharmacy = verticalOf(me) === "pharmacy";

  const [filter, setFilter] = useState<FollowupStatus | "ALL">("PENDING");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [completing, setCompleting] = useState<Followup | null>(null);

  const { data, loading, error, refetch } = useApiQuery(
    () => followupsApi.list(filter === "ALL" ? {} : { status: filter }),
    [filter],
  );
  const followups = data ?? [];
  const overdueCount = followups.filter(isOverdue).length;

  return (
    <AppShell
      title="Follow-ups"
      subtitle="Clinical check-ins after dispense"
      actions={
        isPharmacy ? (
          <Button variant="primary" size="md" onClick={() => setScheduleOpen(true)}>
            <Plus size={17} />
            <span className="hidden sm:inline">Schedule follow-up</span>
          </Button>
        ) : undefined
      }
    >
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-white/65 hover:text-white"
      >
        ← Back to Dashboard
      </Link>

      {!isPharmacy ? (
        <EmptyState
          icon={ListChecks}
          title="Follow-ups are a pharmacy feature"
          description="Clinical follow-up scheduling is built for pharmacy patient care."
        />
      ) : (
        <BetaFeatureGate
          featureKey="followup_workflow"
          featureName="Follow-up Workflow"
          description="Schedule a clinical check-in after dispense. Conddo reminds you when it's due; record the outcome on the patient's record."
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-1 rounded-lg border border-white/[0.06] bg-cinema-elev p-0.5">
              {FILTERS.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
                      active ? "bg-primary/[0.08] text-primary" : "text-white/65 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            {overdueCount > 0 && filter !== "PENDING" && (
              <p className="text-[12px] text-rose-200">{overdueCount} overdue</p>
            )}
          </div>

          <QueryBoundary
            loading={loading}
            error={error}
            isEmpty={followups.length === 0}
            onRetry={refetch}
            loadingLabel="Loading follow-ups…"
            gatedFeatureTitle="Pharmacy follow-ups"
            empty={
              <EmptyState
                icon={MessageSquare}
                title={filter === "ALL" ? "No follow-ups yet" : `No ${FOLLOWUP_STATUS_LABELS[filter as FollowupStatus].toLowerCase()} follow-ups`}
                description={
                  filter === "ALL" || filter === "PENDING"
                    ? "Schedule a clinical follow-up after dispensing. You'll get a reminder when it's due."
                    : "Adjust the filter above to see follow-ups in another status."
                }
                action={
                  filter === "ALL" || filter === "PENDING" ? (
                    <Button variant="primary" size="md" onClick={() => setScheduleOpen(true)}>
                      <Plus size={17} /> Schedule your first follow-up
                    </Button>
                  ) : undefined
                }
              />
            }
          >
            <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
              <ul className="divide-y divide-white/[0.06]">
                {followups.map((f) => (
                  <FollowupRow
                    key={f.id}
                    f={f}
                    onComplete={(fu) => setCompleting(fu)}
                    onChanged={refetch}
                  />
                ))}
              </ul>
            </div>
          </QueryBoundary>

          <ScheduleFollowupModal
            open={scheduleOpen}
            onClose={() => setScheduleOpen(false)}
            onScheduled={refetch}
          />
          <CompleteFollowupModal
            open={completing !== null}
            onClose={() => setCompleting(null)}
            followup={completing}
            onCompleted={refetch}
          />
        </BetaFeatureGate>
      )}
    </AppShell>
  );
}
