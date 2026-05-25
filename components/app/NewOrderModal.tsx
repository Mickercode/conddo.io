"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Check, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { customersApi, type Customer } from "@/lib/api/customers";
import { ordersApi, type OrderDetail } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";

type Errors = Partial<Record<"customer" | "amount", string>>;

/** Search-or-type customer picker: pick an existing CRM customer (links by id) or
 *  type a free-text name (sent as customerName). */
function CustomerPicker({
  value,
  onPick,
  onTypeName,
  error,
}: {
  value: { id: string | null; name: string };
  onPick: (c: Customer) => void;
  onTypeName: (name: string) => void;
  error?: string;
}) {
  const [query, setQuery] = useState(value.name);
  const [results, setResults] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    const t = setTimeout(async () => {
      try {
        const { data } = await customersApi.list({ search: q, size: 6 });
        if (active) setResults(data ?? []);
      } catch {
        if (active) setResults([]);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
      <TextInput
        value={query}
        error={error}
        className="pl-9"
        placeholder="Search customers or type a name"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onTypeName(e.target.value);
          setOpen(true);
        }}
      />
      {value.id && (
        <span className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-[11px] font-medium text-success">
          <Check size={12} /> Linked
        </span>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-neutral-border bg-neutral-surface py-1">
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(c);
                  setQuery(c.name);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-neutral-surface2"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-bg font-mono text-[11px] font-medium text-primary">
                  {c.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] text-ink">{c.name}</span>
                  <span className="block truncate text-[11px] text-content-muted">{c.phone || c.email}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Create an order (POST /orders). Stages come from GET /orders/stages. */
export function NewOrderModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (order: OrderDetail) => void;
}) {
  const toast = useToast();
  const [customer, setCustomer] = useState<{ id: string | null; name: string }>({ id: null, name: "" });
  const [service, setService] = useState("");
  const [stage, setStage] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [stages, setStages] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    ordersApi
      .stages()
      .then(({ data }) => setStages((data ?? []).map((s) => s.name)))
      .catch(() => setStages([]));
  }, [open]);

  function reset() {
    setCustomer({ id: null, name: "" });
    setService("");
    setStage("");
    setAmount("");
    setDueDate("");
    setNotes("");
    setErrors({});
  }

  function close() {
    if (saving) return;
    reset();
    onClose();
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!customer.id && !customer.name.trim()) next.customer = "Pick a customer or type a name.";
    if (amount && (Number.isNaN(Number(amount)) || Number(amount) < 0)) next.amount = "Enter a valid amount.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const { data } = await ordersApi.create({
        customerId: customer.id ?? undefined,
        customerName: customer.id ? undefined : customer.name.trim() || undefined,
        service: service.trim() || undefined,
        stage: stage || undefined,
        amount: amount ? Number(amount) : undefined,
        dueDate: dueDate || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success("Order created", data.reference ? `#${data.reference}` : undefined);
      reset();
      onClose();
      onCreated?.(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not create order. Please try again.";
      toast.error("Couldn't create order", message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="New order"
      description="Add an order to your production pipeline."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" form="new-order-form" disabled={saving}>
            {saving ? "Creating…" : "Create order"}
          </Button>
        </>
      }
    >
      <form id="new-order-form" onSubmit={submit} className="space-y-4">
        <Field label="Customer" required error={errors.customer}>
          <CustomerPicker
            value={customer}
            error={errors.customer}
            onPick={(c) => setCustomer({ id: c.id, name: c.name })}
            onTypeName={(name) => setCustomer({ id: null, name })}
          />
        </Field>
        <Field label="Service / description" htmlFor="no-service">
          <TextInput
            id="no-service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="e.g. Bridal gown, repair, delivery"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Amount (₦)" htmlFor="no-amount" error={errors.amount} hint="Optional — add line items later.">
            <TextInput
              id="no-amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              error={errors.amount}
            />
          </Field>
          <Field label="Due date" htmlFor="no-due">
            <TextInput id="no-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
        </div>
        {stages.length > 0 && (
          <Field label="Stage" htmlFor="no-stage" hint="Defaults to the first stage of your pipeline.">
            <Select id="no-stage" value={stage} onChange={(e) => setStage(e.target.value)}>
              <option value="">First stage (default)</option>
              {stages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Notes" htmlFor="no-notes">
          <TextArea
            id="no-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything the team should know."
            rows={2}
          />
        </Field>
      </form>
    </Modal>
  );
}
