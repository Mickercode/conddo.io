"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Bell, X, AlertCircle, Loader2, Repeat, MessageSquare,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { NewReminderModal } from "@/components/app/NewReminderModal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { verticalOf } from "@/lib/verticalCopy";
import {
  remindersApi,
  REMINDER_TYPE_LABELS,
  reminderProductName,
  type Reminder,
  type ReminderStatus,
} from "@/lib/api/reminders";
import { ApiError } from "@/lib/api/client";

const STATUS_TONES: Record<ReminderStatus, "warning" | "success" | "danger" | "neutral"> = {
  SCHEDULED: "warning",
  SENT: "success",
  FAILED: "danger",
  CANCELLED: "neutral",
};

const STATUS_LABELS: Record<ReminderStatus, string> = {
  SCHEDULED: "Scheduled",
  SENT: "Sent",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

const FILTERS: { id: ReminderStatus | "ALL"; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "SCHEDULED", label: "Scheduled" },
  { id: "SENT", label: "Sent" },
  { id: "FAILED", label: "Failed" },
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

function ReminderRow({
  r,
  tenantSlug,
  onChanged,
}: {
  r: Reminder;
  tenantSlug: string;
  onChanged: () => void;
}) {
  const toast = useToast();
  const [cancelling, setCancelling] = useState(false);
  const productName = reminderProductName(r.product);
  const canCancel = r.status === "SCHEDULED";

  async function cancel() {
    if (!window.confirm("Cancel this reminder? It won't be sent.")) return;
    setCancelling(true);
    try {
      await remindersApi.cancel(tenantSlug, r.id);
      toast.success("Reminder cancelled");
      onChanged();
    } catch (err) {
      toast.error("Couldn't cancel", err instanceof ApiError ? err.message : "Please try again.");
    } finally { setCancelling(false); }
  }

  return (
    <li className="flex flex-col gap-3 px-5 py-4 hover:bg-neutral-surface2 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-bg text-primary">
          <Bell size={15} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[14px] font-medium text-ink">
              {r.customer.name || "—"}
            </p>
            <Chip tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Chip>
            <Chip tone="primary">{REMINDER_TYPE_LABELS[r.reminderType]}</Chip>
            {r.recurrence && r.recurrence !== "ONCE" && (
              <Chip tone="neutral">
                <span className="inline-flex items-center gap-1">
                  <Repeat size={10} /> {r.recurrence.toLowerCase()}
                </span>
              </Chip>
            )}
          </div>
          {productName && (
            <p className="mt-0.5 text-[12px] text-content-muted">{productName}</p>
          )}
          <p className="mt-1 flex items-start gap-2 text-[13px] text-content-secondary">
            <MessageSquare size={13} className="mt-0.5 shrink-0 text-content-muted" />
            <span className="line-clamp-2">{r.message}</span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-content-muted">
            {r.status === "SENT" && r.sentAt
              ? `Sent ${fmtWhen(r.sentAt)}`
              : `Next send: ${fmtWhen(r.scheduledAt)}`}
            {r.recurrenceEnd && ` · ends ${fmtWhen(r.recurrenceEnd)}`}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {canCancel && (
          <Button variant="secondary" size="md" onClick={cancel} disabled={cancelling}>
            {cancelling ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Cancel
          </Button>
        )}
      </div>
    </li>
  );
}

/** Pharmacy reminders manager (Spec v2 §12D). SMS reminders sent via Brevo
 *  at scheduled times. Per spec — backend interpolates template variables
 *  server-side before each send, so the FE only persists the raw template. */
export default function RemindersPage() {
  const { data: me } = useApiQuery(meQuery);
  const tenantSlug = me?.tenant?.slug ?? "";
  const vertical = verticalOf(me);
  const isPharmacy = vertical === "pharmacy";

  const [filter, setFilter] = useState<ReminderStatus | "ALL">("ALL");
  const [createOpen, setCreateOpen] = useState(false);

  const { data, loading, error, refetch } = useApiQuery(
    () => tenantSlug
      ? remindersApi.list(tenantSlug, filter === "ALL" ? {} : { status: filter })
      : Promise.resolve({ data: [] as Reminder[] }),
    [tenantSlug, filter],
  );
  const reminders = data ?? [];
  const scheduledCount = reminders.filter((r) => r.status === "SCHEDULED").length;

  return (
    <AppShell
      title="Reminders"
      subtitle="Scheduled SMS messages to your customers"
      actions={
        tenantSlug && isPharmacy ? (
          <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
            <Plus size={17} />
            <span className="hidden sm:inline">New reminder</span>
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
          icon={Bell}
          title="Reminders aren't enabled for your vertical yet"
          description="Pharmacy reminders are in active rollout. We'll bring them to other verticals as the use cases mature — message us if you need it sooner."
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
                  </button>
                );
              })}
            </div>
            {scheduledCount > 0 && (
              <p className="text-[12px] text-content-muted">
                {scheduledCount} scheduled · waiting to send
              </p>
            )}
          </div>

          <QueryBoundary
            loading={loading}
            error={error}
            isEmpty={reminders.length === 0}
            onRetry={refetch}
            loadingLabel="Loading reminders…"
            gatedFeatureTitle="Pharmacy reminders"
            empty={
              <EmptyState
                icon={Bell}
                title={filter === "ALL" ? "No reminders yet" : `No ${STATUS_LABELS[filter as ReminderStatus].toLowerCase()} reminders`}
                description={
                  filter === "ALL"
                    ? "Schedule SMS reminders for refills, drug usage, or follow-up calls. Template variables fill in customer + product details automatically."
                    : "Adjust the filter above to see reminders in another status."
                }
                action={
                  filter === "ALL" ? (
                    <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
                      <Plus size={17} /> Schedule your first reminder
                    </Button>
                  ) : undefined
                }
              />
            }
          >
            <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
              <ul className="divide-y divide-neutral-border">
                {reminders.map((r) => (
                  <ReminderRow
                    key={r.id}
                    r={r}
                    tenantSlug={tenantSlug}
                    onChanged={refetch}
                  />
                ))}
              </ul>
            </div>
          </QueryBoundary>

          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-content-muted">
            <AlertCircle size={11} />
            SMS goes out via your verified Brevo sender. Costs apply per message — check your plan limits.
          </p>

          <NewReminderModal
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
