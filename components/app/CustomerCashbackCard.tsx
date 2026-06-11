"use client";

import { Wallet, ArrowDownToLine, ArrowUpFromLine, Sparkles } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { featuresApi } from "@/lib/api/features";
import { loyaltyApi } from "@/lib/api/loyalty";
import { naira } from "@/lib/format";

/** Inline cashback wallet card for the customer detail page. Self-gates on
 *  the `cashback_loyalty` flag AND on the wallet existing — a customer with
 *  no wallet hides the card entirely (no clutter for fresh patients). */
export function CustomerCashbackCard({ customerId }: { customerId: string }) {
  const flagsQ = useApiQuery(featuresApi.flags);
  const enabled = flagsQ.data?.some((f) => f.featureKey === "cashback_loyalty" && f.enabled);

  const walletQ = useApiQuery(
    () => enabled ? loyaltyApi.getWallet(customerId) : Promise.resolve({ data: null as never }),
    [enabled, customerId],
  );

  if (!enabled) return null;
  if (walletQ.loading) return null;
  if (walletQ.error || !walletQ.data) return null;

  const w = walletQ.data;

  return (
    <div className="rounded-xl border border-success/20 bg-success-bg/40 p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-success" />
          <h3 className="text-[14px] font-medium text-ink">Cashback wallet</h3>
        </div>
        <Wallet size={16} className="text-content-muted" />
      </div>
      <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">Balance</p>
      <p className="mt-1 font-mono text-[28px] font-medium leading-none text-success">
        {naira(w.balance)}
      </p>
      <div className="mt-4 flex items-center gap-4 font-mono text-[11px] text-content-secondary">
        <span className="inline-flex items-center gap-1">
          <ArrowDownToLine size={11} className="text-success" />
          earned {naira(w.totalEarned)}
        </span>
        <span className="inline-flex items-center gap-1">
          <ArrowUpFromLine size={11} className="text-danger" />
          redeemed {naira(w.totalRedeemed)}
        </span>
      </div>
    </div>
  );
}
