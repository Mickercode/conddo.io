"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { verticalsApi, type VerticalMeasurementField } from "@/lib/api/verticals";

type Row = { key: string; value: string };

const toRows = (m: Record<string, string | number> | null | undefined): Row[] =>
  m ? Object.entries(m).map(([key, value]) => ({ key, value: String(value) })) : [];

/**
 * Key/value measurement editor. Used by the customer profile and order detail
 * (both persist a free-form measurements map). `onSave` performs the PUT and
 * returns the persisted map (or throws an ApiError).
 *
 * Vertical-aware: when the tenant's vertical has BE-defined
 * `measurementFields` (e.g. fashion ships Chest / Waist / Hip / Sleeve), the
 * modal pre-seeds those rows on an empty profile and offers quick-add chips
 * for any vertical fields the user hasn't filled in yet.
 */
export function MeasurementsModal({
  open,
  onClose,
  initial,
  onSave,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial: Record<string, string | number> | null | undefined;
  onSave: (measurements: Record<string, string>) => Promise<unknown>;
  onSaved?: () => void;
}) {
  const toast = useToast();
  const { data: me } = useApiQuery(meQuery);
  const verticalId = me?.tenant?.verticalId;

  const verticalQ = useApiQuery(
    () => verticalId
      ? verticalsApi.config(verticalId)
      : Promise.resolve({ data: null as never }),
    [verticalId],
  );
  const fields: VerticalMeasurementField[] = verticalQ.data?.measurementFields ?? [];

  const [rows, setRows] = useState<Row[]>(toRows(initial));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const existing = toRows(initial);
    if (existing.length > 0) {
      setRows(existing);
      return;
    }
    // Empty profile + we know the vertical's schema → seed those fields.
    if (fields.length > 0) {
      setRows(fields.map((f) => ({ key: f.label, value: "" })));
      return;
    }
    setRows([{ key: "", value: "" }]);
  }, [open, initial, fields]);

  // Quick-add chips for any vertical field the user hasn't filled in yet.
  const filledKeysLower = useMemo(
    () => new Set(rows.map((r) => r.key.trim().toLowerCase()).filter(Boolean)),
    [rows],
  );
  const missingFields = fields.filter((f) => !filledKeysLower.has(f.label.toLowerCase()));

  function close() {
    if (saving) return;
    onClose();
  }

  function setRow(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function unitFor(label: string): string | undefined {
    const f = fields.find((x) => x.label.toLowerCase() === label.toLowerCase());
    return f?.unit;
  }

  function addField(label: string) {
    // Replace the first empty row if any; otherwise append.
    setRows((prev) => {
      const idx = prev.findIndex((r) => !r.key.trim() && !r.value.trim());
      const next = [...prev];
      const row = { key: label, value: "" };
      if (idx >= 0) next[idx] = row;
      else next.push(row);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const map: Record<string, string> = {};
    for (const r of rows) {
      const k = r.key.trim();
      if (k) map[k] = r.value.trim();
    }
    setSaving(true);
    try {
      await onSave(map);
      toast.success("Measurements saved");
      onClose();
      onSaved?.();
    } catch (err) {
      toast.error("Couldn't save measurements", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Measurements"
      description={fields.length > 0
        ? `${verticalQ.data?.name ?? "Your vertical"}: standard fields are seeded. Add or remove freely.`
        : "Record any measurements as label + value pairs."}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="measurements-form" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="measurements-form" onSubmit={submit} className="space-y-3">
        {rows.map((r, i) => {
          const unit = unitFor(r.key);
          return (
            <div key={i} className="flex items-center gap-2">
              <TextInput
                value={r.key}
                onChange={(e) => setRow(i, { key: e.target.value })}
                placeholder="Label (e.g. Chest)"
                className="flex-1"
              />
              <TextInput
                value={r.value}
                onChange={(e) => setRow(i, { value: e.target.value })}
                placeholder={unit ? `Value (${unit})` : "Value (e.g. 38in)"}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))}
                aria-label="Remove"
                className="shrink-0 rounded-md p-2 text-white/45 hover:bg-white/[0.02] hover:text-rose-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}

        {missingFields.length > 0 && (
          <div className="rounded-md border border-primary/20 bg-primary/[0.08] p-3">
            <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-primary">
              <Sparkles size={11} /> Quick add for {verticalQ.data?.name ?? "your vertical"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {missingFields.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => addField(f.label)}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-cinema-elev px-2.5 py-0.5 text-[11px] font-medium text-primary hover:bg-primary hover:text-white"
                >
                  <Plus size={10} /> {f.label}
                  {f.unit && <span className="text-white/45">· {f.unit}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, { key: "", value: "" }])}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
        >
          <Plus size={15} /> Add measurement
        </button>
      </form>
    </Modal>
  );
}
