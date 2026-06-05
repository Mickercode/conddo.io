"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { CustomerPicker } from "@/components/app/CustomerPicker";
import { prescriptionsApi, type Prescription } from "@/lib/api/prescriptions";
import { ApiError } from "@/lib/api/client";

type Errors = Partial<Record<"customer" | "medication" | "quantity" | "interval", string>>;

// Common refill cadences. "Custom" lets the user enter any integer (in days).
const REFILL_PRESETS = [
  { value: "", label: "One-off (no refill)" },
  { value: "30", label: "Monthly (30 days)" },
  { value: "60", label: "Every 2 months (60 days)" },
  { value: "90", label: "Every 3 months (90 days)" },
  { value: "custom", label: "Custom…" },
];

/** Create a prescription (POST /prescriptions). Sets customerId xor
 *  customerName so the server links to an existing customer when possible
 *  and creates a new one otherwise. */
export function NewPrescriptionModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (p: Prescription) => void;
}) {
  const toast = useToast();
  const [customer, setCustomer] = useState<{ id: string | null; name: string }>({ id: null, name: "" });
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [quantity, setQuantity] = useState("");
  const [refillPreset, setRefillPreset] = useState("");
  const [customInterval, setCustomInterval] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  function reset() {
    setCustomer({ id: null, name: "" });
    setMedication("");
    setDosage("");
    setQuantity("");
    setRefillPreset("");
    setCustomInterval("");
    setNotes("");
    setErrors({});
  }

  function close() {
    if (saving) return;
    reset();
    onClose();
  }

  function refillIntervalDays(): number | null {
    if (!refillPreset) return null;
    if (refillPreset === "custom") {
      const n = Number(customInterval);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
    }
    return Number(refillPreset);
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!customer.id && !customer.name.trim()) next.customer = "Pick a customer or type a name.";
    if (!medication.trim()) next.medication = "Medication name is required.";
    if (quantity && (Number.isNaN(Number(quantity)) || Number(quantity) <= 0)) {
      next.quantity = "Enter a valid quantity.";
    }
    if (refillPreset === "custom") {
      const n = Number(customInterval);
      if (!Number.isFinite(n) || n <= 0) next.interval = "Enter days between refills.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const { data } = await prescriptionsApi.create({
        customerId: customer.id ?? undefined,
        customerName: customer.id ? undefined : customer.name.trim() || undefined,
        medication: medication.trim(),
        dosage: dosage.trim() || undefined,
        quantity: quantity ? Number(quantity) : undefined,
        refillIntervalDays: refillIntervalDays(),
        notes: notes.trim() || undefined,
      });
      toast.success("Prescription added", `${customer.name} · ${medication.trim()}`);
      reset();
      onClose();
      onCreated?.(data);
    } catch (err) {
      toast.error("Couldn't add prescription", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="New prescription"
      description="Record a medication for a customer. Set a refill cadence to get reminders."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="new-rx-form" disabled={saving}>
            {saving ? "Saving…" : "Add prescription"}
          </Button>
        </>
      }
    >
      <form id="new-rx-form" onSubmit={submit} className="space-y-4">
        <Field label="Customer" required error={errors.customer}>
          <CustomerPicker
            value={customer}
            error={errors.customer}
            onPick={(c) => setCustomer({ id: c.id, name: c.name })}
            onTypeName={(name) => setCustomer({ id: null, name })}
          />
        </Field>
        <Field label="Medication" htmlFor="rx-med" required error={errors.medication} hint="Name + strength.">
          <TextInput
            id="rx-med"
            value={medication}
            error={errors.medication}
            onChange={(e) => setMedication(e.target.value)}
            placeholder="e.g. Lisinopril 10mg"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Dosage" htmlFor="rx-dosage" hint="e.g. 1 tablet daily, 5ml every 4 hours.">
            <TextInput id="rx-dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="1 tablet daily" />
          </Field>
          <Field label="Quantity dispensed" htmlFor="rx-qty" error={errors.quantity}>
            <TextInput
              id="rx-qty"
              inputMode="numeric"
              value={quantity}
              error={errors.quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 30"
            />
          </Field>
        </div>
        <Field label="Refill" htmlFor="rx-refill" hint="Pick a cadence to set a refill reminder.">
          <Select id="rx-refill" value={refillPreset} onChange={(e) => setRefillPreset(e.target.value)}>
            {REFILL_PRESETS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </Select>
        </Field>
        {refillPreset === "custom" && (
          <Field label="Days between refills" htmlFor="rx-custom" required error={errors.interval}>
            <TextInput
              id="rx-custom"
              inputMode="numeric"
              value={customInterval}
              error={errors.interval}
              onChange={(e) => setCustomInterval(e.target.value)}
              placeholder="e.g. 45"
            />
          </Field>
        )}
        <Field label="Notes" htmlFor="rx-notes">
          <TextArea id="rx-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Allergies, instructions, anything to remember." />
        </Field>
      </form>
    </Modal>
  );
}
