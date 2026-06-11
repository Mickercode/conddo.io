"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ClipboardPlus, Plus, Users, Calendar, Globe, EyeOff,
  Loader2, Pause, Play, X, AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { Field, Select } from "@/components/ui/Field";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { BetaFeatureGate } from "@/components/app/BetaFeatureGate";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { meQuery } from "@/lib/api/account";
import { verticalOf } from "@/lib/verticalCopy";
import { customersApi } from "@/lib/api/customers";
import {
  programsApi,
  ENROLLMENT_LABELS,
  enrollmentTone,
  type EnrollmentStatus,
} from "@/lib/api/programs";
import { ApiError } from "@/lib/api/client";

function fmtDate(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function EnrolModal({
  open,
  onClose,
  programId,
  onEnrolled,
}: {
  open: boolean;
  onClose: () => void;
  programId: string;
  onEnrolled?: () => void;
}) {
  const toast = useToast();
  const customersQ = useApiQuery(() => customersApi.list({ size: 200 }));
  const customers = customersQ.data ?? [];
  const [customerId, setCustomerId] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) { toast.error("Pick a patient"); return; }
    setSaving(true);
    try {
      await programsApi.enroll(programId, { customerId });
      toast.success("Patient enrolled", "First billing kicks off with their next payment.");
      onEnrolled?.();
      onClose();
    } catch (err) {
      toast.error("Couldn't enrol", err instanceof ApiError ? err.message : "Please try again.");
    } finally { setSaving(false); }
  }

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title="Enrol patient"
      description="Manually enrol someone in this program. Customers can also self-enrol via your website once published."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="en-form" disabled={saving}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Enrolling…</> : "Enrol"}
          </Button>
        </>
      }
    >
      <form id="en-form" onSubmit={submit} className="space-y-4">
        <Field label="Patient" htmlFor="ep-cust" required>
          <Select id="ep-cust" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Pick a patient…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.phone ? ` — ${c.phone}` : ""}
              </option>
            ))}
          </Select>
        </Field>
        <p className="flex items-start gap-1.5 rounded-md bg-neutral-surface2 px-3 py-2 text-[11px] text-content-muted">
          <AlertCircle size={11} className="mt-0.5 shrink-0" />
          BE charges via RoutePay recurring billing. The first month's payment is collected immediately; subsequent months auto-bill on the same day each month.
        </p>
      </form>
    </Modal>
  );
}

const STATUS_FILTERS: { id: EnrollmentStatus | "ALL"; label: string }[] = [
  { id: "ALL",       label: "All" },
  { id: "ACTIVE",    label: "Active" },
  { id: "PAUSED",    label: "Paused" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

export default function ProgramDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: me } = useApiQuery(meQuery);
  const isPharmacy = verticalOf(me) === "pharmacy";
  const toast = useToast();

  const programQ = useApiQuery(() => programsApi.get(id), [id]);
  const enrolQ = useApiQuery(() => programsApi.enrollments(id), [id]);

  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "ALL">("ALL");
  const [enrolOpen, setEnrolOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const p = programQ.data;
  const enrolments = (enrolQ.data ?? []).filter(
    (e) => statusFilter === "ALL" || e.status === statusFilter,
  );

  async function togglePublish() {
    if (!p) return;
    setPublishing(true);
    try {
      await programsApi.publish(p.id, !p.isPublished);
      toast.success(p.isPublished ? "Unpublished" : "Published");
      programQ.refetch();
    } catch (err) {
      toast.error("Couldn't update", err instanceof ApiError ? err.message : "Please try again.");
    } finally { setPublishing(false); }
  }

  return (
    <AppShell title={p?.name ?? "Program"} subtitle="Drug program detail">
      <Link
        href="/pharmacy/programs"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-content-secondary hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to programs
      </Link>

      {!isPharmacy ? (
        <EmptyState icon={ClipboardPlus} title="Programs are pharmacy-only" />
      ) : (
        <BetaFeatureGate
          featureKey="drug_programs"
          featureName="Drug Programs"
          description="Subscription care plans for chronic patients."
        >
          <QueryBoundary
            loading={programQ.loading}
            error={programQ.error}
            isEmpty={!p}
            onRetry={programQ.refetch}
            loadingLabel="Loading program…"
            empty={<EmptyState icon={ClipboardPlus} title="Program not found" />}
          >
            {p && (
              <>
                {/* Header */}
                <div className="mb-6 rounded-2xl border border-neutral-border bg-neutral-surface p-5">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[18px] font-medium text-ink">{p.name}</h2>
                        <Chip tone={p.isPublished ? "success" : "neutral"}>
                          {p.isPublished ? "Published" : "Draft"}
                        </Chip>
                        {p.targetCondition && <Chip tone="primary">{p.targetCondition}</Chip>}
                      </div>
                      {p.description && (
                        <p className="mt-2 max-w-2xl text-[13px] text-content-secondary">{p.description}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="secondary" size="md" onClick={togglePublish} disabled={publishing}>
                        {publishing ? <Loader2 size={13} className="animate-spin" /> : p.isPublished ? <><EyeOff size={13} /> Unpublish</> : <><Globe size={13} /> Publish</>}
                      </Button>
                      <Button variant="primary" size="md" onClick={() => setEnrolOpen(true)}>
                        <Plus size={14} /> Enrol patient
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-neutral-border pt-4 sm:grid-cols-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">Price/month</p>
                      <p className="mt-1 font-mono text-[18px] font-medium text-ink">{naira(p.monthlyPrice)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">Duration</p>
                      <p className="mt-1 font-mono text-[18px] font-medium text-ink">
                        {p.durationMonths ? `${p.durationMonths} months` : "Ongoing"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">Enrolled</p>
                      <p className="mt-1 font-mono text-[18px] font-medium text-ink">
                        {p.enrollmentsCount ?? enrolments.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">MRR</p>
                      <p className="mt-1 font-mono text-[18px] font-medium text-success">
                        {naira(p.monthlyPrice * (p.enrollmentsCount ?? enrolments.length))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                {p.items?.length > 0 && (
                  <div className="mb-6 rounded-2xl border border-neutral-border bg-neutral-surface p-5">
                    <h3 className="mb-3 text-[15px] font-medium text-ink">Includes</h3>
                    <ul className="space-y-1">
                      {p.items.map((it, i) => (
                        <li key={i} className="flex items-center justify-between rounded-md bg-neutral-surface2 px-3 py-2 text-[13px]">
                          <span className="text-ink">
                            {it.productName ?? `Product ${it.productId.slice(0, 8)}…`}
                          </span>
                          <span className="font-mono text-content-secondary">
                            × {it.quantity}{it.frequency ? ` · ${it.frequency.toLowerCase()}` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Enrolments */}
                <div className="overflow-hidden rounded-2xl border border-neutral-border bg-neutral-surface">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-border px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-content-muted" />
                      <h3 className="text-[15px] font-medium text-ink">Enrolments</h3>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-lg border border-neutral-border bg-neutral-surface p-0.5">
                      {STATUS_FILTERS.map((s) => {
                        const active = statusFilter === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setStatusFilter(s.id)}
                            className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
                              active ? "bg-primary-bg text-primary" : "text-content-secondary hover:text-ink"
                            }`}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <QueryBoundary
                    loading={enrolQ.loading}
                    error={enrolQ.error}
                    isEmpty={enrolments.length === 0}
                    onRetry={enrolQ.refetch}
                    loadingLabel="Loading enrolments…"
                    empty={
                      <EmptyState
                        icon={Users}
                        title={statusFilter === "ALL" ? "No enrolments yet" : `No ${ENROLLMENT_LABELS[statusFilter as EnrollmentStatus].toLowerCase()} enrolments`}
                        description={
                          statusFilter === "ALL"
                            ? "Enrol a patient manually or publish the program for self-enrolment from your website."
                            : "Adjust the filter above."
                        }
                      />
                    }
                  >
                    <ul className="divide-y divide-neutral-border">
                      {enrolments.map((e) => (
                        <li key={e.id} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-neutral-surface2">
                          <Link href={`/customers/${e.customer.id}`} className="flex items-center gap-3 hover:text-primary">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-bg text-primary">
                              <Users size={13} />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-medium text-ink hover:text-primary">
                                {e.customer.name ?? "Customer"}
                              </p>
                              <p className="font-mono text-[11px] text-content-muted">{e.customer.phone ?? "—"}</p>
                            </div>
                          </Link>
                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <p className="font-mono text-[11px] text-content-muted">
                                Enrolled {fmtDate(e.enrolledAt)}
                              </p>
                              {e.nextBillingAt && (
                                <p className="inline-flex items-center gap-1 font-mono text-[11px] text-primary">
                                  <Calendar size={10} /> Next bill: {fmtDate(e.nextBillingAt)}
                                </p>
                              )}
                            </div>
                            <Chip tone={enrollmentTone(e.status)}>{ENROLLMENT_LABELS[e.status]}</Chip>
                            {e.status === "ACTIVE" && (
                              <span className="text-content-muted">
                                <Pause size={13} />
                              </span>
                            )}
                            {e.status === "PAUSED" && (
                              <span className="text-content-muted">
                                <Play size={13} />
                              </span>
                            )}
                            {(e.status === "ACTIVE" || e.status === "PAUSED") && (
                              <span className="text-content-muted">
                                <X size={13} />
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </QueryBoundary>
                </div>

                <EnrolModal
                  open={enrolOpen}
                  onClose={() => setEnrolOpen(false)}
                  programId={p.id}
                  onEnrolled={() => {
                    enrolQ.refetch();
                    programQ.refetch();
                  }}
                />
              </>
            )}
          </QueryBoundary>
        </BetaFeatureGate>
      )}
    </AppShell>
  );
}
