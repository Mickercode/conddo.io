"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus, Headphones, ChevronLeft, ChevronRight, User, Clock, Wallet, AlertCircle,
  Mic, Music2, Sliders, Users as UsersIcon, GraduationCap, MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { NewSessionModal } from "@/components/app/NewSessionModal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { bookingsApi, type BookingEvent, type SessionType, type DepositStatus } from "@/lib/api/bookings";
import { inventoryApi, type Product } from "@/lib/api/inventory";
import { naira } from "@/lib/format";

const SESSION_META: Record<string, { label: string; icon: LucideIcon; tone: "primary" | "success" | "warning" | "neutral" | "info" }> = {
  RECORDING:  { label: "Recording",  icon: Mic,             tone: "primary" },
  MIXING:     { label: "Mixing",     icon: Sliders,         tone: "info"    },
  MASTERING:  { label: "Mastering",  icon: Headphones,      tone: "info"    },
  PODCAST:    { label: "Podcast",    icon: Music2,          tone: "primary" },
  REHEARSAL:  { label: "Rehearsal",  icon: UsersIcon,       tone: "neutral" },
  LESSON:     { label: "Lesson",     icon: GraduationCap,   tone: "success" },
  OTHER:      { label: "Other",      icon: MoreHorizontal,  tone: "neutral" },
};

const DEPOSIT_CHIP: Record<DepositStatus, { tone: "success" | "warning" | "neutral" | "danger"; label: string }> = {
  DEPOSIT_PAID:    { tone: "success", label: "Deposit paid" },
  PENDING_DEPOSIT: { tone: "warning", label: "Deposit pending" },
  REFUNDED:        { tone: "neutral", label: "Refunded" },
  NONE:            { tone: "neutral", label: "—" },
};

function fmtRange(start: string, end?: string | null): string {
  const s = new Date(start);
  if (Number.isNaN(s.getTime())) return start;
  const sStr = s.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  if (!end) return sStr;
  const e = new Date(end);
  if (Number.isNaN(e.getTime())) return sStr;
  const eStr = e.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  return `${sStr} – ${eStr}`;
}

function dayLabel(d: Date, today: Date): string {
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return "Today";
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-NG", { weekday: "long", month: "short", day: "numeric" });
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

function SessionCard({ ev, onSendLink }: { ev: BookingEvent; onSendLink: (id: string) => void }) {
  const meta = SESSION_META[ev.sessionType ?? "OTHER"] ?? SESSION_META.OTHER;
  const deposit = ev.depositStatus ?? "NONE";
  const depositChip = DEPOSIT_CHIP[deposit];
  const showDeposit = deposit !== "NONE";
  return (
    <div className="rounded-xl border border-neutral-border bg-neutral-surface p-4 transition-colors hover:border-primary-light">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Chip tone={meta.tone}>
          <span className="inline-flex items-center gap-1"><meta.icon size={11} /> {meta.label}</span>
        </Chip>
        {showDeposit && <Chip tone={depositChip.tone}>{depositChip.label}</Chip>}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {ev.customerId ? (
            <Link href={`/customers/${ev.customerId}`} className="block truncate text-[14px] font-medium text-ink hover:text-primary hover:underline">
              {ev.customer}
            </Link>
          ) : (
            <p className="truncate text-[14px] font-medium text-ink">
              <User size={12} className="mr-1 inline" />
              {ev.customer}
            </p>
          )}
          {ev.notes && <p className="mt-0.5 line-clamp-2 text-[12px] text-content-muted">{ev.notes}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="flex items-center justify-end gap-1 font-mono text-[12px] text-ink">
            <Clock size={11} /> {fmtRange(ev.start, ev.end)}
          </p>
          {ev.amount && <p className="mt-0.5 font-mono text-[11px] text-content-muted">{naira(ev.amount)}</p>}
        </div>
      </div>
      {deposit === "PENDING_DEPOSIT" && (
        <button
          type="button"
          onClick={() => onSendLink(ev.id)}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-warning/30 bg-warning-bg px-2.5 py-1 text-[11px] font-medium text-warning hover:bg-warning/10"
        >
          <Wallet size={12} /> Resend deposit link
        </button>
      )}
    </div>
  );
}

function ResourceColumn({
  resource,
  events,
  onSendLink,
}: {
  resource: Product;
  events: BookingEvent[];
  onSendLink: (id: string) => void;
}) {
  const utilization = events.length;
  return (
    <section className="rounded-2xl border border-neutral-border bg-neutral-bg p-4">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-ink">{resource.name}</p>
          <p className="font-mono text-[11px] text-content-muted">
            {naira(resource.price)}/hr · {utilization} session{utilization === 1 ? "" : "s"} today
          </p>
        </div>
      </header>
      {events.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-border px-3 py-4 text-center text-[12px] text-content-muted">
          No sessions
        </p>
      ) : (
        <div className="space-y-2.5">
          {events.map((ev) => <SessionCard key={ev.id} ev={ev} onSendLink={onSendLink} />)}
        </div>
      )}
    </section>
  );
}

/** Music-studio sessions board — bookings grouped by resource (= studio
 *  room from inventory). Surfaces session_type chip + deposit status on
 *  every card. Deposit-pending rows have a "Resend deposit link" CTA. */
export default function SessionsPage() {
  const toast = useToast();
  const today = new Date();
  const [dayOffset, setDayOffset] = useState(0);
  const [open, setOpen] = useState(false);

  const day = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() + dayOffset);
    return d;
  }, [dayOffset]);

  const dayIso = iso(day);
  const events = useApiQuery(() => bookingsApi.range(dayIso, dayIso), [dayIso]);
  const productsQ = useApiQuery(() => inventoryApi.list({ size: 100 }));

  const evs = events.data ?? [];
  // Treat every active inventory product as a bookable resource. Music
  // studios put rooms in inventory (each row's price = hourly rate) per
  // backend/MUSIC_STUDIO_SPEC.md.
  const resources = (productsQ.data ?? []).filter((p) => p.active !== false);

  // Group events by resourceId; bookings without a resourceId go to "Unassigned".
  const byResource = new Map<string | null, BookingEvent[]>();
  for (const ev of evs) {
    const key = ev.resourceId ?? null;
    if (!byResource.has(key)) byResource.set(key, []);
    byResource.get(key)!.push(ev);
  }
  for (const arr of byResource.values()) {
    arr.sort((a, b) => +new Date(a.start) - +new Date(b.start));
  }

  const totals = useMemo(() => {
    let total = 0;
    let deposits = 0;
    let pendingDeposits = 0;
    for (const ev of evs) {
      if (ev.amount) total += Number(ev.amount);
      if (ev.depositStatus === "DEPOSIT_PAID" && ev.depositAmountKobo) deposits += Math.round(ev.depositAmountKobo / 100);
      if (ev.depositStatus === "PENDING_DEPOSIT") pendingDeposits += 1;
    }
    return { total, deposits, pendingDeposits, count: evs.length };
  }, [evs]);

  async function resendDepositLink(_bookingId: string) {
    // Future: dedicated POST /bookings/{id}/resend-deposit-link endpoint.
    // For now, surface a hint so the studio owner can act manually.
    toast.toast({
      tone: "info",
      title: "Deposit link resend coming soon",
      description: "For now, follow up with the customer via WhatsApp / SMS.",
    });
  }

  return (
    <AppShell
      title="Sessions"
      subtitle="Studio bookings, grouped by room"
      actions={
        <Button variant="primary" size="md" onClick={() => setOpen(true)}>
          <Plus size={17} />
          <span className="hidden sm:inline">New session</span>
        </Button>
      }
    >
      {/* Day picker */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-border bg-neutral-surface p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous day"
            onClick={() => setDayOffset((n) => n - 1)}
            className="rounded-full p-1 text-content-secondary hover:bg-neutral-surface2 hover:text-ink"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-[15px] font-medium text-ink">{dayLabel(day, today)}</span>
          <span className="font-mono text-[12px] text-content-muted">
            {day.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <button
            type="button"
            aria-label="Next day"
            onClick={() => setDayOffset((n) => n + 1)}
            className="rounded-full p-1 text-content-secondary hover:bg-neutral-surface2 hover:text-ink"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setDayOffset(0)}
          disabled={dayOffset === 0}
          className="rounded-lg border border-neutral-border px-3 py-1 text-[12px] font-medium text-ink hover:bg-neutral-surface2 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
        >
          Today
        </button>
      </div>

      {/* KPI strip — only when we have any data so the cards don't flash zeros */}
      {evs.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Sessions" value={String(totals.count)} />
          <KpiCard label="Revenue booked" value={naira(totals.total)} />
          <KpiCard label="Deposits collected" value={naira(totals.deposits)} />
          <KpiCard
            label="Deposits pending"
            value={String(totals.pendingDeposits)}
            tone={totals.pendingDeposits > 0 ? "warning" : "neutral"}
          />
        </div>
      )}

      <QueryBoundary
        loading={events.loading}
        error={events.error}
        isEmpty={resources.length === 0 && evs.length === 0}
        onRetry={events.refetch}
        loadingLabel="Loading sessions…"
        gatedFeatureTitle="Sessions"
        empty={
          <EmptyState
            icon={Headphones}
            title="No studios set up yet"
            description="Add your rooms to Inventory first — each row's hourly rate becomes the booking rate here."
            action={<Button href="/inventory" variant="primary" size="md"><Plus size={17} /> Set up rooms</Button>}
          />
        }
      >
        {resources.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No bookable rooms"
            description="Add at least one studio room to Inventory. Each row's price becomes the hourly rate; sessions on this page get grouped by room."
            action={<Button href="/inventory" variant="primary" size="md">Open inventory</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {resources.map((r) => (
              <ResourceColumn
                key={r.id}
                resource={r}
                events={byResource.get(r.id) ?? []}
                onSendLink={resendDepositLink}
              />
            ))}
            {/* Catch-all column for bookings with no resourceId (legacy data
                or bookings created via the generic /bookings flow). */}
            {byResource.get(null)?.length ? (
              <section className="rounded-2xl border border-dashed border-neutral-border bg-neutral-bg p-4">
                <header className="mb-3">
                  <p className="text-[14px] font-medium text-content-secondary">No room assigned</p>
                  <p className="font-mono text-[11px] text-content-muted">{byResource.get(null)!.length} session(s) — open each to assign a room</p>
                </header>
                <div className="space-y-2.5">
                  {byResource.get(null)!.map((ev) => (
                    <SessionCard key={ev.id} ev={ev} onSendLink={resendDepositLink} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </QueryBoundary>

      <NewSessionModal
        open={open}
        onClose={() => setOpen(false)}
        resources={resources}
        defaultDate={dayIso}
        onCreated={() => events.refetch()}
      />
    </AppShell>
  );
}

function KpiCard({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "warning" }) {
  const cls = tone === "warning" ? "text-warning" : "text-ink";
  return (
    <div className="rounded-xl border border-neutral-border bg-neutral-surface p-4">
      <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">{label}</p>
      <p className={`mt-1 font-mono text-[20px] ${cls}`}>{value}</p>
    </div>
  );
}
