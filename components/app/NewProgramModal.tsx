"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ClipboardPlus, Loader2, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select, TextArea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { inventoryApi, type Product } from "@/lib/api/inventory";
import {
  programsApi,
  type CreateProgramInput,
  type ProgramFrequency,
} from "@/lib/api/programs";
import { ApiError } from "@/lib/api/client";

type LineDraft = { productId: string; quantity: string; frequency: ProgramFrequency };

const COMMON_CONDITIONS = [
  "Type 2 Diabetes",
  "Hypertension",
  "Asthma",
  "Hypothyroidism",
  "Chronic Kidney Disease",
];

/** Create a drug program. Defaults to ongoing (no end date); BE auto-bills
 *  monthly via Routepay recurring after first enrolment + payment. */
export function NewProgramModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const toast = useToast();
  const productsQ = useApiQuery(() => inventoryApi.list({ size: 200 }));
  const products: Product[] = productsQ.data ?? [];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetCondition, setTargetCondition] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([
    { productId: "", quantity: "1", frequency: "MONTHLY" },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setTargetCondition("");
    setDurationMonths("");
    setMonthlyPrice("");
    setLines([{ productId: "", quantity: "1", frequency: "MONTHLY" }]);
  }, [open]);

  function patchLine(i: number, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name required"); return; }
    const price = Number(monthlyPrice);
    if (!Number.isFinite(price) || price <= 0) { toast.error("Set a monthly price"); return; }

    const items = lines
      .filter((l) => l.productId)
      .map((l) => ({
        productId: l.productId,
        quantity: Math.max(1, Number(l.quantity) || 1),
        frequency: l.frequency,
      }));
    if (items.length === 0) { toast.error("Add at least one product"); return; }

    const body: CreateProgramInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      targetCondition: targetCondition.trim() || undefined,
      durationMonths: durationMonths ? Number(durationMonths) : null,
      monthlyPrice: price,
      items,
    };
    setSaving(true);
    try {
      await programsApi.create(body);
      toast.success("Program created", "Publish it to the website when you're ready.");
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error("Couldn't create", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title="New care program"
      description="Bundle products, reminders, and consultations into a monthly subscription patients can enrol in."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="np-form" disabled={saving}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : (<><ClipboardPlus size={14} /> Create program</>)}
          </Button>
        </>
      }
    >
      <form id="np-form" onSubmit={submit} className="space-y-4">
        <Field label="Program name" htmlFor="np-name" required>
          <TextInput
            id="np-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Diabetes Care Plan"
            autoFocus
          />
        </Field>

        <Field label="Description" htmlFor="np-desc" hint="Shown to customers on the website.">
          <TextArea
            id="np-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="A monthly Metformin supply + weekly check-in calls + a monthly pharmacist consultation."
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Target condition" htmlFor="np-cond">
            <TextInput
              id="np-cond"
              value={targetCondition}
              onChange={(e) => setTargetCondition(e.target.value)}
              placeholder="e.g. Type 2 Diabetes"
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {COMMON_CONDITIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTargetCondition(c)}
                  className="rounded-full border border-neutral-border bg-neutral-surface px-2.5 py-0.5 text-[11px] text-content-secondary hover:border-primary hover:text-primary"
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Duration (months)" htmlFor="np-dur" hint="Leave blank for ongoing.">
            <TextInput
              id="np-dur"
              inputMode="numeric"
              value={durationMonths}
              onChange={(e) => setDurationMonths(e.target.value)}
              placeholder="Ongoing"
            />
          </Field>
        </div>

        <Field label="Monthly price (₦)" htmlFor="np-price" required>
          <TextInput
            id="np-price"
            inputMode="decimal"
            value={monthlyPrice}
            onChange={(e) => setMonthlyPrice(e.target.value)}
            placeholder="15000"
          />
        </Field>

        {/* Products */}
        <div>
          <p className="mb-2 text-[12px] font-medium text-content-secondary">Products included</p>
          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-[1fr_70px_120px_auto] gap-2 rounded-md bg-neutral-surface2 p-2">
                <Select value={line.productId} onChange={(e) => patchLine(i, { productId: e.target.value })}>
                  <option value="">Pick a product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
                <TextInput
                  inputMode="numeric"
                  value={line.quantity}
                  onChange={(e) => patchLine(i, { quantity: e.target.value })}
                  placeholder="Qty"
                />
                <Select value={line.frequency} onChange={(e) => patchLine(i, { frequency: e.target.value as ProgramFrequency })}>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                </Select>
                <button
                  type="button"
                  onClick={() => setLines((prev) => prev.length === 1 ? prev : prev.filter((_, j) => j !== i))}
                  disabled={lines.length === 1}
                  aria-label="Remove"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-content-muted hover:bg-danger-bg hover:text-danger disabled:opacity-30"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setLines((prev) => [...prev, { productId: "", quantity: "1", frequency: "MONTHLY" }])}
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-neutral-border px-3 py-1 text-[12px] font-medium text-content-secondary hover:border-primary hover:text-primary"
            >
              <Plus size={12} /> Add product
            </button>
          </div>
        </div>

        <p className="flex items-start gap-1.5 rounded-md bg-neutral-surface2 px-3 py-2 text-[11px] text-content-muted">
          <AlertCircle size={11} className="mt-0.5 shrink-0" />
          Programs are draft until you publish them — only then will they appear on your website for customers to enrol.
        </p>
      </form>
    </Modal>
  );
}
