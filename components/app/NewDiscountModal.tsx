"use client";

import { useEffect, useMemo, useState } from "react";
import { Percent, Tag, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { inventoryApi, type Product } from "@/lib/api/inventory";
import {
  discountsApi,
  type CreateDiscountInput,
  type DiscountType,
} from "@/lib/api/discounts";
import { naira } from "@/lib/format";
import { ApiError } from "@/lib/api/client";

type Errors = Partial<Record<"productId" | "discountValue" | "startsAt", string>>;

const todayIso = () => new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm

/** Create a new pharmacy discount (Spec v2 §12B). Lands in PENDING_APPROVAL
 *  until a TENANT_ADMIN approves it. Any staff role can submit. */
export function NewDiscountModal({
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

  const [productId, setProductId] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [label, setLabel] = useState("");
  const [startsAt, setStartsAt] = useState(todayIso());
  const [endsAt, setEndsAt] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setProductId("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("");
    setLabel("");
    setStartsAt(todayIso());
    setEndsAt("");
    setErrors({});
  }, [open]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId],
  );

  const previewPrice = useMemo(() => {
    const v = Number(discountValue);
    if (!selectedProduct || !discountValue || Number.isNaN(v) || v < 0) return null;
    const base = selectedProduct.price;
    if (discountType === "PERCENTAGE") {
      if (v > 100) return null;
      return Math.max(0, base * (1 - v / 100));
    }
    return Math.max(0, base - v);
  }, [selectedProduct, discountValue, discountType]);

  function validate(): boolean {
    const next: Errors = {};
    if (!productId) next.productId = "Pick the product this applies to.";
    const v = Number(discountValue);
    if (!discountValue || Number.isNaN(v) || v <= 0) {
      next.discountValue = "Enter a value greater than zero.";
    } else if (discountType === "PERCENTAGE" && v > 100) {
      next.discountValue = "Percent can't exceed 100.";
    } else if (selectedProduct && discountType === "FIXED" && v >= selectedProduct.price) {
      next.discountValue = "Fixed discount must be less than the product price.";
    }
    if (!startsAt) next.startsAt = "Pick a start date.";
    const cleaned = Object.fromEntries(Object.entries(next).filter(([, val]) => val));
    setErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const body: CreateDiscountInput = {
      productId,
      discountType,
      discountValue: Number(discountValue),
      label: label.trim() || undefined,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
    };
    setSaving(true);
    try {
      await discountsApi.create(body);
      toast.success(
        "Discount submitted",
        "An admin will review and approve it before it goes live.",
      );
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(
        "Couldn't create discount",
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
      title="New discount"
      description="Pricing changes go to an admin for approval before going live on your website."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" form="disc-form" disabled={saving}>
            {saving ? "Submitting…" : "Submit for approval"}
          </Button>
        </>
      }
    >
      <form id="disc-form" onSubmit={submit} className="space-y-4">
        <Field label="Product" htmlFor="d-product" required error={errors.productId}>
          <Select
            id="d-product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Pick a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {naira(p.price)}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Type" htmlFor="d-type">
            <Select
              id="d-type"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed amount (₦)</option>
            </Select>
          </Field>
          <Field
            label={discountType === "PERCENTAGE" ? "Discount (%)" : "Discount (₦)"}
            htmlFor="d-value"
            required
            error={errors.discountValue}
          >
            <TextInput
              id="d-value"
              inputMode="decimal"
              value={discountValue}
              error={errors.discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "PERCENTAGE" ? "20" : "500"}
            />
          </Field>
        </div>

        {selectedProduct && previewPrice != null && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-success/20 bg-emerald-500/15 px-3 py-2">
            <div className="flex items-center gap-2 text-[13px] text-white/65">
              <Percent size={14} className="text-emerald-300" />
              Customer pays
            </div>
            <div className="font-mono text-[13px]">
              <span className="text-white/45 line-through">{naira(selectedProduct.price)}</span>
              <span className="ml-2 text-emerald-300">{naira(previewPrice)}</span>
            </div>
          </div>
        )}

        <Field
          label="Label"
          htmlFor="d-label"
          hint="Optional — shown on the product card. Defaults to e.g. &ldquo;20% OFF&rdquo;."
        >
          <TextInput
            id="d-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={discountType === "PERCENTAGE" ? "e.g. June Promo" : "e.g. Loyalty discount"}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Starts" htmlFor="d-starts" required error={errors.startsAt}>
            <TextInput
              id="d-starts"
              type="datetime-local"
              value={startsAt}
              error={errors.startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </Field>
          <Field label="Ends" htmlFor="d-ends" hint="Leave blank for no expiry.">
            <TextInput
              id="d-ends"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </Field>
        </div>

        <p className="flex items-start gap-1.5 rounded-md bg-white/[0.02] px-3 py-2 text-[11px] text-white/45">
          <AlertCircle size={11} className="mt-0.5 shrink-0" />
          <span>
            <Tag size={11} className="inline -mt-0.5" /> Your discount won't be visible to customers
            until a tenant admin approves it. You'll see the status here in the discounts list.
          </span>
        </p>
      </form>
    </Modal>
  );
}
