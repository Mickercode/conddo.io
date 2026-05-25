"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";

type Row = { key: string; value: string };

const toRows = (m: Record<string, string | number> | null | undefined): Row[] =>
  m ? Object.entries(m).map(([key, value]) => ({ key, value: String(value) })) : [];

/**
 * Key/value measurement editor. Used by the customer profile and order detail
 * (both persist a free-form measurements map). `onSave` performs the PUT and
 * returns the persisted map (or throws an ApiError).
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
  const [rows, setRows] = useState<Row[]>(toRows(initial));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setRows(toRows(initial).length ? toRows(initial) : [{ key: "", value: "" }]);
  }, [open, initial]);

  function close() {
    if (saving) return;
    onClose();
  }

  function setRow(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
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
      description="Record any measurements as label + value pairs."
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
        {rows.map((r, i) => (
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
              placeholder="Value (e.g. 38in)"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))}
              aria-label="Remove"
              className="shrink-0 rounded-md p-2 text-content-muted hover:bg-neutral-surface2 hover:text-danger"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
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
