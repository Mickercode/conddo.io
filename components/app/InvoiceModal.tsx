"use client";

import { Printer, X, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { naira } from "@/lib/format";
import type { OrderDetail } from "@/lib/api/orders";

// Print stylesheet — when the user hits Print, the browser's Save-as-PDF
// option is one of the destinations they can pick. We hide everything on
// the page except the invoice surface, and unwind any chrome (modal
// backdrop, AppShell, sidebar) so the printed page is just the invoice.
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  .conddo-invoice-printable, .conddo-invoice-printable * { visibility: visible !important; }
  .conddo-invoice-printable {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    padding: 24px !important;
    background: #ffffff !important;
    color: #111111 !important;
  }
  .conddo-invoice-no-print { display: none !important; }
  /* Strip the modal's gradient + borders for clean printing. */
  .conddo-invoice-printable .conddo-invoice-page {
    box-shadow: none !important;
    border: 1px solid #e5e5e5 !important;
    background: #ffffff !important;
  }
}
`;

function fmtDate(s?: string | null): string {
  if (!s) return new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

/** Order-derived invoice. No backend Invoice entity — uses what the order
 *  already exposes: reference + customer + items + billing.{total,deposit,balance}.
 *  Print → browser's "Save as PDF" destination produces a clean A4. */
export function InvoiceModal({
  order,
  open,
  onClose,
}: {
  order: OrderDetail;
  open: boolean;
  onClose: () => void;
}) {
  const { data: me } = useApiQuery(meQuery);
  if (!open) return null;

  const tenant = me?.tenant;
  const customer = typeof order.customer === "string" ? { name: order.customer } : order.customer ?? {};
  const items = order.items ?? [];
  const computedSubtotal = items.reduce((sum, it) => {
    if (it.total != null) return sum + Number(it.total);
    const q = Number(it.quantity ?? 1);
    const p = Number(it.unitPrice ?? 0);
    return sum + q * p;
  }, 0);
  const subtotal = computedSubtotal > 0 ? computedSubtotal : order.billing.total;

  return (
    <div className="conddo-invoice-printable fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-10">
      <style>{PRINT_CSS}</style>
      <div className="conddo-invoice-page w-full max-w-2xl rounded-lg bg-white p-10 shadow-xl">
        {/* Header */}
        <div className="conddo-invoice-no-print mb-6 flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-content-muted">Invoice preview</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-content-muted hover:bg-neutral-surface2 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {/* Business header */}
        <div className="mb-8 flex items-start justify-between border-b border-neutral-border pb-6">
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.01em] text-ink">{tenant?.name ?? "Your business"}</h1>
            <p className="mt-0.5 font-mono text-[12px] text-content-muted">
              {tenant?.subdomain ? `${tenant.subdomain}.conddo.io` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[20px] font-bold uppercase tracking-[0.1em] text-primary">INVOICE</p>
            <p className="mt-1 font-mono text-[12px] text-content-secondary">{order.reference}</p>
            <p className="mt-0.5 font-mono text-[12px] text-content-muted">{fmtDate(order.orderedAt)}</p>
          </div>
        </div>

        {/* Bill-to + meta */}
        <div className="mb-8 grid grid-cols-2 gap-8">
          <div>
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.06em] text-content-muted">Bill to</p>
            <p className="text-[14px] font-medium text-ink">{customer.name ?? "—"}</p>
            {customer.phone && <p className="text-[13px] text-content-secondary">{customer.phone}</p>}
            {customer.email && <p className="text-[13px] text-content-secondary">{customer.email}</p>}
          </div>
          <div className="text-right">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.06em] text-content-muted">Status</p>
            <p className="text-[14px] font-medium text-ink">{order.stage}</p>
            {order.dueDate && (
              <>
                <p className="mt-3 mb-1 text-[11px] font-medium uppercase tracking-[0.06em] text-content-muted">Due</p>
                <p className="text-[14px] font-medium text-ink">{fmtDate(order.dueDate)}</p>
              </>
            )}
          </div>
        </div>

        {/* Service */}
        {order.service && (
          <div className="mb-6">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.06em] text-content-muted">Service</p>
            <p className="text-[14px] text-ink">{order.service}</p>
          </div>
        )}

        {/* Line items */}
        <table className="mb-8 w-full text-left">
          <thead>
            <tr className="border-b border-neutral-border text-[11px] uppercase tracking-[0.05em] text-content-muted">
              <th className="py-2 pr-3 font-medium">Description</th>
              <th className="py-2 pr-3 text-right font-medium">Qty</th>
              <th className="py-2 pr-3 text-right font-medium">Unit</th>
              <th className="py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((it, i) => {
                const q = Number(it.quantity ?? 1);
                const p = Number(it.unitPrice ?? 0);
                const total = it.total != null ? Number(it.total) : q * p;
                return (
                  <tr key={it.id ?? i} className="border-b border-neutral-border/50">
                    <td className="py-2.5 pr-3 text-[13px] text-ink">{it.description ?? it.name ?? "Item"}</td>
                    <td className="py-2.5 pr-3 text-right font-mono text-[13px] text-content-secondary">{q}</td>
                    <td className="py-2.5 pr-3 text-right font-mono text-[13px] text-content-secondary">{p > 0 ? naira(p) : "—"}</td>
                    <td className="py-2.5 text-right font-mono text-[13px] text-ink">{naira(total)}</td>
                  </tr>
                );
              })
            ) : (
              // No itemised lines on this order — render a single-row summary so
              // the invoice still has a body to show.
              <tr className="border-b border-neutral-border/50">
                <td className="py-2.5 pr-3 text-[13px] text-ink">{order.service ?? "Service"}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-[13px] text-content-secondary">1</td>
                <td className="py-2.5 pr-3 text-right font-mono text-[13px] text-content-secondary">{naira(order.billing.total)}</td>
                <td className="py-2.5 text-right font-mono text-[13px] text-ink">{naira(order.billing.total)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="ml-auto w-full max-w-xs space-y-2 text-[13px]">
          <div className="flex justify-between">
            <span className="text-content-secondary">Subtotal</span>
            <span className="font-mono text-ink">{naira(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-content-secondary">Deposit paid</span>
            <span className="font-mono text-success">{naira(order.billing.deposit)}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-border pt-2 text-[15px] font-medium">
            <span className="text-ink">Balance due</span>
            <span className="font-mono text-warning">{naira(order.billing.balance)}</span>
          </div>
        </div>

        {order.notes && (
          <div className="mt-8 border-t border-neutral-border pt-5">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.06em] text-content-muted">Notes</p>
            <p className="text-[13px] leading-relaxed text-content-secondary">{order.notes}</p>
          </div>
        )}

        <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-content-muted">
          Thank you for your business — Powered by Conddo.io
        </p>

        {/* Action bar (hidden when printing) */}
        <div className="conddo-invoice-no-print mt-8 flex justify-end gap-2 border-t border-neutral-border pt-5">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="md" onClick={() => window.print()}>
            <Printer size={15} /> Print / Save as PDF
          </Button>
          <span className="hidden items-center gap-1 text-[11px] text-content-muted sm:inline-flex">
            <Download size={12} /> Choose "Save as PDF" in the print dialog
          </span>
        </div>
      </div>
    </div>
  );
}
