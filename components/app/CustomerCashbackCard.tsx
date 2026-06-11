"use client";

import { useState } from "react";
import {
  Wallet, ArrowDownToLine, ArrowUpFromLine, Sparkles, ChevronDown, ChevronUp,
  History, Loader2, ShoppingCart, Clock,
} from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { useApiQuery } from "@/hooks/useApiQuery";
import { featuresApi } from "@/lib/api/features";
import {
  loyaltyApi,
  WALLET_TX_LABELS,
  walletTxTone,
  type WalletTransaction,
} from "@/lib/api/loyalty";
import { naira } from "@/lib/format";

function fmtWhen(s: string): string {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const positive = tx.amount > 0;
  return (
    <li className="flex items-start justify-between gap-3 border-t border-success/10 py-2 first:border-t-0">
      <div className="flex min-w-0 items-start gap-2">
        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          positive ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
        }`}>
          {positive ? <ArrowDownToLine size={10} /> : <ArrowUpFromLine size={10} />}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-[12px] font-medium text-ink">
              {WALLET_TX_LABELS[tx.transactionType] ?? tx.transactionType}
            </p>
            <Chip tone={walletTxTone(tx.transactionType)}>
              {positive ? "+" : ""}{naira(tx.amount)}
            </Chip>
          </div>
          {tx.note && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-content-muted">{tx.note}</p>
          )}
          <p className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-content-muted">
            <Clock size={9} /> {fmtWhen(tx.createdAt)}
            {tx.referenceId && (
              <>
                <span className="mx-0.5">·</span>
                <ShoppingCart size={9} />
                <span>Order {tx.referenceId.slice(0, 8)}…</span>
              </>
            )}
          </p>
        </div>
      </div>
    </li>
  );
}

/** Inline cashback wallet card for the customer detail page. Self-gates on
 *  the `cashback_loyalty` flag AND on the wallet existing — a customer with
 *  no wallet hides the card entirely. Now also surfaces an expandable
 *  transaction history view on demand. */
export function CustomerCashbackCard({ customerId }: { customerId: string }) {
  const flagsQ = useApiQuery(featuresApi.flags);
  const enabled = flagsQ.data?.some((f) => f.featureKey === "cashback_loyalty" && f.enabled);

  const walletQ = useApiQuery(
    () => enabled ? loyaltyApi.getWallet(customerId) : Promise.resolve({ data: null as never }),
    [enabled, customerId],
  );

  const [showHistory, setShowHistory] = useState(false);
  const txQ = useApiQuery(
    () => enabled && showHistory
      ? loyaltyApi.walletTransactions(customerId)
      : Promise.resolve({ data: null as never }),
    [enabled, showHistory, customerId],
  );

  if (!enabled) return null;
  if (walletQ.loading) return null;
  if (walletQ.error || !walletQ.data) return null;

  const w = walletQ.data;
  const txs = (txQ.data ?? []).slice(0, 12);

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

      {/* History toggle */}
      <button
        type="button"
        onClick={() => setShowHistory((v) => !v)}
        className="mt-4 inline-flex items-center gap-1 rounded-md text-[11px] font-medium text-success hover:underline"
      >
        <History size={11} />
        {showHistory ? <>Hide history <ChevronUp size={11} /></> : <>Show history <ChevronDown size={11} /></>}
      </button>

      {showHistory && (
        <div className="mt-3 rounded-md bg-neutral-surface/70 px-3 py-2">
          {txQ.loading ? (
            <p className="flex items-center gap-1.5 py-2 text-[12px] text-content-muted">
              <Loader2 size={11} className="animate-spin" /> Loading transactions…
            </p>
          ) : txs.length === 0 ? (
            <p className="py-2 text-center text-[12px] text-content-muted">
              No transactions yet on this wallet.
            </p>
          ) : (
            <ul>
              {txs.map((tx) => <TransactionRow key={tx.id} tx={tx} />)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
