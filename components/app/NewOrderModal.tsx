"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { CustomerPicker } from "@/components/app/CustomerPicker";
import { ordersApi, type OrderDetail } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";

type Errors = Partial<Record<"customer" | "amount", string>>;

/** Create an order (POST /orders). Stages come from GET /orders/stages.
 *  `initialCustomer` pre-links a customer (e.g. opened from a profile). */
export function NewOrderModal({
  open,
  onClose,
  onCreated,
  initialCustomer,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (order: OrderDetail) => void;
  initialCustomer?: { id: string; name: string };
}) {
  const toast = useToast();
  const [customer, setCustomer] = useState<{ id: string | null; name: string }>(
    initialCustomer ?? { id: null, name: "" },
  );
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
    setCustomer(initialCustomer ?? { id: null, name: "" });
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
