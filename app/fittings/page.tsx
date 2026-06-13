"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Scissors, Clock, User } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { NewFittingModal, FITTING_STAGES } from "@/components/app/NewFittingModal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { bookingsApi, type BookingEvent } from "@/lib/api/bookings";

// Color the fitting-stage chip by stage. Earlier stages → primary (planning),
// later stages → success (almost done). Keeps the list scannable.
const stageTone: Record<string, "primary" | "success" | "warning" | "neutral"> = {
  "Initial consultation": "neutral",
  "1st fitting": "primary",
  "2nd fitting": "primary",
  "Final fitting": "warning",
  Pickup: "success",
};

// Pull the "Garment: X" prefix the modal stashes on the first line of notes,
// so we can show the garment label as its own field on the list. The rest of
// the notes (anything after that line) is returned separately.
function extractGarment(notes?: string | null): { garment: string | null; rest: string | null } {
  if (!notes) return { garment: null, rest: null };
  const [first, ...rest] = notes.split(/\r?\n/);
  if (first.startsWith("Garment: ")) {
    return { garment: first.slice("Garment: ".length).trim() || null, rest: rest.join("\n").trim() || null };
  }
  return { garment: null, rest: notes };
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" });
}
function fmtTime(d: Date): string {
  return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

type Bucket = "upcoming" | "later" | "past";

function bucketFor(start: Date, now: Date): Bucket {
  const dayMs = 24 * 60 * 60 * 1000;
  if (start.getTime() < now.getTime() - 60 * 60 * 1000) return "past"; // > 1h ago
  // Upcoming = within the next 7 days, Later = beyond that
  const diff = start.getTime() - now.getTime();
  return diff <= 7 * dayMs ? "upcoming" : "later";
}

function FittingRow({ ev }: { ev: BookingEvent }) {
  const start = new Date(ev.start);
  const valid = !Number.isNaN(start.getTime());
  const { garment, rest } = extractGarment(ev.notes);
  const tone = stageTone[ev.service] ?? "neutral";
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-cinema-elev p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
          <User size={20} />
        </span>
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-medium text-white">{ev.customer}</p>
            <Chip tone={tone}>{ev.service}</Chip>
          </div>
          {garment && <p className="text-[13px] text-white/65">{garment}</p>}
          {rest && <p className="mt-0.5 line-clamp-2 text-[12px] text-white/45">{rest}</p>}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-0.5 sm:items-end">
        {valid ? (
          <>
            <p className="text-[13px] font-medium text-white">{fmtDate(start)}</p>
            <p className="flex items-center gap-1 font-mono text-[12px] text-white/45">
              <Clock size={13} /> {fmtTime(start)}
            </p>
          </>
        ) : (
          <p className="text-[12px] text-white/45">No date set</p>
        )}
        {ev.customerId && (
          <Link
            href={`/customers/${ev.customerId}`}
            className="mt-1 text-[12px] font-medium text-primary hover:underline"
          >
            View customer →
          </Link>
        )}
      </div>
    </li>
  );
}

function Section({ title, items }: { title: string; items: BookingEvent[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="mb-3 text-[13px] font-medium uppercase tracking-[0.06em] text-white/45">
        {title} <span className="text-white/45/60">· {items.length}</span>
      </h2>
      <ul className="space-y-3">
        {items.map((ev) => <FittingRow key={ev.id} ev={ev} />)}
      </ul>
    </div>
  );
}

/** Fashion-specific bookings view. Treats every booking on this tenant as a
 *  fitting (fashion verticals don't surface generic bookings — fittings is
 *  the only appointment surface they get). Groups by upcoming / later / past
 *  so the next thing to prepare for is always at the top. */
export default function FittingsPage() {
  const [open, setOpen] = useState(false);

  // 8-week window: 6 weeks past, 2 weeks ahead — enough to bucket "past"
  // without dragging years of history. Fashion shops typically only care
  // about the recent past for follow-ups.
  const now = new Date();
  const from = new Date(now); from.setDate(now.getDate() - 42); from.setHours(0, 0, 0, 0);
  const to = new Date(now); to.setDate(now.getDate() + 14); to.setHours(23, 59, 59, 999);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const { data, loading, error, refetch } = useApiQuery(
    () => bookingsApi.range(iso(from), iso(to)),
    [iso(from)],
  );
  const events = data ?? [];

  const buckets: Record<Bucket, BookingEvent[]> = { upcoming: [], later: [], past: [] };
  for (const ev of events) {
    const d = new Date(ev.start);
    if (Number.isNaN(d.getTime())) continue;
    buckets[bucketFor(d, now)].push(ev);
  }
  // Upcoming + later sorted ascending (next thing first); past descending.
  buckets.upcoming.sort((a, b) => +new Date(a.start) - +new Date(b.start));
  buckets.later.sort((a, b) => +new Date(a.start) - +new Date(b.start));
  buckets.past.sort((a, b) => +new Date(b.start) - +new Date(a.start));

  return (
    <AppShell
      title="Fittings"
      subtitle="Every fitting appointment, in order"
      actions={
        <Button variant="primary" size="md" onClick={() => setOpen(true)}>
          <Plus size={17} />
          <span className="hidden sm:inline">Schedule fitting</span>
        </Button>
      }
    >
      {/* Stage legend — shows the available fitting stages even when the
          page is empty, so the owner understands the model before adding
          their first row. */}
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.06] bg-cinema-elev px-4 py-3">
        <span className="text-[12px] uppercase tracking-[0.05em] text-white/45">Stages:</span>
        {FITTING_STAGES.map((s) => (
          <Chip key={s.value} tone={stageTone[s.value] ?? "neutral"}>{s.short}</Chip>
        ))}
      </div>

      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={events.length === 0}
        onRetry={refetch}
        loadingLabel="Loading fittings…"
        gatedFeatureTitle="Fittings"
        empty={
          <EmptyState
            icon={Scissors}
            title="No fittings scheduled yet"
            description="Schedule a fitting to keep your bench full and your customers updated. Every appointment shows up here, grouped by what's next."
            action={
              <Button variant="primary" size="md" onClick={() => setOpen(true)}>
                <Plus size={17} /> Schedule your first fitting
              </Button>
            }
          />
        }
      >
        <div className="space-y-8">
          <Section title="Upcoming this week" items={buckets.upcoming} />
          <Section title="Later" items={buckets.later} />
          <Section title="Past" items={buckets.past} />
        </div>
      </QueryBoundary>

      <NewFittingModal open={open} onClose={() => setOpen(false)} onCreated={() => refetch()} />
    </AppShell>
  );
}
