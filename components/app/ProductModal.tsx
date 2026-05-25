"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { inventoryApi, type Product, type Category } from "@/lib/api/inventory";
import { ApiError } from "@/lib/api/client";

type Errors = Partial<Record<"name" | "price" | "stock" | "reorder", string>>;

const numErr = (v: string) => (v && (Number.isNaN(Number(v)) || Number(v) < 0) ? "Enter a valid number." : undefined);

/** Create or edit an inventory product (POST/PATCH /inventory/products).
 *  Pass `product` to edit; omit to create. */
export function ProductModal({
  open,
  onClose,
  product,
  categories,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: Category[];
  onSaved?: (p: Product) => void;
}) {
  const toast = useToast();
  const editing = Boolean(product);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [reorder, setReorder] = useState("");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(product?.name ?? "");
    setSku(product?.sku ?? "");
    setCategoryId(product?.categoryId ?? "");
    setPrice(product?.price != null ? String(product.price) : "");
    setStock(product?.stock != null ? String(product.stock) : "");
    setReorder(product?.reorderThreshold != null ? String(product.reorderThreshold) : "");
    setActive(product?.active ?? true);
    setErrors({});
  }, [open, product]);

  function close() {
    if (saving) return;
    onClose();
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!name.trim()) next.name = "Product name is required.";
    next.price = numErr(price);
    next.stock = numErr(stock);
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
      categoryId: categoryId || undefined,
      price: price ? Number(price) : undefined,
      stock: stock ? Number(stock) : undefined,
      reorderThreshold: reorder ? Number(reorder) : undefined,
      active,
    };
    setSaving(true);
    try {
      const { data } = product
        ? await inventoryApi.update(product.id, body)
        : await inventoryApi.create(body);
      toast.success(editing ? "Product updated" : "Product added", data.name);
      onClose();
      onSaved?.(data);
    } catch (err) {
      toast.error(editing ? "Couldn't update product" : "Couldn't add product",
        err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={editing ? "Edit product" : "Add product"}
      description={editing ? undefined : "Add a product to track stock and get low-stock alerts."}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="product-form" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add product"}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} className="space-y-4">
        <Field label="Product name" htmlFor="pr-name" required error={errors.name}>
          <TextInput id="pr-name" value={name} error={errors.name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ankara fabric (2yds)" autoFocus />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="SKU" htmlFor="pr-sku">
            <TextInput id="pr-sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Optional" />
          </Field>
          <Field label="Category" htmlFor="pr-cat">
            <Select id="pr-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Uncategorised</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Price (₦)" htmlFor="pr-price" error={errors.price}>
            <TextInput id="pr-price" inputMode="decimal" value={price} error={errors.price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Stock" htmlFor="pr-stock" error={errors.stock}>
            <TextInput id="pr-stock" inputMode="numeric" value={stock} error={errors.stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Reorder at" htmlFor="pr-reorder" error={errors.reorder} hint="Low-stock alert">
            <TextInput id="pr-reorder" inputMode="numeric" value={reorder} error={errors.reorder} onChange={(e) => setReorder(e.target.value)} placeholder="0" />
          </Field>
        </div>
        <label className="flex items-center gap-2.5">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded border-neutral-border text-primary focus:ring-primary" />
          <span className="text-[14px] text-content-secondary">Active (visible & sellable)</span>
        </label>
      </form>
    </Modal>
  );
}
