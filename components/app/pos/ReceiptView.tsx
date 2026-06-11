"use client";

import { Printer, X, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { naira } from "@/lib/format";
import type { PosReceipt } from "@/lib/api/pos";

const fmtTime = (s: string) => {
  const d = new Date(s);
  return isNaN(d.getTime())
    ? s
    : d.toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

/** Receipt preview + print. Renders to a monospace 80mm-style block so the
 *  browser-print path uses the same template as a thermal printer would
 *  (Phase 2 ESC/POS lands as a separate adapter that consumes this same
 *  data). Print uses an inline @media print stylesheet so only this card
 *  hits the printer — no nav, no sidebar. */
export function ReceiptView({
  receipt,
  onNewSale,
  onClose,
}: {
  receipt: PosReceipt;
  /** Called when the cashier hits "Next sale" — typically resets the
   *  parent's sale state. */
  onNewSale: () => void;
  /** Optional dismiss without starting another sale. */
  onClose?: () => void;
}) {
  function print() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <>
      {/* Print-only stylesheet — when window.print() fires, hide everything
          except this receipt's outer wrapper. */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #pos-receipt-print, #pos-receipt-print * { visibility: visible; }
          #pos-receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 8mm 4mm;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 11px;
            color: #000;
            background: #fff;
          }
        }
      `}</style>

      <div className="rounded-2xl border border-neutral-border bg-neutral-surface">
        {/* Header — success state */}
        <div className="border-b border-neutral-border p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-success" />
              <h2 className="text-[16px] font-medium text-ink">Sale complete</h2>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-content-muted hover:bg-neutral-surface2 hover:text-ink"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {receipt.change > 0 && (
            <p className="mt-2 text-[13px] text-content-secondary">
              Give the customer <span className="font-mono font-medium text-primary">{naira(receipt.change)}</span> in change.
            </p>
          )}
          {receipt.loyaltyEarned ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-success">
              <Sparkles size={11} /> {naira(receipt.loyaltyEarned)} cashback credited to customer wallet.
            </p>
          ) : null}
        </div>

        {/* Receipt body */}
        <div id="pos-receipt-print" className="px-5 py-4 font-mono text-[12px] leading-relaxed">
          {/* Tenant header */}
          <div className="border-b border-dashed border-neutral-strong pb-2 text-center">
            <p className="text-[14px] font-medium text-ink">{receipt.tenant.name}</p>
            {receipt.tenant.address && <p className="text-[11px] text-content-secondary">{receipt.tenant.address}</p>}
            {receipt.tenant.phone && <p className="text-[11px] text-content-secondary">{receipt.tenant.phone}</p>}
          </div>

          {/* Sale meta */}
          <div className="my-2 flex items-center justify-between text-[11px] text-content-muted">
            <span>{receipt.saleNumber}</span>
            <span>{fmtTime(receipt.completedAt)}</span>
          </div>
          {receipt.cashierName && (
            <p className="text-[11px] text-content-muted">Cashier: {receipt.cashierName}</p>
          )}

          {/* Lines */}
          <div className="my-3 border-y border-dashed border-neutral-strong py-2">
            {receipt.lines.map((it) => (
              <div key={it.id} className="mb-1.5 last:mb-0">
                <div className="flex justify-between gap-2">
                  <span className="text-ink">{it.productName}</span>
                  <span className="text-ink">{naira(it.lineTotal)}</span>
                </div>
                <div className="text-content-muted">
                  {it.qty} × {naira(it.unitPrice)}
                  {it.sku && <span className="ml-1.5">· {it.sku}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-content-secondary">Subtotal</span>
              <span className="text-ink">{naira(receipt.subtotal)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-border pt-1">
              <span className="text-ink">Total</span>
              <span className="text-[14px] font-medium text-ink">{naira(receipt.total)}</span>
            </div>
          </div>

          {/* Payments */}
          <div className="my-3 space-y-1 border-t border-dashed border-neutral-strong pt-2">
            {receipt.payments.map((p) => (
              <div key={p.id} className="flex justify-between">
                <span className="text-content-secondary">
                  {p.method === "CASH" ? "Cash" : "Transfer"}
                  {p.reference && <span className="ml-1.5 text-[10px]">({p.reference})</span>}
                </span>
                <span className="text-ink">{naira(p.amount)}</span>
              </div>
            ))}
            {receipt.change > 0 && (
              <div className="flex justify-between">
                <span className="text-content-secondary">Change</span>
                <span className="text-ink">{naira(receipt.change)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="mt-3 border-t border-dashed border-neutral-strong pt-2 text-center text-[10px] text-content-muted">
            Thank you for shopping with us.
          </p>
        </div>

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-border p-4">
          <Button variant="secondary" size="md" onClick={print}>
            <Printer size={14} /> Print receipt
          </Button>
          <Button variant="primary" size="md" onClick={onNewSale}>
            New sale
          </Button>
        </div>
      </div>
    </>
  );
}
