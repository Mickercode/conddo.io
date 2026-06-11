"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, CalendarDays, Plus, Ruler, Users, ShoppingBag, ReceiptText, Activity, X } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { NewOrderModal } from "@/components/app/NewOrderModal";
import { MeasurementsModal } from "@/components/app/MeasurementsModal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { customersApi, tagTone, type CustomerDetail } from "@/lib/api/customers";
import { meQuery } from "@/lib/api/account";
import { verticalOf } from "@/lib/verticalCopy";
import { ApiError } from "@/lib/api/client";
import { CustomerCashbackCard } from "@/components/app/CustomerCashbackCard";
import { CustomerEmrAllergiesBanner } from "@/components/app/CustomerEmrAllergiesBanner";

const initialsOf = (s: string) =>
  s.trim().split(/[\s@.]+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
const fmtDate = (t: string | null) => {
  if (!t) return "—";
  const d = new Date(t);
  return isNaN(d.getTime()) ? t : `Member since ${d.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}`;
};
const fmtShort = (t: string | null | undefined) => {
  if (!t) return "—";
  const d = new Date(t);
  return isNaN(d.getTime()) ? t : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

function Profile({ c, onChanged }: { c: CustomerDetail; onChanged: () => void }) {
  const toast = useToast();
  const { data: me } = useApiQuery(meQuery);
  const isPharmacy = verticalOf(me) === "pharmacy";
  const display = c.name || c.email || "Customer";
  const measurements = c.measurements ? Object.entries(c.measurements) : [];

  const [notes, setNotes] = useState(c.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const notesDirty = notes !== (c.notes ?? "");
  const [orderOpen, setOrderOpen] = useState(false);
  const [measureOpen, setMeasureOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tagBusy, setTagBusy] = useState(false);

  const history = useApiQuery(() => customersApi.orders(c.id), [c.id]);
  const payments = useApiQuery(() => customersApi.payments(c.id), [c.id]);
  const orders = history.data ?? [];
  const pays = payments.data ?? [];

  async function saveNotes() {
    setSavingNotes(true);
    try {
      await customersApi.setNotes(c.id, notes);
      toast.success("Notes saved");
      onChanged();
    } catch (err) {
      toast.error("Couldn't save notes", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSavingNotes(false);
    }
  }

  async function addTag() {
    const tag = tagInput.trim();
    if (!tag) return;
    setTagBusy(true);
    try {
      await customersApi.addTag(c.id, tag);
      setTagInput("");
      toast.success("Tag added", tag);
      onChanged();
    } catch (err) {
      toast.error("Couldn't add tag", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setTagBusy(false);
    }
  }

  async function removeTag(tag: string) {
    try {
      await customersApi.removeTag(c.id, tag);
      onChanged();
    } catch (err) {
      toast.error("Couldn't remove tag", err instanceof ApiError ? err.message : "Please try again.");
    }
  }

  function comingSoon(channel: string) {
    toast.toast({ tone: "info", title: `${channel} coming soon`, description: "Messaging will light up with the Notifications module." });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
      {/* Left: identity + notes */}
      <div className="space-y-6">
        <div className="rounded-xl border border-neutral-border bg-neutral-surface p-6 text-center">
          <span className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary-bg font-mono text-[32px] font-semibold text-primary">
            {initialsOf(display)}
          </span>
          <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">{display}</h2>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {(c.tags ?? []).map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-border bg-neutral-surface2 px-2.5 py-1 text-[12px] text-content-secondary"
              >
                {t}
                <button onClick={() => removeTag(t)} aria-label={`Remove ${t}`} className="text-content-muted hover:text-danger">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); addTag(); }}
            className="mt-2 flex items-center justify-center gap-1.5"
          >
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag"
              className="w-28 rounded-md border border-neutral-border bg-neutral-surface px-2.5 py-1 text-[12px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={tagBusy || !tagInput.trim()}
              className="rounded-md p-1.5 text-primary hover:bg-primary-bg disabled:opacity-40"
              aria-label="Add tag"
            >
              <Plus size={15} />
            </button>
          </form>
          <div className="mt-5 space-y-2.5 border-t border-neutral-border pt-5 text-left">
            <div className="flex items-center gap-2.5 text-content-secondary">
              <Phone size={16} className="shrink-0 text-content-muted" />
              <span className="text-[14px]">{c.phone ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-content-secondary">
              <Mail size={16} className="shrink-0 text-content-muted" />
              <span className="truncate text-[14px]">{c.email ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-content-muted">
              <CalendarDays size={16} className="shrink-0" />
              <span className="text-[14px]">{fmtDate(c.memberSince)}</span>
            </div>
          </div>
          <div className="mt-6 space-y-2.5">
            <Button variant="primary" size="md" className="w-full" onClick={() => setOrderOpen(true)}><Plus size={17} /> New Order</Button>
            <div className="grid grid-cols-2 gap-2.5">
              <Button variant="secondary" size="md" onClick={() => comingSoon("SMS")}>Send SMS</Button>
              <Button variant="secondary" size="md" onClick={() => comingSoon("Email")}>Send Email</Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-border bg-neutral-surface p-6">
          <h3 className="mb-3 text-[11px] uppercase tracking-[0.05em] text-content-muted">Internal Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter customer specific notes here..."
            className="h-32 w-full resize-none rounded-lg border border-neutral-border bg-neutral-bg p-3 text-[14px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button variant="secondary" size="md" className="mt-3 w-full" onClick={saveNotes} disabled={savingNotes || !notesDirty}>
            {savingNotes ? "Saving…" : notesDirty ? "Save Notes" : "Saved"}
          </Button>
        </div>
      </div>

      {/* Right: metrics + history */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Total Spent", value: naira(c.totalSpent), accent: true },
            { label: "Orders", value: String(c.orders), accent: false },
            { label: "Avg Order Value", value: naira(c.avgOrderValue), accent: false },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
              <p className="mb-2 text-[11px] uppercase tracking-[0.05em] text-content-muted">{m.label}</p>
              <p className={`font-mono text-[22px] font-medium leading-none ${m.accent ? "text-primary" : "text-ink"}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Allergies banner — high-visibility safety net before dispense */}
        {isPharmacy && <CustomerEmrAllergiesBanner customerId={c.id} />}

        {/* Medical record (pharmacy only — full EMR lives at /pharmacy/emr) */}
        {isPharmacy && (
          <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary-bg/30 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-bg text-primary">
                <Activity size={16} />
              </span>
              <div>
                <p className="text-[14px] font-medium text-ink">Medical record</p>
                <p className="text-[12px] text-content-muted">Demographics, allergies, conditions, vaccinations, clinical notes, documents.</p>
              </div>
            </div>
            <Link
              href={`/pharmacy/emr/${c.id}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-neutral-surface px-3 py-1.5 text-[12px] font-medium text-primary hover:bg-primary hover:text-white"
            >
              View EMR →
            </Link>
          </div>
        )}

        {/* Cashback wallet (pharmacy only — silent if cashback flag off OR no wallet) */}
        {isPharmacy && <CustomerCashbackCard customerId={c.id} />}

        {/* Measurement Profile */}
        <div className="rounded-xl border border-neutral-border bg-neutral-surface">
          <div className="flex items-center justify-between border-b border-neutral-border px-6 py-4">
            <h3 className="text-[15px] font-medium text-ink">Measurement Profile</h3>
            <button onClick={() => setMeasureOpen(true)} className="text-[12px] font-semibold text-primary hover:underline">Update measurements</button>
          </div>
          {measurements.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 px-6 py-5 sm:grid-cols-3">
              {measurements.map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">{label}</p>
                  <p className="font-mono text-[17px] text-ink">{String(value)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-bg text-primary"><Ruler size={22} /></span>
              <p className="text-[14px] text-content-secondary">No measurements on file yet.</p>
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
          <div className="border-b border-neutral-border px-6 py-4">
            <h3 className="text-[15px] font-medium text-ink">Order History</h3>
          </div>
          {orders.length > 0 ? (
            <ul className="divide-y divide-neutral-border">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/orders/${o.id}`} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-neutral-surface2">
                    <div className="min-w-0">
                      <p className="font-mono text-[13px] text-ink">#{o.reference ?? o.id}</p>
                      <p className="truncate text-[12px] text-content-muted">{o.service ?? "—"}{o.stage ? ` · ${o.stage}` : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[14px] text-ink">{naira(o.amount)}</p>
                      <p className="text-[12px] text-content-muted">{fmtShort(o.date)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-bg text-primary"><ShoppingBag size={22} /></span>
              <p className="text-[14px] text-content-secondary">{history.loading ? "Loading orders…" : "No orders yet."}</p>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
          <div className="border-b border-neutral-border px-6 py-4">
            <h3 className="text-[15px] font-medium text-ink">Payment History</h3>
          </div>
          {pays.length > 0 ? (
            <ul className="divide-y divide-neutral-border">
              {pays.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-6 py-4">
                  <div className="min-w-0">
                    <p className="text-[14px] text-ink">{p.method ?? "Payment"}</p>
                    {p.note && <p className="truncate text-[12px] text-content-muted">{p.note}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[14px] text-success">{naira(p.amount)}</p>
                    <p className="text-[12px] text-content-muted">{fmtShort(p.paidAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-bg text-primary"><ReceiptText size={22} /></span>
              <p className="text-[14px] text-content-secondary">{payments.loading ? "Loading payments…" : "No payments recorded yet."}</p>
            </div>
          )}
        </div>
      </div>

      <NewOrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        initialCustomer={{ id: c.id, name: display }}
        onCreated={() => { history.refetch(); onChanged(); }}
      />
      <MeasurementsModal
        open={measureOpen}
        onClose={() => setMeasureOpen(false)}
        initial={c.measurements}
        onSave={(m) => customersApi.setMeasurements(c.id, m)}
        onSaved={onChanged}
      />
    </div>
  );
}

export default function CustomerProfilePage({ params }: { params: { id: string } }) {
  const { data, loading, error, refetch } = useApiQuery(() => customersApi.get(params.id), [params.id]);

  return (
    <AppShell title="Customer Details" backHref="/customers">
      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={!data}
        onRetry={refetch}
        loadingLabel="Loading customer…"
        empty={<EmptyState icon={Users} title="Customer not found" description="This customer may have been removed, or the profile isn't available yet." />}
      >
        {data && <Profile c={data} onChanged={refetch} />}
      </QueryBoundary>
    </AppShell>
  );
}
