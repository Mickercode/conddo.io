"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select, TextArea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { inventoryApi, type Product } from "@/lib/api/inventory";
import {
  refillOffersApi,
  type CreateRefillOfferInput,
  type RefillDiscountType,
} from "@/lib/api/refillOffers";
import { naira } from "@/lib/format";
import { ApiError } from "@/lib/api/client";

type Errors = Partial<Record<"productId" | "discountValue" | "validDays", string>>;

const DEFAULT_MESSAGE =
  "Hi {firstName}, refill your {productName} within {validDays} days and get a discount. Use code {offerCode} at checkout.";

/** Create a refill offer (Spec v2 §12E). Configures the discount + validity
 *  window once; the pharmacist later ISSUES it to specific customers from
 *  the order/customer detail screen, which generates the redemption code. */
export function NewRefillOfferModal({
  open,
  onClose,
  tenantSlug,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  tenantSlug: string;
  onCreated?: () => void;
}) {
  const toast = useToast();
  const productsQ = useApiQuery(() => inventoryApi.list({ size: 200 }));
  const products: Product[] = productsQ.data ?? [];

  const [productId, setProductId] = useState("");
  const [discountType, setDiscountType] = useState<RefillDiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [validDays, setValidDays] = useState("30");
  const [maxUses, setMaxUses] = useState("1");
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setProductId("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("");
    setValidDays("30");
    setMaxUses("1");
    setMessage(DEFAULT_MESSAGE);
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
    const d = Number(validDays);
    if (!validDays || Number.isNaN(d) || d < 1) {
      next.validDays = "Must be at least 1 day.";
    } else if (d > 365) {
      next.validDays = "Cap is 365 days.";
    }
    const cleaned = Object.fromEntries(Object.entries(next).filter(([, val]) => val));
    setErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const body: CreateRefillOfferInput = {
      productId,
      discountType,
      discountValue: Number(discountValue),
      validDays: Number(validDays),
      maxUses: Number(maxUses) || 1,
      message: message.trim() || undefined,
    };
    setSaving(true);
    try {
      await refillOffersApi.create(tenantSlug, body);
      toast.success("Refill offer created", "Issue it from an order to send to a customer.");
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(
        "Couldn't create offer",
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
      title="New refill offer"
      description="A discount you'll later issue to specific customers after they pick up a refill, so they return for the next one."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" form="ro-form" disabled={saving}>
            {saving ? "Creating…" : "Create offer"}
          </Button>
        </>
      }
    >
      <form id="ro-form" onSubmit={submit} className="space-y-4">
        <Field label="Product" htmlFor="o-product" required error={errors.productId}>
          <Select
            id="o-product"
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
          <Field label="Type" htmlFor="o-type">
            <Select
              id="o-type"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as RefillDiscountType)}
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed amount (₦)</option>
            </Select>
          </Field>
          <Field
            label={discountType === "PERCENTAGE" ? "Discount (%)" : "Discount (₦)"}
            htmlFor="o-value"
            required
            error={errors.discountValue}
          >
            <TextInput
              id="o-value"
              inputMode="decimal"
              value={discountValue}
              error={errors.discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "PERCENTAGE" ? "10" : "500"}
            />
          </Field>
        </div>

        {selectedProduct && previewPrice != null && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-success/20 bg-success-bg px-3 py-2">
            <div className="flex items-center gap-2 text-[13px] text-content-secondary">
              <Gift size={14} className="text-success" />
              Customer pays on next refill
            </div>
            <div className="font-mono text-[13px]">
              <span className="text-content-muted line-through">{naira(selectedProduct.price)}</span>
              <span className="ml-2 text-success">{naira(previewPrice)}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Valid days"
            htmlFor="o-days"
            required
            error={errors.validDays}
            hint="How long after issue the code stays valid."
          >
            <TextInput
              id="o-days"
              inputMode="numeric"
              value={validDays}
              error={errors.validDays}
              onChange={(e) => setValidDays(e.target.value)}
              placeholder="30"
            />
          </Field>
          <Field label="Max uses per customer" htmlFor="o-uses">
            <TextInput
              id="o-uses"
              inputMode="numeric"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="1"
            />
          </Field>
        </div>

        <Field label="SMS message" htmlFor="o-msg" hint="Sent when you issue this offer to a customer.">
          <TextArea
            id="o-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder={DEFAULT_MESSAGE}
          />
          <p className="mt-1.5 text-[11px] text-content-muted">
            Variables: <code className="rounded bg-neutral-surface2 px-1">{"{firstName}"}</code>{" "}
            <code className="rounded bg-neutral-surface2 px-1">{"{productName}"}</code>{" "}
            <code className="rounded bg-neutral-surface2 px-1">{"{validDays}"}</code>{" "}
            <code className="rounded bg-neutral-surface2 px-1">{"{offerCode}"}</code>
          </p>
        </Field>

        <p className="flex items-start gap-1.5 rounded-md bg-neutral-surface2 px-3 py-2 text-[11px] text-content-muted">
          <AlertCircle size={11} className="mt-0.5 shrink-0" />
          The discount code is generated when you issue this offer to a specific customer — not now. Issue from an order detail after dispense, or from the customer profile.
        </p>
      </form>
    </Modal>
  );
}
