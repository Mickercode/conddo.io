"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ScanLine, Search, Wallet, User, Trash2, Plus, Minus, ShoppingCart,
  Loader2, X, AlertCircle, Hash, Clock, CheckCircle2, LogOut,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { BetaFeatureGate } from "@/components/app/BetaFeatureGate";
import { OpenShiftModal } from "@/components/app/pos/OpenShiftModal";
import { CloseShiftModal } from "@/components/app/pos/CloseShiftModal";
import { PaymentModal } from "@/components/app/pos/PaymentModal";
import { AttachCustomerModal } from "@/components/app/pos/AttachCustomerModal";
import { ReceiptView } from "@/components/app/pos/ReceiptView";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { verticalOf } from "@/lib/verticalCopy";
import { naira } from "@/lib/format";
import {
  posApi,
  type PosSale,
  type PosSession,
  type PosProductHit,
} from "@/lib/api/pos";
import { ApiError } from "@/lib/api/client";

// Treat input as a scanner-emitted barcode (vs. typed name search) when it's
// long-enough digits — most pharmaceutical barcodes (GTIN-8/12/13/14) qualify.
const BARCODE_PATTERN = /^\d{8,14}$/;

/** Pluck the first BE-shaped {field, message} entry from an ApiError's
 *  details array, defending against the `unknown` typing on the field. */
function firstDetailMessage(err: ApiError): string | undefined {
  const d = err.details as unknown;
  if (Array.isArray(d) && d.length > 0 && typeof d[0] === "object" && d[0] !== null) {
    const entry = d[0] as { message?: unknown };
    if (typeof entry.message === "string") return entry.message;
  }
  return undefined;
}

const fmtTime = (s?: string | null) => {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d.getTime())
    ? s
    : d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
};

export default function PosPage() {
  const { data: me } = useApiQuery(meQuery);
  const isPharmacy = verticalOf(me) === "pharmacy";

  return (
    <AppShell title="POS" subtitle="Point of sale">
      {!isPharmacy ? (
        <EmptyState
          icon={ScanLine}
          title="POS is rolling out to pharmacy first"
          description="The in-store sale + cash management surface is built around pharmacy walk-in flows. Other verticals will follow as patterns generalise."
        />
      ) : (
        <BetaFeatureGate
          featureKey="pos"
          featureName="Point of Sale"
          description="Ring up walk-in sales, take cash + transfer payments, and close the shift with a counted cash reconciliation."
        >
          <PosBody />
        </BetaFeatureGate>
      )}
    </AppShell>
  );
}

function PosBody() {
  const toast = useToast();
  const sessionQ = useApiQuery(posApi.currentSession);

  const [sale, setSale] = useState<PosSale | null>(null);
  const [completedReceipt, setCompletedReceipt] = useState<PosSale["receipt"] | null>(null);
  const [openShiftOpen, setOpenShiftOpen] = useState(false);
  const [closeShiftOpen, setCloseShiftOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [attachCustomerOpen, setAttachCustomerOpen] = useState(false);
  const [startingSale, setStartingSale] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [voiding, setVoiding] = useState(false);

  const session = sessionQ.data;
  // Show the open-shift modal automatically when there's no current session.
  useEffect(() => {
    if (!sessionQ.loading && !session) setOpenShiftOpen(true);
  }, [sessionQ.loading, session]);

  // ----- Sale lifecycle -----

  async function startSale() {
    setStartingSale(true);
    try {
      const { data } = await posApi.createSale();
      setSale(data);
      setCompletedReceipt(null);
    } catch (err) {
      toast.error("Couldn't start sale", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setStartingSale(false);
    }
  }

  async function complete() {
    if (!sale) return;
    setCompleting(true);
    try {
      const { data } = await posApi.completeSale(sale.id);
      if (data.receipt) {
        setCompletedReceipt(data.receipt);
        setSale(null);
      } else {
        setSale(data);
      }
      sessionQ.refetch();
      toast.success("Sale complete", `${data.saleNumber} · ${naira(data.total)}`);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.code === "PAYMENT_INSUFFICIENT") {
        toast.error("Payment short", "Take the remaining balance before completing.");
        setPaymentOpen(true);
      } else if (apiErr?.code === "SALE_HAS_NO_ITEMS") {
        toast.error("Cart's empty", "Add at least one product before completing.");
      } else {
        toast.error("Couldn't complete", apiErr?.message ?? "Please try again.");
      }
    } finally {
      setCompleting(false);
    }
  }

  async function voidSale() {
    if (!sale) return;
    if (!window.confirm("Void this sale? Nothing leaves inventory and no payment is recorded.")) return;
    setVoiding(true);
    try {
      await posApi.voidSale(sale.id);
      toast.success("Sale voided");
      setSale(null);
    } catch (err) {
      toast.error("Couldn't void", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setVoiding(false);
    }
  }

  // ----- Empty session screen -----

  if (sessionQ.loading) {
    return <div className="flex items-center justify-center py-20 text-content-muted"><Loader2 className="animate-spin" /></div>;
  }

  if (!session) {
    return (
      <>
        <EmptyState
          icon={ScanLine}
          title="Open a shift to start"
          description="Count the cash in the till and open a shift. Every sale you ring up will be reconciled against that opening float at end-of-day."
          action={<Button variant="primary" size="md" onClick={() => setOpenShiftOpen(true)}><Plus size={15} /> Open shift</Button>}
        />
        <OpenShiftModal
          open={openShiftOpen}
          onClose={() => setOpenShiftOpen(false)}
          onOpened={() => sessionQ.refetch()}
        />
      </>
    );
  }

  // ----- Receipt screen (post-complete) -----

  if (completedReceipt) {
    return (
      <div className="mx-auto max-w-2xl">
        <ReceiptView
          receipt={completedReceipt}
          onNewSale={() => { setCompletedReceipt(null); startSale(); }}
          onClose={() => setCompletedReceipt(null)}
        />
      </div>
    );
  }

  // ----- Main POS screen -----

  return (
    <div className="space-y-4">
      <SessionHeader session={session} onClose={() => setCloseShiftOpen(true)} />

      {!sale ? (
        <EmptyState
          icon={ShoppingCart}
          title="Ready when you are"
          description="Start a new sale to add products and take payment."
          action={
            <Button variant="primary" size="md" onClick={startSale} disabled={startingSale}>
              {startingSale ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Start sale
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <ProductPicker
            sale={sale}
            onSaleChanged={setSale}
          />
          <CartCard
            sale={sale}
            onSaleChanged={setSale}
            onAttachCustomer={() => setAttachCustomerOpen(true)}
            onTakePayment={() => setPaymentOpen(true)}
            onComplete={complete}
            onVoid={voidSale}
            completing={completing}
            voiding={voiding}
          />
        </div>
      )}

      <CloseShiftModal
        open={closeShiftOpen}
        onClose={() => setCloseShiftOpen(false)}
        session={session}
        onClosed={() => { sessionQ.refetch(); setSale(null); }}
      />
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        sale={sale}
        onSaleChanged={setSale}
      />
      <AttachCustomerModal
        open={attachCustomerOpen}
        onClose={() => setAttachCustomerOpen(false)}
        sale={sale}
        onSaleChanged={setSale}
      />
    </div>
  );
}

function SessionHeader({ session, onClose }: { session: PosSession; onClose: () => void }) {
  const summary = session.summary;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-border bg-neutral-surface px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-[13px]">
        <span className="inline-flex items-center gap-1.5 font-medium text-ink">
          <CheckCircle2 size={14} className="text-success" />
          Shift open
        </span>
        <span className="inline-flex items-center gap-1.5 text-content-secondary">
          <Clock size={12} /> {fmtTime(session.openedAt)}
        </span>
        {summary && (
          <>
            <span className="inline-flex items-center gap-1.5 text-content-secondary">
              <ShoppingCart size={12} /> {summary.salesCount} sale{summary.salesCount === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-content-secondary">
              <Wallet size={12} /> {naira(summary.totalSales)} total
            </span>
            <Chip tone="neutral">cash {naira(summary.totalCash)}</Chip>
            <Chip tone="neutral">transfer {naira(summary.totalTransfer)}</Chip>
          </>
        )}
      </div>
      <Button variant="secondary" size="md" onClick={onClose}>
        <LogOut size={14} /> End shift
      </Button>
    </div>
  );
}

// ---------- Product picker ----------

function ProductPicker({
  sale,
  onSaleChanged,
}: {
  sale: PosSale;
  onSaleChanged: (sale: PosSale) => void;
}) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Debounce typed search so we don't hammer the API on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 200);
    return () => clearTimeout(id);
  }, [query]);

  const productsQ = useApiQuery(
    () => debounced ? posApi.searchProducts(debounced, 20) : Promise.resolve({ data: [] as PosProductHit[] }),
    [debounced],
  );
  const hits = productsQ.data ?? [];

  async function addByProductId(productId: string) {
    setAdding(productId);
    try {
      const { data } = await posApi.addItem(sale.id, { productId, qty: 1 });
      onSaleChanged(data);
      setQuery("");
      inputRef.current?.focus();
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.code === "INSUFFICIENT_STOCK") {
        toast.error("Not enough stock", firstDetailMessage(apiErr) ?? "Try a smaller quantity.");
      } else {
        toast.error("Couldn't add", apiErr?.message ?? "Please try again.");
      }
    } finally {
      setAdding(null);
    }
  }

  async function addByBarcode(barcode: string) {
    setAdding("__barcode__");
    try {
      const { data } = await posApi.addItem(sale.id, { barcode, qty: 1 });
      onSaleChanged(data);
      setQuery("");
      inputRef.current?.focus();
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.code === "PRODUCT_NOT_FOUND") {
        toast.error("No product for that barcode", "Check your barcode list or search by name.");
      } else if (apiErr?.code === "INSUFFICIENT_STOCK") {
        toast.error("Not enough stock", firstDetailMessage(apiErr) ?? "Try a smaller quantity.");
      } else {
        toast.error("Couldn't add", apiErr?.message ?? "Please try again.");
      }
    } finally {
      setAdding(null);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    // Treat digits-only inputs of 8+ chars as a scanned barcode — single
    // round-trip instead of search-then-pick.
    if (BARCODE_PATTERN.test(q)) {
      void addByBarcode(q);
      return;
    }
    // Otherwise pick the first hit (cashier hit Enter on the typed name).
    if (hits[0]) void addByProductId(hits[0].productId);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-border bg-neutral-surface">
      <form onSubmit={onSubmit} className="border-b border-neutral-border p-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Search or scan a barcode…"
            className="h-11 w-full rounded-lg border border-neutral-border bg-neutral-bg pl-10 pr-3 text-[14px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none"
          />
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-content-muted">
          Press <kbd className="rounded bg-neutral-surface2 px-1 font-mono">Enter</kbd> to add the top match (or scan a barcode for instant add).
        </p>
      </form>

      <div className="max-h-[60vh] overflow-y-auto">
        {productsQ.loading && debounced && (
          <p className="flex items-center justify-center gap-1.5 py-6 text-[12px] text-content-muted">
            <Loader2 size={12} className="animate-spin" /> Searching…
          </p>
        )}
        {!productsQ.loading && debounced && hits.length === 0 && (
          <p className="py-8 text-center text-[12px] text-content-muted">
            No products match &ldquo;{debounced}&rdquo;.
          </p>
        )}
        {!debounced && (
          <p className="py-8 text-center text-[12px] text-content-muted">
            Type to search or scan a barcode to add directly.
          </p>
        )}
        <ul className="divide-y divide-neutral-border">
          {hits.map((p) => {
            const isAdding = adding === p.productId;
            const outOfStock = p.stock <= 0;
            return (
              <li key={p.productId}>
                <button
                  type="button"
                  onClick={() => addByProductId(p.productId)}
                  disabled={isAdding || outOfStock}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-surface2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-ink">{p.name}</p>
                    <p className="mt-0.5 inline-flex items-center gap-2 font-mono text-[11px] text-content-muted">
                      {p.sku && <span className="inline-flex items-center gap-1"><Hash size={9} /> {p.sku}</span>}
                      <span className={outOfStock ? "text-danger" : p.lowStock ? "text-warning" : ""}>
                        stock {p.stock}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[14px] text-ink">{naira(p.price)}</span>
                    {isAdding ? <Loader2 size={13} className="animate-spin text-primary" /> : <Plus size={14} className="text-primary" />}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ---------- Cart card ----------

function CartCard({
  sale,
  onSaleChanged,
  onAttachCustomer,
  onTakePayment,
  onComplete,
  onVoid,
  completing,
  voiding,
}: {
  sale: PosSale;
  onSaleChanged: (sale: PosSale) => void;
  onAttachCustomer: () => void;
  onTakePayment: () => void;
  onComplete: () => Promise<void>;
  onVoid: () => Promise<void>;
  completing: boolean;
  voiding: boolean;
}) {
  const toast = useToast();
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  async function bumpQty(itemId: string, qty: number) {
    if (qty <= 0) return removeItem(itemId);
    setBusyItemId(itemId);
    try {
      const { data } = await posApi.updateItem(sale.id, itemId, { qty });
      onSaleChanged(data);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.code === "INSUFFICIENT_STOCK") {
        toast.error("Not enough stock", firstDetailMessage(apiErr) ?? "Try a smaller quantity.");
      } else {
        toast.error("Couldn't update", apiErr?.message ?? "Please try again.");
      }
    } finally {
      setBusyItemId(null);
    }
  }

  async function removeItem(itemId: string) {
    setBusyItemId(itemId);
    try {
      const { data } = await posApi.removeItem(sale.id, itemId);
      onSaleChanged(data);
    } catch (err) {
      toast.error("Couldn't remove", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setBusyItemId(null);
    }
  }

  const fullyPaid = sale.balance <= 0;
  const hasItems = sale.items.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-border bg-neutral-surface">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-border p-4">
        <div>
          <p className="font-mono text-[11px] text-content-muted">{sale.saleNumber}</p>
          <button
            type="button"
            onClick={onAttachCustomer}
            className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink hover:text-primary"
          >
            <User size={13} />
            {sale.customer?.name ?? "Walk-in customer"}
            <span className="text-content-muted">·</span>
            <span className="text-[12px] text-primary hover:underline">
              {sale.customer ? "change" : "attach"}
            </span>
          </button>
        </div>
        {sale.payments.length > 0 && (
          <Chip tone={fullyPaid ? "success" : "warning"}>
            {fullyPaid ? "Paid" : `${naira(sale.balance)} due`}
          </Chip>
        )}
      </div>

      {/* Items */}
      {hasItems ? (
        <ul className="divide-y divide-neutral-border">
          {sale.items.map((it) => {
            const busy = busyItemId === it.id;
            return (
              <li key={it.id} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-surface2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] text-ink">{it.productName}</p>
                  <p className="font-mono text-[11px] text-content-muted">{naira(it.unitPrice)} ea</p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-lg border border-neutral-border bg-neutral-surface2 p-0.5">
                  <button
                    type="button"
                    onClick={() => bumpQty(it.id, it.qty - 1)}
                    disabled={busy}
                    aria-label="Decrease"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-content-secondary hover:bg-neutral-surface hover:text-ink disabled:opacity-50"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="min-w-[28px] text-center font-mono text-[14px] text-ink">{it.qty}</span>
                  <button
                    type="button"
                    onClick={() => bumpQty(it.id, it.qty + 1)}
                    disabled={busy}
                    aria-label="Increase"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-content-secondary hover:bg-neutral-surface hover:text-ink disabled:opacity-50"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <span className="w-20 text-right font-mono text-[14px] font-medium text-ink">{naira(it.lineTotal)}</span>
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  disabled={busy}
                  aria-label="Remove"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-content-muted hover:bg-danger-bg hover:text-danger disabled:opacity-50"
                >
                  {busy ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="py-12 text-center text-[13px] text-content-muted">
          Search or scan to add the first product.
        </p>
      )}

      {/* Totals + actions */}
      <div className="border-t border-neutral-border bg-neutral-surface2 p-4">
        <div className="mb-3 space-y-1">
          <div className="flex justify-between text-[13px]">
            <span className="text-content-secondary">Subtotal</span>
            <span className="font-mono text-ink">{naira(sale.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[14px] font-medium">
            <span className="text-ink">Total</span>
            <span className="font-mono text-ink">{naira(sale.total)}</span>
          </div>
          {sale.paid > 0 && (
            <div className="flex justify-between text-[12px]">
              <span className="text-content-secondary">Paid</span>
              <span className="font-mono text-success">{naira(sale.paid)}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="md" onClick={onVoid} disabled={voiding || completing}>
            {voiding ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Void
          </Button>
          {fullyPaid ? (
            <Button variant="primary" size="md" onClick={onComplete} disabled={completing || !hasItems}>
              {completing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />} Complete
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={onTakePayment} disabled={!hasItems}>
              <Wallet size={13} /> Take payment
            </Button>
          )}
        </div>

        {!hasItems && (
          <p className="mt-2 flex items-center gap-1.5 text-center text-[11px] text-content-muted">
            <AlertCircle size={11} /> Add at least one product before completing.
          </p>
        )}
      </div>
    </div>
  );
}
