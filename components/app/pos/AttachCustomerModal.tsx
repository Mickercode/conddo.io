"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, User, Phone } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { customersApi } from "@/lib/api/customers";
import { posApi, type PosSale } from "@/lib/api/pos";
import { ApiError } from "@/lib/api/client";

/** Attach a known customer to the in-progress sale. Drives cashback at
 *  /complete time. Optional — most walk-in sales skip this. */
export function AttachCustomerModal({
  open,
  onClose,
  sale,
  onSaleChanged,
}: {
  open: boolean;
  onClose: () => void;
  sale: PosSale | null;
  onSaleChanged?: (next: PosSale) => void;
}) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [attaching, setAttaching] = useState<string | null>(null);

  const customersQ = useApiQuery(() => customersApi.list({ search: query, size: 20 }), [query]);
  const customers = customersQ.data ?? [];

  useEffect(() => {
    if (!open) return;
    setQuery("");
  }, [open]);

  const currentAttached = sale?.customer?.id ?? null;

  async function attach(customerId: string) {
    if (!sale) return;
    setAttaching(customerId);
    try {
      const { data } = await posApi.attachCustomer(sale.id, { customerId });
      onSaleChanged?.(data);
      toast.success("Customer attached", data.customer?.name ?? undefined);
      onClose();
    } catch (err) {
      toast.error("Couldn't attach", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setAttaching(null);
    }
  }

  const list = useMemo(() => customers.slice(0, 20), [customers]);

  if (!sale) return null;

  return (
    <Modal
      open={open}
      onClose={() => !attaching && onClose()}
      title="Attach customer"
      description="Tagging a customer credits cashback to their wallet after the sale completes."
      footer={
        <Button variant="secondary" size="md" onClick={onClose} disabled={attaching !== null}>
          Cancel
        </Button>
      }
    >
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone"
            autoFocus
            className="h-11 w-full rounded-lg border border-white/[0.06] bg-cinema-elev pl-10 pr-3 text-[14px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none"
          />
        </div>

        <div className="max-h-72 overflow-y-auto rounded-lg border border-white/[0.06] bg-cinema-elev">
          {customersQ.loading ? (
            <p className="flex items-center justify-center gap-1.5 py-6 text-[12px] text-white/45">
              <Loader2 size={12} className="animate-spin" /> Searching…
            </p>
          ) : list.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-white/45">
              {query ? "No matches. Add the customer from /customers first." : "Start typing to search."}
            </p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {list.map((c) => {
                const isAttached = c.id === currentAttached;
                const busy = attaching === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => attach(c.id)}
                      disabled={attaching !== null || isAttached}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.02] disabled:cursor-not-allowed"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
                          <User size={14} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-white">{c.name}</p>
                          {c.phone && (
                            <p className="inline-flex items-center gap-1 font-mono text-[11px] text-white/45">
                              <Phone size={10} /> {c.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      {isAttached ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                          Attached
                        </span>
                      ) : busy ? (
                        <Loader2 size={13} className="animate-spin text-primary" />
                      ) : (
                        <span className="text-[11px] font-medium text-primary">Attach →</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
