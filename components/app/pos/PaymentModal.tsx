"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Banknote, ArrowRightLeft, Trash2, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import {
  posApi,
  type PosSale,
  type PosPaymentMethod,
} from "@/lib/api/pos";
import { ApiError } from "@/lib/api/client";
import { naira } from "@/lib/format";

const METHODS: { id: PosPaymentMethod; label: string; icon: React.ElementType }[] = [
  { id: "CASH", label: "Cash", icon: Banknote },
  { id: "TRANSFER", label: "Transfer", icon: ArrowRightLeft },
];

/** Split-payment UI. Cashier adds one or more tenders until paid >= total.
 *  Each tender is a separate POST — that mirrors BE's first-class split-
 *  payment model and lets the user remove a wrong one without restarting.
 *  The form auto-fills the amount field with the remaining balance, so the
 *  most common case (single cash payment) is one Tab + Enter away.
 *
 *  This modal does NOT call /complete — the parent decides when to. Once
 *  `balance <= 0`, the modal surfaces a "Done — back to cart" button so the
 *  cashier can review or attach a customer for cashback before completing. */
export function PaymentModal({
  open,
  onClose,
  sale,
  onSaleChanged,
}: {
  open: boolean;
  onClose: () => void;
  sale: PosSale | null;
  onSaleChanged?: (next: PosSale) => void;
}) {
  const toast = useToast();
  const [method, setMethod] = useState<PosPaymentMethod>("CASH");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Auto-fill the amount with remaining balance every time the sale state
  // changes (e.g. after adding a payment).
  useEffect(() => {
    if (!open || !sale) return;
    if (sale.balance > 0) setAmount(String(sale.balance));
    else setAmount("");
  }, [open, sale]);

  const totalPaid = useMemo(() => sale?.paid ?? 0, [sale]);
  const total = useMemo(() => sale?.total ?? 0, [sale]);
  const balance = useMemo(() => sale?.balance ?? 0, [sale]);

  if (!sale) return null;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const a = Number(amount);
    if (!Number.isFinite(a) || a <= 0) {
      toast.error("Enter an amount");
      return;
    }
    if (method === "TRANSFER" && !reference.trim()) {
      toast.error("Reference required", "Enter the bank transfer reference for the audit trail.");
      return;
    }
    setAdding(true);
    try {
      const { data } = await posApi.addPayment(sale!.id, {
        method,
        amount: a,
        reference: reference.trim() || undefined,
      });
      onSaleChanged?.(data);
      setReference("");
      toast.success(`${method === "CASH" ? "Cash" : "Transfer"} added`, naira(a));
    } catch (err) {
      toast.error("Couldn't add payment", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setAdding(false);
    }
  }

  async function remove(paymentId: string) {
    setRemovingId(paymentId);
    try {
      const { data } = await posApi.removePayment(sale!.id, paymentId);
      onSaleChanged?.(data);
    } catch (err) {
      toast.error("Couldn't remove", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !adding && onClose()}
      title="Take payment"
      description={`${naira(total)} total · ${sale.items.length} item${sale.items.length === 1 ? "" : "s"}`}
      footer={
        <Button variant="primary" size="md" onClick={onClose}>
          {balance <= 0 ? "Done — back to cart" : "Save and close"}
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Top stats */}
        <div className="rounded-lg border border-neutral-border bg-neutral-surface2 p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.05em] text-content-muted">Total</p>
              <p className="mt-0.5 font-mono text-[14px] text-ink">{naira(total)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.05em] text-content-muted">Paid</p>
              <p className="mt-0.5 font-mono text-[14px] text-success">{naira(totalPaid)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.05em] text-content-muted">
                {balance >= 0 ? "Balance" : "Change"}
              </p>
              <p className={`mt-0.5 font-mono text-[14px] ${balance > 0 ? "text-warning" : balance < 0 ? "text-primary" : "text-success"}`}>
                {naira(Math.abs(balance))}
              </p>
            </div>
          </div>
        </div>

        {/* Add tender — only when there's still a balance */}
        {balance > 0 && (
          <form onSubmit={add} className="space-y-3 rounded-lg border border-neutral-border bg-neutral-surface p-4">
            {/* Method tabs */}
            <div className="inline-flex w-full overflow-hidden rounded-lg border border-neutral-border bg-neutral-surface2 p-0.5">
              {METHODS.map((m) => {
                const active = method === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[13px] font-medium transition-colors ${
                      active ? "bg-neutral-surface text-primary" : "text-content-secondary hover:text-ink"
                    }`}
                  >
                    <Icon size={14} /> {m.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Amount (₦)" htmlFor="pm-amt" required>
                <TextInput
                  id="pm-amt"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={String(balance)}
                  autoFocus
                />
              </Field>
              {method === "TRANSFER" && (
                <Field label="Transfer reference" htmlFor="pm-ref" required>
                  <TextInput
                    id="pm-ref"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="TRF-998877"
                  />
                </Field>
              )}
            </div>

            <Button variant="primary" size="md" type="submit" className="w-full" disabled={adding}>
              {adding ? <><Loader2 size={13} className="animate-spin" /> Adding…</> : `Add ${naira(Number(amount) || 0)} ${method === "CASH" ? "cash" : "transfer"}`}
            </Button>
          </form>
        )}

        {/* Tender list */}
        {sale.payments.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-neutral-border">
            <ul className="divide-y divide-neutral-border">
              {sale.payments.map((p) => {
                const Icon = METHODS.find((m) => m.id === p.method)?.icon ?? Banknote;
                const removing = removingId === p.id;
                return (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-content-muted" />
                      <span className="text-[13px] font-medium text-ink">
                        {METHODS.find((m) => m.id === p.method)?.label ?? p.method}
                      </span>
                      {p.reference && (
                        <span className="font-mono text-[11px] text-content-muted">· {p.reference}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[14px] text-ink">{naira(p.amount)}</span>
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        disabled={removing}
                        aria-label="Remove"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-content-muted hover:bg-danger-bg hover:text-danger disabled:opacity-50"
                      >
                        {removing ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {balance < 0 && (
          <p className="flex items-start gap-1.5 rounded-md bg-primary-bg/40 px-3 py-2 text-[12px] text-primary">
            <AlertCircle size={11} className="mt-0.5 shrink-0" />
            Change due to customer: <span className="font-medium">{naira(Math.abs(balance))}</span>
          </p>
        )}
      </div>
    </Modal>
  );
}
