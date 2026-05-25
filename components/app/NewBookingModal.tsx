"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { CustomerPicker } from "@/components/app/CustomerPicker";
import { bookingsApi, type BookingEvent } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";

type Errors = Partial<Record<"customer" | "date" | "time" | "amount", string>>;

const MODES = [
  { value: "", label: "Not specified" },
  { value: "in-person", label: "In person" },
  { value: "video", label: "Video call" },
  { value: "phone", label: "Phone call" },
];

/** Create a booking (POST /bookings). `start` is built from date + time and sent
 *  as an ISO datetime; the backend defaults `end` to the slot duration. */
export function NewBookingModal({
  open,
  onClose,
  onCreated,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (booking: BookingEvent) => void;
  defaultDate?: string; // YYYY-MM-DD
}) {
  const toast = useToast();
  const [customer, setCustomer] = useState<{ id: string | null; name: string }>({ id: null, name: "" });
  const [service, setService] = useState("");
  const [date, setDate] = useState(defaultDate ?? "");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  function reset() {
    setCustomer({ id: null, name: "" });
    setService("");
    setDate(defaultDate ?? "");
    setTime("");
    setMode("");
    setAmount("");
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
    if (!date) next.date = "Pick a date.";
    if (!time) next.time = "Pick a time.";
    if (amount && (Number.isNaN(Number(amount)) || Number(amount) < 0)) next.amount = "Enter a valid amount.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const start = new Date(`${date}T${time}`);
    if (Number.isNaN(start.getTime())) {
      setErrors({ date: "Invalid date/time." });
      return;
    }
    setSaving(true);
    try {
      const { data } = await bookingsApi.create({
        customerId: customer.id ?? undefined,
        customerName: customer.id ? undefined : customer.name.trim() || undefined,
        service: service.trim() || undefined,
        start: start.toISOString(),
        mode: mode || undefined,
        amount: amount ? Number(amount) : undefined,
        notes: notes.trim() || undefined,
      });
      toast.success("Booking created", `${customer.name} · ${date} ${time}`);
      reset();
      onClose();
      onCreated?.(data);
    } catch (err) {
      toast.error("Couldn't create booking", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="New booking"
      description="Schedule a consultation or appointment."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="new-booking-form" disabled={saving}>
            {saving ? "Creating…" : "Create booking"}
          </Button>
        </>
      }
    >
      <form id="new-booking-form" onSubmit={submit} className="space-y-4">
        <Field label="Customer" required error={errors.customer}>
          <CustomerPicker
            value={customer}
            error={errors.customer}
            onPick={(c) => setCustomer({ id: c.id, name: c.name })}
            onTypeName={(name) => setCustomer({ id: null, name })}
          />
        </Field>
        <Field label="Service" htmlFor="nb-service">
          <TextInput id="nb-service" value={service} onChange={(e) => setService(e.target.value)} placeholder="e.g. Consultation, fitting" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Date" htmlFor="nb-date" required error={errors.date}>
            <TextInput id="nb-date" type="date" value={date} error={errors.date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Time" htmlFor="nb-time" required error={errors.time}>
            <TextInput id="nb-time" type="time" value={time} error={errors.time} onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Mode" htmlFor="nb-mode">
            <Select id="nb-mode" value={mode} onChange={(e) => setMode(e.target.value)}>
              {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </Select>
          </Field>
          <Field label="Amount (₦)" htmlFor="nb-amount" error={errors.amount}>
            <TextInput id="nb-amount" inputMode="decimal" value={amount} error={errors.amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </Field>
        </div>
        <Field label="Notes" htmlFor="nb-notes">
          <TextArea id="nb-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Anything to prepare for this booking." />
        </Field>
      </form>
    </Modal>
  );
}
