"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { inventoryApi, type Product } from "@/lib/api/inventory";
import { ApiError } from "@/lib/api/client";

type Errors = Partial<Record<"name" | "yards" | "price" | "reorder", string>>;

const numErr = (v: string) => (v && (Number.isNaN(Number(v)) || Number(v) < 0) ? "Enter a valid number." : undefined);

/** Add / edit a fabric SKU. Backs onto the generic inventory product endpoint
 *  with fashion-tailored copy: "Stock" → "Yards in stock", "Price" → "Price per yard",
 *  "Product name" → "Fabric". The garment shop never sees the word "product". */
export function NewFabricModal({
  open,
  onClose,
  fabric,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  fabric?: Product | null;
  onSaved?: (p: Product) => void;
}) {
  const toast = useToast();
  const editing = Boolean(fabric);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [yards, setYards] = useState("");
  const [price, setPrice] = useState("");
  const [reorder, setReorder] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(fabric?.name ?? "");
    setSku(fabric?.sku ?? "");
    setYards(fabric?.stock != null ? String(fabric.stock) : "");
    setPrice(fabric?.price != null ? String(fabric.price) : "");
    setReorder(fabric?.reorderThreshold != null ? String(fabric.reorderThreshold) : "");
    setErrors({});
  }, [open, fabric]);

  function close() {
    if (saving) return;
    onClose();
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!name.trim()) next.name = "Fabric name is required.";
    next.yards = numErr(yards);
    next.price = numErr(price);
    next.reorder = numErr(reorder);
    const cleaned = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    setErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const body = {
      name: name.trim(),
      sku: sku.trim() || undefined,
      stock: yards ? Number(yards) : undefined,
      price: price ? Number(price) : undefined,
      reorderThreshold: reorder ? Number(reorder) : undefined,
      active: true,
    };
    setSaving(true);
    try {
      const { data } = fabric
        ? await inventoryApi.update(fabric.id, body)
        : await inventoryApi.create(body);
      toast.success(editing ? "Fabric updated" : "Fabric added", data.name);
      onClose();
      onSaved?.(data);
    } catch (err) {
      toast.error(editing ? "Couldn't update fabric" : "Couldn't add fabric",
        err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={editing ? "Edit fabric" : "Add fabric"}
      description={editing ? undefined : "Track a fabric SKU — yards in stock, supplier reference, and price per yard."}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="new-fabric-form" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add fabric"}
          </Button>
        </>
      }
    >
      <form id="new-fabric-form" onSubmit={submit} className="space-y-4">
        <Field label="Fabric" htmlFor="nfb-name" required error={errors.name} hint="Type and colour, e.g. “Cotton Ankara — Royal Blue.”">
          <TextInput
            id="nfb-name"
            value={name}
            error={errors.name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Silk Charmeuse — Ivory"
            autoFocus
          />
        </Field>
        <Field label="Supplier reference (SKU)" htmlFor="nfb-sku" hint="Optional. Code from the supplier or your own.">
          <TextInput id="nfb-sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. LTX-CB-0234" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Yards in stock" htmlFor="nfb-yards" error={errors.yards}>
            <TextInput id="nfb-yards" inputMode="decimal" value={yards} error={errors.yards} onChange={(e) => setYards(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Price / yard (₦)" htmlFor="nfb-price" error={errors.price}>
            <TextInput id="nfb-price" inputMode="decimal" value={price} error={errors.price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Reorder when below" htmlFor="nfb-reorder" error={errors.reorder} hint="Low-stock alert">
            <TextInput id="nfb-reorder" inputMode="decimal" value={reorder} error={errors.reorder} onChange={(e) => setReorder(e.target.value)} placeholder="0" />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
