"use client";

import { useState } from "react";
import {
  Plus, Check, Inbox, Ruler, Scissors, Cog, Shirt, Truck, Phone, Mail, ShoppingCart, Circle, ArrowRight, FileText, Gift, type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { Field, TextInput, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { ordersApi, type OrderDetail } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { InvoiceModal } from "@/components/app/InvoiceModal";
import { IssueRefillOfferModal } from "@/components/app/IssueRefillOfferModal";
import { OrderItemsCard } from "@/components/app/OrderItemsCard";
import { meQuery } from "@/lib/api/account";
import { verticalOf } from "@/lib/verticalCopy";

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Card", "POS", "Other"];

function RecordPaymentModal({
  orderId,
  balance,
  open,
  onClose,
  onRecorded,
}: {
  orderId: string;
  balance: number;
  open: boolean;
  onClose: () => void;
  onRecorded: () => void;
}) {
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  function close() {
    if (saving) return;
    setAmount("");
    setMethod(PAYMENT_METHODS[0]);
    setNote("");
    setError(undefined);
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!amount || Number.isNaN(value) || value <= 0) {
      setError("Enter a payment amount greater than zero.");
      return;
    }
    setSaving(true);
    try {
      await ordersApi.addPayment(orderId, { amount: value, method, note: note.trim() || undefined });
      toast.success("Payment recorded", naira(value));
      close();
      onRecorded();
    } catch (err) {
      toast.error("Couldn't record payment", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Record payment"
      description={balance > 0 ? `Balance due: ${naira(balance)}` : undefined}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="record-payment-form" disabled={saving}>
            {saving ? "Saving…" : "Record"}
          </Button>
        </>
      }
    >
      <form id="record-payment-form" onSubmit={submit} className="space-y-4">
        <Field label="Amount (₦)" htmlFor="rp-amount" required error={error}>
          <TextInput id="rp-amount" inputMode="decimal" value={amount} error={error}
            onChange={(e) => setAmount(e.target.value)} placeholder="0" autoFocus />
        </Field>
        <Field label="Method" htmlFor="rp-method">
          <Select id="rp-method" value={method} onChange={(e) => setMethod(e.target.value)}>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
        </Field>
        <Field label="Note" htmlFor="rp-note">
          <TextInput id="rp-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional reference" />
        </Field>
      </form>
    </Modal>
  );
}

const STAGE_ICON: Record<string, LucideIcon> = {
  Received: Inbox,
  "Measurement Taken": Ruler,
  "Fabric Sourced": Scissors,
  "In Production": Cog,
  "Ready for Fitting": Shirt,
  Delivered: Truck,
};
const stageTone = (s: string): "info" | "warning" | "primary" | "success" => {
  const v = s.toLowerCase();
  if (v.includes("deliver")) return "success";
  if (v.includes("production")) return "warning";
  if (v.includes("ready")) return "primary";
  return "info";
};
const fmtDate = (t: string | null) => {
  if (!t) return "—";
  const d = new Date(t);
  return isNaN(d.getTime()) ? t : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};
const fmtDateTime = (t: string) => {
  const d = new Date(t);
  return isNaN(d.getTime()) ? t : d.toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

function Detail({ o, onChanged }: { o: OrderDetail; onChanged: () => void }) {
  const toast = useToast();
  const { data: me } = useApiQuery(meQuery);
  const isPharmacy = verticalOf(me) === "pharmacy";
  const stages = o.stages?.length ? o.stages : ["Received"];
  const currentIdx = Math.max(0, stages.indexOf(o.stage));
  const customer = typeof o.customer === "string" ? { name: o.customer } : o.customer ?? {};
  // Only pharmacy orders with a real customer id can be issued an offer —
  // walk-in orders capture name-only and don't qualify.
  const canIssueOffer = isPharmacy && Boolean(customer.id);
  const measurements = o.measurements ? Object.entries(o.measurements) : [];

  const nextStage = currentIdx < stages.length - 1 ? stages[currentIdx + 1] : null;
  const [advancing, setAdvancing] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [notes, setNotes] = useState(o.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const notesDirty = notes !== (o.notes ?? "");

  async function advance() {
    if (!nextStage) return;
    setAdvancing(true);
    try {
      await ordersApi.transition(o.id, nextStage);
      toast.success("Stage advanced", nextStage);
      onChanged();
    } catch (err) {
      toast.error("Couldn't advance stage", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setAdvancing(false);
    }
  }

  async function sendReminder() {
    setReminding(true);
    try {
      await ordersApi.remind(o.id);
      toast.success("Reminder sent", customer.name ?? undefined);
    } catch (err) {
      toast.error("Couldn't send reminder", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setReminding(false);
    }
  }

  async function saveNotes() {
    setSavingNotes(true);
    try {
      await ordersApi.update(o.id, { notes });
      toast.success("Notes saved");
      onChanged();
    } catch (err) {
      toast.error("Couldn't save notes", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSavingNotes(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(0,360px)]">
      {/* Main */}
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-neutral-border bg-neutral-surface p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-mono text-[20px] font-bold text-ink">{o.reference}</h2>
              <p className="mt-1 text-[14px] text-content-secondary">{o.service ?? "—"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Chip tone={stageTone(o.stage)}>{o.stage}</Chip>
              <Button variant="secondary" size="md" onClick={() => setInvoiceOpen(true)}>
                <FileText size={15} /> Invoice
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-neutral-border pt-4 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.05em] text-content-muted">Customer</p>
              <p className="text-[14px] font-medium text-ink">{customer.name ?? "—"}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.05em] text-content-muted">Ordered</p>
              <p className="font-mono text-[14px] text-ink">{fmtDate(o.orderedAt)}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.05em] text-content-muted">Due Date</p>
              <p className={`font-mono text-[14px] ${o.flag ? "text-danger" : "text-primary"}`}>{fmtDate(o.dueDate)}</p>
            </div>
          </div>
        </div>

        {/* Production progress */}
        <div className="rounded-2xl border border-neutral-border bg-neutral-surface p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[16px] font-medium text-ink">Production Progress</h3>
            {nextStage ? (
              <Button variant="primary" size="md" className="h-9 px-4 text-[13px]" onClick={advance} disabled={advancing}>
                {advancing ? "Advancing…" : <>Advance to {nextStage} <ArrowRight size={15} /></>}
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-success-bg px-3 py-1.5 text-[13px] font-medium text-success">
                <Check size={15} /> Final stage
              </span>
            )}
          </div>
          <div className="overflow-x-auto pb-1">
            <div className="relative flex min-w-[560px] justify-between">
              <div className="absolute left-6 right-6 top-4 -z-0 h-0.5 bg-neutral-surface2" />
              {stages.map((stage, i) => {
                const done = i < currentIdx;
                const active = i === currentIdx;
                const Icon = STAGE_ICON[stage] ?? Circle;
                return (
                  <div key={stage} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${done ? "bg-primary text-white" : active ? "bg-warning text-white ring-4 ring-warning/20" : "border border-neutral-border bg-neutral-surface2 text-content-muted"}`}>
                      {done ? <Check size={16} strokeWidth={2.5} /> : <Icon size={16} />}
                    </div>
                    <span className={`text-center text-[11px] ${active ? "font-bold text-ink" : done ? "font-medium text-primary" : "text-content-muted"}`}>{stage}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order items — inline add/edit/delete via /orders/{id}/items endpoints */}
        <OrderItemsCard orderId={o.id} items={o.items} onChanged={onChanged} />

        {/* Activity log */}
        {o.activity.length > 0 && (
          <div className="rounded-2xl border border-neutral-border bg-neutral-surface p-6">
            <h3 className="mb-6 text-[16px] font-medium text-ink">Activity Log</h3>
            <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-neutral-border">
              {o.activity.map((e, i) => (
                <li key={e.id} className="relative flex gap-4">
                  <span className={`z-10 mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border bg-neutral-surface ${i === 0 ? "border-primary" : "border-neutral-border"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-primary" : "bg-neutral-strong"}`} />
                  </span>
                  <div className="flex-1">
                    <div className="mb-0.5 flex flex-wrap items-center justify-between gap-1">
                      <p className="text-[14px] font-medium text-ink">{e.title}</p>
                      <span className="font-mono text-[10px] uppercase text-content-muted">{fmtDateTime(e.at)}</span>
                    </div>
                    {(e.detail || e.actor) && <p className="text-[12px] text-content-secondary">{e.detail}{e.actor ? ` · ${e.actor}` : ""}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-neutral-border bg-neutral-surface p-6">
          <div className="mb-4 flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-bg font-mono text-[15px] font-semibold text-primary">
              {(customer.name ?? "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?"}
            </span>
            <h3 className="text-[15px] font-medium text-ink">{customer.name ?? "—"}</h3>
          </div>
          <div className="space-y-3 border-t border-neutral-border pt-4">
            <div className="flex items-center gap-3 text-content-secondary"><Phone size={16} className="shrink-0 text-content-muted" /><span className="font-mono text-[13px]">{customer.phone ?? "—"}</span></div>
            <div className="flex items-center gap-3 text-content-secondary"><Mail size={16} className="shrink-0 text-content-muted" /><span className="truncate text-[13px]">{customer.email ?? "—"}</span></div>
          </div>
          {canIssueOffer && (
            <button
              type="button"
              onClick={() => setIssueOpen(true)}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-primary/30 bg-primary-bg px-3 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <Gift size={14} /> Issue refill offer
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-border bg-neutral-surface p-6">
          <h3 className="mb-4 text-[16px] font-medium text-ink">Billing Summary</h3>
          <div className="mb-5 space-y-2">
            <div className="flex justify-between text-[13px]"><span className="text-content-secondary">Total Amount</span><span className="font-mono font-medium text-ink">{naira(o.billing.total)}</span></div>
            <div className="flex justify-between text-[13px]"><span className="text-content-secondary">Deposit Paid</span><span className="font-mono text-success">{naira(o.billing.deposit)}</span></div>
            <div className="mt-2 flex items-center justify-between border-t border-dashed border-neutral-border pt-3"><span className="text-[14px] font-medium text-ink">Balance Due</span><span className="font-mono text-[18px] font-bold text-warning">{naira(o.billing.balance)}</span></div>
          </div>
          <div className="space-y-2">
            <Button variant="secondary" size="md" className="w-full" onClick={() => setPayOpen(true)}>Record Payment</Button>
            <button
              onClick={sendReminder}
              disabled={reminding}
              className="w-full rounded-md border border-primary-border bg-neutral-surface py-2.5 text-[14px] font-medium text-primary transition-colors hover:bg-primary-bg disabled:opacity-50"
            >
              {reminding ? "Sending…" : "Send Reminder"}
            </button>
          </div>
        </div>

        {measurements.length > 0 && (
          <div className="rounded-2xl border border-neutral-border bg-neutral-surface p-6">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-[16px] font-medium text-ink">Measurements</h3><Ruler size={18} className="text-content-muted" /></div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {measurements.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-neutral-surface2 px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">{label}</p>
                  <p className="font-mono text-[15px] text-ink">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-neutral-border bg-neutral-surface p-6">
          <h3 className="mb-3 text-[16px] font-medium text-ink">Internal Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a private note about this order…"
            className="h-28 w-full resize-none rounded-lg border border-neutral-border bg-neutral-bg p-3 text-[14px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {notesDirty && (
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="ghost" size="md" className="h-9 px-3 text-[13px]" onClick={() => setNotes(o.notes ?? "")} disabled={savingNotes}>
                Discard
              </Button>
              <Button variant="primary" size="md" className="h-9 px-4 text-[13px]" onClick={saveNotes} disabled={savingNotes}>
                {savingNotes ? "Saving…" : "Save notes"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <RecordPaymentModal
        orderId={o.id}
        balance={o.billing.balance}
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onRecorded={onChanged}
      />
      <InvoiceModal order={o} open={invoiceOpen} onClose={() => setInvoiceOpen(false)} />
      {canIssueOffer && customer.id && (
        <IssueRefillOfferModal
          open={issueOpen}
          onClose={() => setIssueOpen(false)}
          customerId={customer.id}
          customerName={customer.name}
        />
      )}
    </div>
  );
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { data, loading, error, refetch } = useApiQuery(() => ordersApi.get(params.id), [params.id]);

  return (
    <AppShell title={data?.reference ?? "Order"} subtitle="Orders" backHref="/orders">
      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={!data}
        onRetry={refetch}
        loadingLabel="Loading order…"
        empty={<EmptyState icon={ShoppingCart} title="Order not found" description="This order may have been removed, or it isn't available yet." />}
      >
        {data && <Detail o={data} onChanged={refetch} />}
      </QueryBoundary>
    </AppShell>
  );
}
