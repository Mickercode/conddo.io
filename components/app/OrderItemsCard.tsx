"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { naira } from "@/lib/format";
import {
  ordersApi,
  type OrderItem,
  type CreateOrderItemInput,
  type UpdateOrderItemInput,
} from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";

type RowDraft = {
  description: string;
  quantity: string;
  unitPrice: string;
};

/** Inline-editable order items table. Add / Edit / Delete each call the BE
 *  line-item endpoints and notify the parent on change (which re-fetches
 *  the order to refresh totals etc). */
export function OrderItemsCard({
  orderId,
  items,
  onChanged,
}: {
  orderId: string;
  items: OrderItem[];
  onChanged: () => void;
}) {
  const toast = useToast();
  // `null` = nobody editing. `"__new__"` = the "Add item" row is open.
  // Otherwise = id of the row being edited.
  const [editingKey, setEditingKey] = useState<string | "__new__" | null>(null);
  const [draft, setDraft] = useState<RowDraft>({ description: "", quantity: "1", unitPrice: "0" });
  const [busy, setBusy] = useState(false);

  function openAdd() {
    setEditingKey("__new__");
    setDraft({ description: "", quantity: "1", unitPrice: "0" });
  }

  function openEdit(it: OrderItem) {
    if (!it.id) return;
    setEditingKey(it.id);
    setDraft({
      description: it.description ?? it.name ?? "",
      quantity: String(it.quantity ?? 1),
      unitPrice: String(it.unitPrice ?? 0),
    });
  }

  function cancel() {
    if (busy) return;
    setEditingKey(null);
  }

  async function save() {
    const desc = draft.description.trim();
    const qty = Number(draft.quantity);
    const price = Number(draft.unitPrice);
    if (!desc) {
      toast.error("Description required");
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("Quantity must be a positive number");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Unit price can't be negative");
      return;
    }
    setBusy(true);
    try {
      if (editingKey === "__new__") {
        const body: CreateOrderItemInput = { description: desc, quantity: qty, unitPrice: price };
        await ordersApi.addItem(orderId, body);
        toast.success("Item added", desc);
      } else if (editingKey) {
        const body: UpdateOrderItemInput = { description: desc, quantity: qty, unitPrice: price };
        await ordersApi.updateItem(orderId, editingKey, body);
        toast.success("Item updated", desc);
      }
      setEditingKey(null);
      onChanged();
    } catch (err) {
      toast.error("Couldn't save item", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(it: OrderItem) {
    if (!it.id) return;
    if (!window.confirm(`Remove "${it.description ?? it.name ?? "this item"}" from the order?`)) return;
    setBusy(true);
    try {
      await ordersApi.removeItem(orderId, it.id);
      toast.success("Item removed");
      onChanged();
    } catch (err) {
      toast.error("Couldn't remove item", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const isAdding = editingKey === "__new__";

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-border bg-neutral-surface">
      <div className="flex items-center justify-between border-b border-neutral-border p-6">
        <h3 className="text-[16px] font-medium text-ink">Order Items</h3>
        {!isAdding && (
          <Button variant="secondary" size="md" onClick={openAdd} disabled={busy}>
            <Plus size={14} /> Add item
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="bg-neutral-surface2 text-[11px] uppercase tracking-[0.05em] text-content-muted">
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 text-right font-medium">Qty</th>
              <th className="px-6 py-3 text-right font-medium">Unit Price</th>
              <th className="px-6 py-3 text-right font-medium">Total</th>
              <th className="px-6 py-3 text-right font-medium">{/* actions */}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            {items.map((it, i) => {
              const editingThis = editingKey === it.id && it.id != null;
              const lineTotal = (it.quantity ?? 1) * (it.unitPrice ?? 0);
              if (editingThis) {
                return (
                  <EditRow
                    key={it.id ?? i}
                    draft={draft}
                    setDraft={setDraft}
                    busy={busy}
                    onSave={save}
                    onCancel={cancel}
                  />
                );
              }
              return (
                <tr key={it.id ?? i} className="group">
                  <td className="px-6 py-4 text-[14px] text-ink">{it.description ?? it.name ?? "—"}</td>
                  <td className="px-6 py-4 text-right font-mono text-[14px] text-ink">{it.quantity ?? 1}</td>
                  <td className="px-6 py-4 text-right font-mono text-[14px] text-ink">{naira(it.unitPrice ?? 0)}</td>
                  <td className="px-6 py-4 text-right font-mono text-[14px] text-ink">{naira(it.total ?? lineTotal)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openEdit(it)}
                        disabled={busy || !it.id}
                        aria-label="Edit"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-content-muted hover:bg-primary-bg hover:text-primary disabled:opacity-40"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(it)}
                        disabled={busy || !it.id}
                        aria-label="Delete"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-content-muted hover:bg-danger-bg hover:text-danger disabled:opacity-40"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {isAdding && (
              <EditRow
                draft={draft}
                setDraft={setDraft}
                busy={busy}
                onSave={save}
                onCancel={cancel}
                isNew
              />
            )}
            {items.length === 0 && !isAdding && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[14px] text-content-secondary">
                  No items on this order yet.{" "}
                  <button
                    type="button"
                    onClick={openAdd}
                    className="font-medium text-primary hover:underline"
                  >
                    Add the first one →
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditRow({
  draft,
  setDraft,
  busy,
  onSave,
  onCancel,
  isNew,
}: {
  draft: RowDraft;
  setDraft: (d: RowDraft) => void;
  busy: boolean;
  onSave: () => void;
  onCancel: () => void;
  isNew?: boolean;
}) {
  const qty = Number(draft.quantity);
  const price = Number(draft.unitPrice);
  const preview = Number.isFinite(qty) && Number.isFinite(price) ? qty * price : 0;
  return (
    <tr className={isNew ? "bg-primary-bg/30" : "bg-neutral-surface2"}>
      <td className="px-6 py-3">
        <input
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); onSave(); }
            if (e.key === "Escape") onCancel();
          }}
          autoFocus
          placeholder="What's on this line?"
          className="h-9 w-full rounded-md border border-neutral-strong bg-neutral-bg px-3 text-[14px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none"
        />
      </td>
      <td className="px-6 py-3">
        <input
          inputMode="numeric"
          value={draft.quantity}
          onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
          className="h-9 w-20 rounded-md border border-neutral-strong bg-neutral-bg px-2 text-right font-mono text-[13px] text-ink focus:border-primary focus:outline-none"
        />
      </td>
      <td className="px-6 py-3">
        <input
          inputMode="decimal"
          value={draft.unitPrice}
          onChange={(e) => setDraft({ ...draft, unitPrice: e.target.value })}
          className="h-9 w-28 rounded-md border border-neutral-strong bg-neutral-bg px-2 text-right font-mono text-[13px] text-ink focus:border-primary focus:outline-none"
        />
      </td>
      <td className="px-6 py-3 text-right font-mono text-[13px] text-content-secondary">{naira(preview)}</td>
      <td className="px-6 py-3 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            aria-label="Save"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-success hover:bg-success-bg disabled:opacity-50"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label="Cancel"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-content-muted hover:bg-neutral-surface hover:text-ink"
          >
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
