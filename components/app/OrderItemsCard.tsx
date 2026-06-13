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
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-cinema-elev">
      <div className="flex items-center justify-between border-b border-white/[0.06] p-6">
        <h3 className="text-[16px] font-medium text-white">Order Items</h3>
        {!isAdding && (
          <Button variant="secondary" size="md" onClick={openAdd} disabled={busy}>
            <Plus size={14} /> Add item
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="bg-white/[0.02] text-[11px] uppercase tracking-[0.05em] text-white/45">
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 text-right font-medium">Qty</th>
              <th className="px-6 py-3 text-right font-medium">Unit Price</th>
              <th className="px-6 py-3 text-right font-medium">Total</th>
              <th className="px-6 py-3 text-right font-medium">{/* actions */}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
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
                  <td className="px-6 py-4 text-[14px] text-white">{it.description ?? it.name ?? "—"}</td>
                  <td className="px-6 py-4 text-right font-mono text-[14px] text-white">{it.quantity ?? 1}</td>
                  <td className="px-6 py-4 text-right font-mono text-[14px] text-white">{naira(it.unitPrice ?? 0)}</td>
                  <td className="px-6 py-4 text-right font-mono text-[14px] text-white">{naira(it.total ?? lineTotal)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openEdit(it)}
                        disabled={busy || !it.id}
                        aria-label="Edit"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/45 hover:bg-primary/[0.08] hover:text-primary disabled:opacity-40"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(it)}
                        disabled={busy || !it.id}
                        aria-label="Delete"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/45 hover:bg-rose-500/[0.06] hover:text-rose-200 disabled:opacity-40"
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
                <td colSpan={5} className="px-6 py-8 text-center text-[14px] text-white/65">
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
    <tr className={isNew ? "bg-primary/[0.08]/30" : "bg-white/[0.02]"}>
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
          className="h-9 w-full rounded-md border border-white/10 bg-cinema-base px-3 text-[14px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none"
        />
      </td>
      <td className="px-6 py-3">
        <input
          inputMode="numeric"
          value={draft.quantity}
          onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
          className="h-9 w-20 rounded-md border border-white/10 bg-cinema-base px-2 text-right font-mono text-[13px] text-white focus:border-primary-light focus:outline-none"
        />
      </td>
      <td className="px-6 py-3">
        <input
          inputMode="decimal"
          value={draft.unitPrice}
          onChange={(e) => setDraft({ ...draft, unitPrice: e.target.value })}
          className="h-9 w-28 rounded-md border border-white/10 bg-cinema-base px-2 text-right font-mono text-[13px] text-white focus:border-primary-light focus:outline-none"
        />
      </td>
      <td className="px-6 py-3 text-right font-mono text-[13px] text-white/65">{naira(preview)}</td>
      <td className="px-6 py-3 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            aria-label="Save"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-300 hover:bg-emerald-500/15 disabled:opacity-50"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label="Cancel"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/45 hover:bg-cinema-elev hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
