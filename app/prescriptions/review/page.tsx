"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
  FileText,
  User,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { Field, TextArea } from "@/components/ui/Field";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  pharmacyDashboardApi,
  type CustomerPrescription,
  type ReviewStatus,
} from "@/lib/api/pharmacyDashboard";
import { ApiError } from "@/lib/api/client";

const FILTERS: { key: ReviewStatus | "all"; label: string }[] = [
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "all", label: "All" },
];

const statusChip: Record<ReviewStatus, { tone: "warning" | "success" | "danger"; label: string }> = {
  PENDING: { tone: "warning", label: "Awaiting review" },
  APPROVED: { tone: "success", label: "Approved" },
  REJECTED: { tone: "danger", label: "Rejected" },
};

function fmtDateTime(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ReviewModal({
  rx,
  decision,
  open,
  onClose,
  onReviewed,
}: {
  rx: CustomerPrescription;
  decision: "APPROVED" | "REJECTED";
  open: boolean;
  onClose: () => void;
  onReviewed: () => void;
}) {
  const toast = useToast();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await pharmacyDashboardApi.reviewCustomerPrescription(rx.id, {
        status: decision,
        reviewNote: note.trim() || undefined,
      });
      toast.success(
        decision === "APPROVED" ? "Prescription approved" : "Prescription rejected",
        rx.patientName,
      );
      setNote("");
      onClose();
      onReviewed();
    } catch (err) {
      toast.error(
        decision === "APPROVED" ? "Couldn't approve" : "Couldn't reject",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title={decision === "APPROVED" ? "Approve prescription" : "Reject prescription"}
      description={
        decision === "APPROVED"
          ? "The customer will be notified and can pay for their order."
          : "The customer will be notified with the reason."
      }
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="review-form" disabled={saving}>
            {saving ? "Saving…" : decision === "APPROVED" ? "Approve" : "Reject"}
          </Button>
        </>
      }
    >
      <form id="review-form" onSubmit={submit} className="space-y-4">
        <div className="rounded-lg border border-neutral-border bg-neutral-surface2 p-3 text-[13px] text-content-secondary">
          <p>
            <span className="text-content-muted">Patient:</span> <span className="text-ink">{rx.patientName}</span>
          </p>
          <p>
            <span className="text-content-muted">Prescriber:</span> <span className="text-ink">{rx.prescriberName}</span>
          </p>
        </div>
        <Field
          label={decision === "APPROVED" ? "Note (optional)" : "Reason for rejection"}
          hint={decision === "REJECTED" ? "Share so the customer knows what to fix." : "Optional — visible to the customer."}
          htmlFor="rev-note"
        >
          <TextArea
            id="rev-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={decision === "REJECTED" ? "e.g. Prescription has expired — please upload a current one." : "Optional"}
          />
        </Field>
      </form>
    </Modal>
  );
}

function PrescriptionRow({
  rx,
  onChanged,
}: {
  rx: CustomerPrescription;
  onChanged: () => void;
}) {
  const [modal, setModal] = useState<"APPROVED" | "REJECTED" | null>(null);
  const chip = statusChip[rx.status];
  const isPending = rx.status === "PENDING";

  return (
    <li className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-bg text-primary">
            <FileText size={18} />
          </span>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-medium text-ink">{rx.patientName}</p>
              <Chip tone={chip.tone}>{chip.label}</Chip>
            </div>
            <p className="text-[13px] text-content-secondary">
              Prescribed by <span className="text-ink">{rx.prescriberName}</span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[12px] text-content-muted">
              <User size={12} />
              {rx.customerId ? (
                <Link href={`/customers/${rx.customerId}`} className="hover:text-primary hover:underline">
                  {rx.customerName}
                </Link>
              ) : (
                rx.customerName
              )}
              {rx.customerPhone && <span> · {rx.customerPhone}</span>}
            </p>
            {rx.notes && <p className="mt-2 text-[12px] text-content-muted">{rx.notes}</p>}
            {rx.reviewNote && !isPending && (
              <p className={`mt-2 rounded-md px-2.5 py-1.5 text-[12px] ${rx.status === "APPROVED" ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}>
                Review note: {rx.reviewNote}
                {rx.reviewedByName && <span className="text-content-muted"> · by {rx.reviewedByName}</span>}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-1 text-[12px] sm:items-end">
          <p className="flex items-center gap-1 text-content-muted">
            <Clock size={12} /> Submitted {fmtDateTime(rx.submittedAt)}
          </p>
          {rx.reviewedAt && (
            <p className="text-content-muted">Reviewed {fmtDateTime(rx.reviewedAt)}</p>
          )}
          {rx.orderId && (
            <Link href={`/orders/${rx.orderId}`} className="font-medium text-primary hover:underline">
              View linked order →
            </Link>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-border pt-3">
        <a
          href={rx.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-neutral-strong px-3 py-1.5 text-[12px] font-medium text-content-secondary transition-colors hover:bg-neutral-surface2 hover:text-ink"
        >
          <ExternalLink size={13} /> View Rx image
        </a>
        {isPending && (
          <>
            <Button variant="primary" size="md" onClick={() => setModal("APPROVED")}>
              <CheckCircle2 size={15} /> Approve
            </Button>
            <Button variant="secondary" size="md" onClick={() => setModal("REJECTED")}>
              <XCircle size={15} /> Reject
            </Button>
          </>
        )}
      </div>

      {modal && (
        <ReviewModal
          rx={rx}
          decision={modal}
          open={true}
          onClose={() => setModal(null)}
          onReviewed={() => {
            setModal(null);
            onChanged();
          }}
        />
      )}
    </li>
  );
}

/** Customer-uploaded prescription review queue. Pharmacist approves or
 *  rejects scripts that customers uploaded via the public website.
 *  Different entity from the internal dispensing log at /prescriptions —
 *  this is INBOUND from sebandbayor.com.ng (or equivalent). Spec:
 *  backend/PHARMACY_PUBLIC_API_SPEC.md §12 (Dashboard → Prescriptions). */
export default function PrescriptionsReviewPage() {
  const [filter, setFilter] = useState<ReviewStatus | "all">("PENDING");
  const { data, loading, error, refetch } = useApiQuery(
    () => pharmacyDashboardApi.customerPrescriptions(filter === "all" ? undefined : filter),
    [filter],
  );
  const items = data ?? [];

  return (
    <AppShell
      title="Prescription review"
      subtitle="Customer-uploaded prescriptions awaiting your sign-off"
      backHref="/prescriptions"
    >
      <Link
        href="/prescriptions"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-content-secondary hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to dispensing log
      </Link>

      <div className="mb-5 inline-flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
                active
                  ? "border border-primary bg-neutral-surface font-medium text-primary"
                  : "border border-transparent text-content-secondary hover:text-primary"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        onRetry={refetch}
        loadingLabel="Loading review queue…"
        gatedFeatureTitle="Prescription review"
        empty={
          <EmptyState
            icon={FileText}
            title={
              filter === "PENDING"
                ? "Nothing to review right now"
                : filter === "all"
                ? "No customer-uploaded prescriptions yet"
                : `No ${filter.toLowerCase()} prescriptions`
            }
            description={
              filter === "PENDING"
                ? "When customers upload prescriptions on your website, they'll appear here for you to approve or reject."
                : "Switch filters above to see other states."
            }
          />
        }
      >
        <ul className="space-y-3">
          {items.map((rx) => (
            <PrescriptionRow key={rx.id} rx={rx} onChanged={refetch} />
          ))}
        </ul>
      </QueryBoundary>
    </AppShell>
  );
}
