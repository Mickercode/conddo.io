"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Phone,
  User,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  pharmacyDashboardApi,
  type Consultation,
  type ConsultationStatus,
} from "@/lib/api/pharmacyDashboard";
import { ApiError } from "@/lib/api/client";

const FILTERS: { key: ConsultationStatus | "all"; label: string }[] = [
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "COMPLETED", label: "Completed" },
  { key: "all", label: "All" },
];

const statusChip: Record<ConsultationStatus, { tone: "warning" | "primary" | "success" | "neutral"; label: string }> = {
  PENDING: { tone: "warning", label: "Pending" },
  CONFIRMED: { tone: "primary", label: "Confirmed" },
  COMPLETED: { tone: "success", label: "Completed" },
  CANCELLED: { tone: "neutral", label: "Cancelled" },
};

function fmtDateTime(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-NG", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function whatsappLink(num: string, message?: string): string {
  // Normalise: keep leading +, strip everything else non-digit.
  const cleaned = num.replace(/[^\d]/g, "");
  const url = `https://wa.me/${cleaned}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

function ConsultationRow({
  c,
  onChanged,
}: {
  c: Consultation;
  onChanged: () => void;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState<"confirm" | "complete" | "cancel" | null>(null);
  const chip = statusChip[c.status];

  async function setStatus(status: ConsultationStatus, label: string) {
    setBusy(status === "CONFIRMED" ? "confirm" : status === "COMPLETED" ? "complete" : "cancel");
    try {
      await pharmacyDashboardApi.updateConsultation(c.id, { status });
      toast.success(label, c.customerName);
      onChanged();
    } catch (err) {
      toast.error("Couldn't update", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const whatsappPrefill = c.status === "PENDING"
    ? `Hi ${c.customerName.split(" ")[0]}, this is the pharmacist following up on your consultation request: "${c.topic}". When works for you?`
    : undefined;

  return (
    <li className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
            <MessageCircle size={18} />
          </span>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-medium text-white">{c.customerName}</p>
              <Chip tone={chip.tone}>{chip.label}</Chip>
            </div>
            <p className="text-[13px] leading-relaxed text-white/65">{c.topic}</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/45">
              <span className="flex items-center gap-1"><Phone size={12} /> {c.whatsappNumber}</span>
              {c.preferredTime && (
                <span className="flex items-center gap-1">
                  <CalendarClock size={12} /> Preferred: {fmtDateTime(c.preferredTime)}
                </span>
              )}
              {c.customerId && (
                <Link
                  href={`/customers/${c.customerId}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <User size={12} /> View profile
                </Link>
              )}
            </p>
            {c.pharmacistNote && (
              <p className="mt-2 rounded-md bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-white/65">
                Note: {c.pharmacistNote}
              </p>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right text-[12px] text-white/45">
          <p>Requested {fmtDateTime(c.createdAt)}</p>
          {c.completedAt && <p>Completed {fmtDateTime(c.completedAt)}</p>}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
        <a
          href={whatsappLink(c.whatsappNumber, whatsappPrefill)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
        >
          <MessageCircle size={13} /> Open WhatsApp <ExternalLink size={11} />
        </a>
        {c.status === "PENDING" && (
          <>
            <Button variant="primary" size="md" onClick={() => setStatus("CONFIRMED", "Marked as confirmed")} disabled={busy !== null}>
              {busy === "confirm" ? "Confirming…" : "Confirm"}
            </Button>
            <Button variant="secondary" size="md" onClick={() => setStatus("CANCELLED", "Marked as cancelled")} disabled={busy !== null}>
              <XCircle size={15} /> Cancel
            </Button>
          </>
        )}
        {c.status === "CONFIRMED" && (
          <Button variant="primary" size="md" onClick={() => setStatus("COMPLETED", "Marked as completed")} disabled={busy !== null}>
            <CheckCircle2 size={15} /> {busy === "complete" ? "Saving…" : "Mark completed"}
          </Button>
        )}
      </div>
    </li>
  );
}

/** Telepharmacy consultation queue. Customers (or walk-ins) request a
 *  pharmacist consultation via the public website — they show up here.
 *  Spec: backend/PHARMACY_PUBLIC_API_SPEC.md §12 (Dashboard → Consultations). */
export default function ConsultationsPage() {
  const [filter, setFilter] = useState<ConsultationStatus | "all">("PENDING");
  const { data, loading, error, refetch } = useApiQuery(
    () => pharmacyDashboardApi.consultations(filter === "all" ? undefined : filter),
    [filter],
  );
  const items = data ?? [];

  return (
    <AppShell title="Consultations" subtitle="Telepharmacy requests from your customers">
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
                  ? "border border-primary bg-cinema-elev font-medium text-primary"
                  : "border border-transparent text-white/65 hover:text-primary"
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
        loadingLabel="Loading consultation queue…"
        gatedFeatureTitle="Consultations"
        empty={
          <EmptyState
            icon={MessageCircle}
            title={
              filter === "PENDING"
                ? "No pending consultations"
                : filter === "all"
                ? "No consultations yet"
                : `No ${filter.toLowerCase()} consultations`
            }
            description={
              filter === "PENDING"
                ? "When customers request a telepharmacy consultation through your website, they'll show up here. You can confirm, message them on WhatsApp, and mark the session complete from one place."
                : "Switch filters above to see other states."
            }
          />
        }
      >
        <ul className="space-y-3">
          {items.map((c) => (
            <ConsultationRow key={c.id} c={c} onChanged={refetch} />
          ))}
        </ul>
      </QueryBoundary>
    </AppShell>
  );
}
