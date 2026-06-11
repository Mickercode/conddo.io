"use client";

import { useEffect, useState } from "react";
import { ListChecks, AlertCircle, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select, TextArea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { customersApi } from "@/lib/api/customers";
import { inventoryApi, type Product } from "@/lib/api/inventory";
import {
  followupsApi,
  type CreateFollowupInput,
} from "@/lib/api/followups";
import { ApiError } from "@/lib/api/client";

const QUICK_INTERVALS = [
  { label: "Tomorrow",   days: 1 },
  { label: "In 3 days",  days: 3 },
  { label: "In 1 week",  days: 7 },
  { label: "In 2 weeks", days: 14 },
  { label: "In 1 month", days: 30 },
];

const PRESET_CHECKS = [
  "Check if infection cleared, ask about side effects",
  "Confirm full course completed",
  "Blood pressure / glucose reading reported",
  "Review symptom progression",
  "Confirm prescription refill is on time",
];

function inDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(10, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

/** Schedule a clinical follow-up for a customer after dispense. Lives both
 *  as a standalone CTA (from /pharmacy/followups) and as a "Schedule
 *  follow-up" action on order detail. */
export function ScheduleFollowupModal({
  open,
  onClose,
  /** Pre-fill the customer when invoked from an order/customer page. */
  defaultCustomerId,
  defaultProductId,
  defaultOrderId,
  onScheduled,
}: {
  open: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
  defaultProductId?: string;
  defaultOrderId?: string;
  onScheduled?: () => void;
}) {
  const toast = useToast();
  const customersQ = useApiQuery(() => customersApi.list({ size: 200 }));
  const productsQ = useApiQuery(() => inventoryApi.list({ size: 200 }));
  const customers = customersQ.data ?? [];
  const products: Product[] = productsQ.data ?? [];

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [dueDate, setDueDate] = useState(inDays(7));
  const [checkNote, setCheckNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCustomerId(defaultCustomerId ?? "");
    setProductId(defaultProductId ?? "");
    setDueDate(inDays(7));
    setCheckNote("");
  }, [open, defaultCustomerId, defaultProductId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) {
      toast.error("Pick a customer");
      return;
    }
    if (!checkNote.trim()) {
      toast.error("What should be checked on the follow-up?");
      return;
    }
    const body: CreateFollowupInput = {
      customerId,
      productId: productId || undefined,
      orderId: defaultOrderId,
      dueDate: new Date(dueDate).toISOString(),
      checkNote: checkNote.trim(),
    };
    setSaving(true);
    try {
      await followupsApi.create(body);
      toast.success("Follow-up scheduled", "We'll remind you on the dashboard when it's due.");
      onScheduled?.();
      onClose();
    } catch (err) {
      toast.error(
        "Couldn't schedule",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title="Schedule follow-up"
      description="Plan a clinical check-in after dispensing — Conddo reminds you when it's due, then you log the outcome on the patient's record."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="fu-form" disabled={saving}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Scheduling…</> : (<><ListChecks size={14} /> Schedule</>)}
          </Button>
        </>
      }
    >
      <form id="fu-form" onSubmit={submit} className="space-y-4">
        {!defaultCustomerId && (
          <Field label="Patient" htmlFor="fu-customer" required>
            <Select
              id="fu-customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Pick a patient…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.phone ? ` — ${c.phone}` : ""}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field label="Product (optional)" htmlFor="fu-product" hint="Tag the drug you dispensed so the patient timeline links cleanly.">
          <Select
            id="fu-product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">No product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Due" htmlFor="fu-due" required>
          <div className="space-y-2">
            <TextInput
              id="fu-due"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <div className="flex flex-wrap gap-1.5">
              {QUICK_INTERVALS.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => setDueDate(inDays(q.days))}
                  className="rounded-full border border-neutral-border bg-neutral-surface px-2.5 py-0.5 text-[11px] text-content-secondary hover:border-primary hover:text-primary"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </Field>

        <Field label="What to check" htmlFor="fu-note" required>
          <div className="space-y-2">
            <TextArea
              id="fu-note"
              value={checkNote}
              onChange={(e) => setCheckNote(e.target.value)}
              rows={3}
              placeholder="e.g. Confirm chest infection has cleared. Ask about cough, fever, and antibiotic side effects."
            />
            <div className="flex flex-wrap gap-1.5">
              {PRESET_CHECKS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCheckNote(preset)}
                  className="rounded-full border border-neutral-border bg-neutral-surface px-2.5 py-0.5 text-[11px] text-content-secondary hover:border-primary hover:text-primary"
                >
                  {preset.length > 40 ? preset.slice(0, 38) + "…" : preset}
                </button>
              ))}
            </div>
          </div>
        </Field>

        <p className="flex items-start gap-1.5 rounded-md bg-neutral-surface2 px-3 py-2 text-[11px] text-content-muted">
          <AlertCircle size={11} className="mt-0.5 shrink-0" />
          You'll see this on the dashboard "Follow-ups Due Today" widget on the due date. Logging the outcome creates an immutable note on the patient's record.
        </p>
      </form>
    </Modal>
  );
}
