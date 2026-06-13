"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Pill, AlertCircle, Clock, CheckCircle2, BellRing, User, Download, FileText, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { NewPrescriptionModal } from "@/components/app/NewPrescriptionModal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  prescriptionsApi,
  refillStatusOf,
  type Prescription,
  type PrescriptionListParams,
  type RefillStatus,
} from "@/lib/api/prescriptions";
import { ApiError } from "@/lib/api/client";
import { downloadCsv } from "@/lib/csv";

const FILTERS: { key: NonNullable<PrescriptionListParams["status"]> | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "due_soon", label: "Due soon" },
  { key: "overdue", label: "Overdue" },
  { key: "active", label: "Active" },
  { key: "one_off", label: "One-off" },
];

const statusChip: Record<RefillStatus, { tone: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  current: { tone: "success", label: "On schedule" },
  due_soon: { tone: "warning", label: "Due soon" },
  overdue: { tone: "danger", label: "Overdue" },
  no_refill: { tone: "neutral", label: "One-off" },
};

function fmtDate(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

function PrescriptionRow({ rx, onChanged }: { rx: Prescription; onChanged: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState<"fill" | "remind" | null>(null);
  const status = refillStatusOf(rx);
  const chip = statusChip[status];

  async function markFilled() {
    setBusy("fill");
    try {
      await prescriptionsApi.fill(rx.id);
      toast.success("Marked as filled", `${rx.medication} · ${rx.customerName}`);
      onChanged();
    } catch (err) {
      toast.error("Couldn't mark filled", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function sendReminder() {
    setBusy("remind");
    try {
      await prescriptionsApi.remind(rx.id);
      toast.success("Reminder sent", `${rx.customerName} will receive an SMS shortly.`);
    } catch (err) {
      toast.error("Couldn't send reminder", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
            <Pill size={18} />
          </span>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-medium text-white">{rx.medication}</p>
              <Chip tone={chip.tone}>{chip.label}</Chip>
            </div>
            <p className="flex items-center gap-1.5 text-[13px] text-white/65">
              <User size={13} className="text-white/45" />
              {rx.customerId ? (
                <Link href={`/customers/${rx.customerId}`} className="hover:text-primary hover:underline">
                  {rx.customerName}
                </Link>
              ) : (
                rx.customerName
              )}
            </p>
            {rx.dosage && <p className="mt-1 text-[13px] text-white/45">{rx.dosage}{rx.quantity ? ` · ${rx.quantity} dispensed` : ""}</p>}
            {rx.notes && <p className="mt-1 text-[12px] text-white/45">{rx.notes}</p>}
          </div>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-1 text-[12px] sm:text-right">
          <span className="uppercase tracking-[0.05em] text-white/45">Issued</span>
          <span className="font-mono text-white">{fmtDate(rx.issuedAt)}</span>
          {rx.refillIntervalDays && (
            <>
              <span className="uppercase tracking-[0.05em] text-white/45">Last filled</span>
              <span className="font-mono text-white">{fmtDate(rx.lastFilledAt)}</span>
              <span className="uppercase tracking-[0.05em] text-white/45">Next refill</span>
              <span className={`font-mono ${status === "overdue" ? "text-rose-200" : status === "due_soon" ? "text-amber-300" : "text-white"}`}>
                {fmtDate(rx.nextRefillDue)}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
        <Button variant="secondary" size="md" onClick={markFilled} disabled={busy !== null}>
          <CheckCircle2 size={15} /> {busy === "fill" ? "Marking…" : "Mark as filled"}
        </Button>
        {rx.refillIntervalDays && (status === "due_soon" || status === "overdue") && (
          <Button variant="primary" size="md" onClick={sendReminder} disabled={busy !== null}>
            <BellRing size={15} /> {busy === "remind" ? "Sending…" : "Send refill reminder"}
          </Button>
        )}
      </div>
    </li>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof AlertCircle;
  tone: "danger" | "warning" | "neutral";
}) {
  const toneCls =
    tone === "danger"
      ? "text-rose-200"
      : tone === "warning"
      ? "text-amber-300"
      : "text-white";
  return (
    <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[12px] uppercase tracking-[0.05em] text-white/45">{label}</p>
        <Icon size={18} className={`${toneCls} opacity-80`} />
      </div>
      <p className={`font-mono text-[24px] ${toneCls}`}>{value}</p>
    </div>
  );
}

/** Prescriptions list with refill reminders. Pharmacy vertical only —
 *  surfaces via the manifest's `prescriptions` toolId. */
export default function PrescriptionsPage() {
  const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]["key"]>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const params: PrescriptionListParams = {
    search: search.trim() || undefined,
    status: activeFilter === "all" ? undefined : activeFilter,
    size: 100,
  };
  const list = useApiQuery(() => prescriptionsApi.list(params), [activeFilter, search]);
  const summary = useApiQuery(prescriptionsApi.summary);

  const rxs = list.data ?? [];
  const summaryData = summary.data;

  return (
    <AppShell
      title="Prescriptions"
      subtitle="Dispensing log and refill reminders"
      actions={
        <>
          <Button
            variant="secondary"
            size="md"
            onClick={() =>
              downloadCsv("prescriptions", rxs, [
                { header: "Customer", accessor: (r) => r.customerName },
                { header: "Phone", accessor: (r) => r.customerPhone ?? "" },
                { header: "Medication", accessor: (r) => r.medication },
                { header: "Dosage", accessor: (r) => r.dosage ?? "" },
                { header: "Quantity", accessor: (r) => r.quantity ?? "" },
                { header: "Issued", accessor: (r) => r.issuedAt },
                { header: "Last filled", accessor: (r) => r.lastFilledAt ?? "" },
                { header: "Refill interval (days)", accessor: (r) => r.refillIntervalDays ?? "" },
                { header: "Next refill due", accessor: (r) => r.nextRefillDue ?? "" },
                { header: "Notes", accessor: (r) => r.notes ?? "" },
              ])
            }
            disabled={rxs.length === 0}
            className="hidden sm:inline-flex"
          >
            <Download size={16} />
            Export CSV
          </Button>
          <Button variant="primary" size="md" onClick={() => setOpen(true)}>
            <Plus size={17} />
            <span className="hidden sm:inline">New prescription</span>
          </Button>
        </>
      }
    >
      {/* Summary KPIs — render whenever we have summary data, including zeros,
          so the dashboard pattern is consistent and the user learns the shape. */}
      {summaryData && (
        <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryCard label="Total" value={summaryData.total} icon={Pill} tone="neutral" />
          <SummaryCard label="Due soon" value={summaryData.dueSoon} icon={Clock} tone="warning" />
          <SummaryCard label="Overdue" value={summaryData.overdue} icon={AlertCircle} tone="danger" />
          <SummaryCard label="One-off" value={summaryData.oneOff} icon={CheckCircle2} tone="neutral" />
        </div>
      )}

      {/* Customer-uploaded Rx review queue — separate flow from the
          internal dispensing log below. Surfaces here so pharmacists land
          on it without hunting through the sidebar. */}
      <Link
        href="/prescriptions/review"
        className="mb-5 flex items-center justify-between rounded-xl border border-white/[0.06] bg-cinema-elev p-4 transition-colors hover:border-primary-light"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
            <FileText size={18} />
          </span>
          <div>
            <p className="text-[14px] font-medium text-white">Customer-uploaded prescriptions</p>
            <p className="text-[12px] text-white/65">
              Review prescriptions customers submit through your website
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-white/45" />
      </Link>

      {/* Filters + search */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = f.key === activeFilter;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFilter(f.key)}
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
        <div className="relative sm:w-72">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/45" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medication or customer"
            className="w-full rounded-lg border border-white/[0.06] bg-cinema-elev py-2.5 pl-11 pr-4 text-[14px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <QueryBoundary
        loading={list.loading}
        error={list.error}
        isEmpty={rxs.length === 0}
        onRetry={list.refetch}
        loadingLabel="Loading prescriptions…"
        empty={
          <EmptyState
            icon={Pill}
            title={
              search || activeFilter !== "all"
                ? "No matching prescriptions"
                : "No prescriptions yet"
            }
            description={
              search || activeFilter !== "all"
                ? "Try a different search or filter."
                : "Add a prescription to start tracking dispensing and refill cadences. We'll surface customers due for a refill so you can reach out before they run out."
            }
            action={
              !search && activeFilter === "all" ? (
                <Button variant="primary" size="md" onClick={() => setOpen(true)}>
                  <Plus size={17} /> Add your first prescription
                </Button>
              ) : undefined
            }
          />
        }
      >
        <ul className="space-y-3">
          {rxs.map((rx) => (
            <PrescriptionRow key={rx.id} rx={rx} onChanged={() => { list.refetch(); summary.refetch(); }} />
          ))}
        </ul>
      </QueryBoundary>

      <NewPrescriptionModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => { list.refetch(); summary.refetch(); }}
      />
    </AppShell>
  );
}
