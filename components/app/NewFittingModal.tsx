"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { CustomerPicker } from "@/components/app/CustomerPicker";
import { bookingsApi, type BookingEvent } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";

type Errors = Partial<Record<"customer" | "date" | "time", string>>;

// The canonical fitting stages a fashion tenant moves a garment job through.
// Stored on the booking's `service` field; the Fittings page reads it back to
// label and group rows. Adding a new stage here is enough — it shows up in the
// modal AND renders correctly on the list without further changes.
export const FITTING_STAGES = [
  { value: "Initial consultation", short: "Initial", hint: "Measurements + design brief" },
  { value: "1st fitting", short: "1st fitting", hint: "Try the toile / first cut" },
  { value: "2nd fitting", short: "2nd fitting", hint: "Refine fit + finishes" },
  { value: "Final fitting", short: "Final", hint: "Sign-off before delivery" },
  { value: "Pickup", short: "Pickup", hint: "Customer collects the garment" },
] as const;

/** Schedule a fitting (POST /bookings). The stage radio writes to `service`;
 *  the garment label is appended to `notes` so it survives even though the
 *  generic booking schema has no dedicated garment field. */
export function NewFittingModal({
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
  const [stage, setStage] = useState<string>(FITTING_STAGES[0].value);
  const [garment, setGarment] = useState("");
  const [date, setDate] = useState(defaultDate ?? "");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  function reset() {
    setCustomer({ id: null, name: "" });
    setStage(FITTING_STAGES[0].value);
    setGarment("");
    setDate(defaultDate ?? "");
    setTime("");
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
    // Compose notes: a "Garment: X" prefix on top of any free-form note keeps
    // the garment label retrievable on the list view without a dedicated field.
    const composed = [garment.trim() && `Garment: ${garment.trim()}`, notes.trim()]
      .filter(Boolean)
      .join("\n");
    setSaving(true);
    try {
      const { data } = await bookingsApi.create({
        customerId: customer.id ?? undefined,
        customerName: customer.id ? undefined : customer.name.trim() || undefined,
        service: stage,
        start: start.toISOString(),
        mode: "in-person",
        notes: composed || undefined,
      });
      toast.success("Fitting scheduled", `${customer.name} · ${stage}`);
      reset();
      onClose();
      onCreated?.(data);
    } catch (err) {
      toast.error("Couldn't schedule fitting", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Schedule fitting"
      description="Book a fitting appointment for a garment job."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="new-fitting-form" disabled={saving}>
            {saving ? "Scheduling…" : "Schedule fitting"}
          </Button>
        </>
      }
    >
      <form id="new-fitting-form" onSubmit={submit} className="space-y-4">
        <Field label="Customer" required error={errors.customer}>
          <CustomerPicker
            value={customer}
            error={errors.customer}
            onPick={(c) => setCustomer({ id: c.id, name: c.name })}
            onTypeName={(name) => setCustomer({ id: null, name })}
          />
        </Field>

        <Field label="Fitting stage" required>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FITTING_STAGES.map((s) => {
              const active = stage === s.value;
              return (
                <label
                  key={s.value}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors ${
                    active
                      ? "border-primary bg-primary/[0.08]"
                      : "border-white/[0.06] bg-cinema-elev hover:border-primary-light"
                  }`}
                >
                  <input
                    type="radio"
                    name="fitting-stage"
                    value={s.value}
                    checked={active}
                    onChange={() => setStage(s.value)}
                    className="mt-0.5 h-4 w-4 border-white/[0.06] text-primary focus:ring-primary"
                  />
                  <span className="min-w-0">
                    <span className={`block text-[13px] font-medium ${active ? "text-primary" : "text-white"}`}>{s.short}</span>
                    <span className="block text-[12px] text-white/45">{s.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </Field>

        <Field label="Garment" htmlFor="nf-garment" hint="What's being made? e.g. Agbada, bridal gown, suit.">
          <TextInput
            id="nf-garment"
            value={garment}
            onChange={(e) => setGarment(e.target.value)}
            placeholder="e.g. Royal blue agbada"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Date" htmlFor="nf-date" required error={errors.date}>
            <TextInput id="nf-date" type="date" value={date} error={errors.date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Time" htmlFor="nf-time" required error={errors.time}>
            <TextInput id="nf-time" type="time" value={time} error={errors.time} onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>

        <Field label="Notes" htmlFor="nf-notes">
          <TextArea
            id="nf-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Anything to prepare for this fitting."
          />
        </Field>
      </form>
    </Modal>
  );
}
