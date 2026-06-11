"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Gift, Sparkles, Search, Wallet, Loader2, Save, ArrowDownToLine, ArrowUpFromLine,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { BetaFeatureGate } from "@/components/app/BetaFeatureGate";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { naira } from "@/lib/format";
import { verticalOf } from "@/lib/verticalCopy";
import {
  loyaltyApi,
  type CustomerWallet,
} from "@/lib/api/loyalty";
import { ApiError } from "@/lib/api/client";

function CashbackConfigCard() {
  const toast = useToast();
  const { data, loading, error, refetch } = useApiQuery(loyaltyApi.getConfig);

  const [rate, setRate] = useState("");
  const [minRedeem, setMinRedeem] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setRate(String(data.cashbackRate));
    setMinRedeem(String(data.minRedemption));
    setActive(data.isActive);
  }, [data]);

  async function save() {
    const r = Number(rate);
    const m = Number(minRedeem);
    if (!Number.isFinite(r) || r < 0 || r > 50) {
      toast.error("Pick a rate between 0 and 50%");
      return;
    }
    if (!Number.isFinite(m) || m < 0) {
      toast.error("Minimum redemption must be ≥ 0");
      return;
    }
    setSaving(true);
    try {
      await loyaltyApi.setConfig({
        cashbackRate: r,
        minRedemption: m,
        isActive: active,
      });
      toast.success("Config saved");
      refetch();
    } catch (err) {
      toast.error("Couldn't save", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-border bg-neutral-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={16} className="text-primary" />
        <h2 className="text-[15px] font-medium text-ink">Cashback program</h2>
      </div>
      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={!data}
        onRetry={refetch}
        loadingLabel="Loading config…"
        empty={
          <EmptyState
            icon={Sparkles}
            title="Cashback isn't configured yet"
            description="Set a cashback rate and minimum redemption to start rewarding repeat customers."
            action={
              <Button variant="primary" size="md" onClick={save}>Initialise with defaults</Button>
            }
          />
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Cashback rate (%)" htmlFor="lc-rate" hint="E.g. 2 credits ₦20 per ₦1,000 spent.">
            <TextInput
              id="lc-rate"
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="2"
            />
          </Field>
          <Field label="Minimum redemption (₦)" htmlFor="lc-min" hint="Wallet must reach this before customer can redeem.">
            <TextInput
              id="lc-min"
              inputMode="numeric"
              value={minRedeem}
              onChange={(e) => setMinRedeem(e.target.value)}
              placeholder="500"
            />
          </Field>
        </div>
        <label className="mt-4 flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-border text-primary focus:ring-primary"
          />
          <span className="text-[14px] text-content-secondary">
            Active — cashback accrues on every DELIVERED order
          </span>
        </label>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="flex items-start gap-1.5 text-[11px] text-content-muted">
            <AlertCircle size={11} className="mt-0.5 shrink-0" />
            Cashback credits on order DELIVERED — not on placement. Customers see their balance on the website and at checkout.
          </p>
          <Button variant="primary" size="md" onClick={save} disabled={saving}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : (<><Save size={14} /> Save</>)}
          </Button>
        </div>
      </QueryBoundary>
    </div>
  );
}

function WalletsCard() {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const { data, loading, error, refetch } = useApiQuery(
    () => loyaltyApi.listWallets(appliedSearch || undefined),
    [appliedSearch],
  );
  const wallets = data ?? [];

  const totalLiability = wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalEarned = wallets.reduce((sum, w) => sum + w.totalEarned, 0);
  const totalRedeemed = wallets.reduce((sum, w) => sum + w.totalRedeemed, 0);

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Wallet liability" value={naira(totalLiability)} tone="warning" />
        <StatCard label="Total earned" value={naira(totalEarned)} tone="success" />
        <StatCard label="Total redeemed" value={naira(totalRedeemed)} tone="primary" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setAppliedSearch(search.trim());
        }}
        className="relative mb-4"
      >
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search customers"
          className="w-full max-w-md rounded-lg border border-neutral-border bg-neutral-surface py-2.5 pl-11 pr-4 text-[14px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none"
        />
      </form>

      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={wallets.length === 0}
        onRetry={refetch}
        loadingLabel="Loading wallets…"
        empty={
          <EmptyState
            icon={Wallet}
            title={appliedSearch ? "No matching customers" : "No wallets yet"}
            description={
              appliedSearch
                ? "Try a different search."
                : "Wallets appear once your first customer earns cashback on a delivered order."
            }
          />
        }
      >
        <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
          <ul className="divide-y divide-neutral-border">
            {wallets.map((w) => <WalletRow key={w.customerId} w={w} />)}
          </ul>
        </div>
      </QueryBoundary>
    </div>
  );
}

function WalletRow({ w }: { w: CustomerWallet }) {
  return (
    <li className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-neutral-surface2">
      <Link
        href={`/customers/${w.customerId}`}
        className="flex min-w-0 items-center gap-3"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-bg text-primary">
          <Wallet size={15} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-ink hover:text-primary">
            {w.customerName ?? `Customer ${w.customerId.slice(0, 8)}…`}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-3 font-mono text-[11px] text-content-muted">
            <span className="inline-flex items-center gap-1">
              <ArrowDownToLine size={11} className="text-success" />
              {naira(w.totalEarned)}
            </span>
            <span className="inline-flex items-center gap-1">
              <ArrowUpFromLine size={11} className="text-danger" />
              {naira(w.totalRedeemed)}
            </span>
          </p>
        </div>
      </Link>
      <div className="text-right">
        <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">Balance</p>
        <p className="mt-0.5 font-mono text-[16px] font-medium text-success">
          {naira(w.balance)}
        </p>
      </div>
    </li>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "primary" }) {
  const toneText: Record<typeof tone, string> = {
    success: "text-success",
    warning: "text-warning",
    primary: "text-primary",
  };
  return (
    <div className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
      <p className="text-[11px] uppercase tracking-[0.05em] text-content-muted">{label}</p>
      <p className={`mt-1 font-mono text-[24px] font-medium leading-none ${toneText[tone]}`}>{value}</p>
    </div>
  );
}

export default function LoyaltyPage() {
  const { data: me } = useApiQuery(meQuery);
  const isPharmacy = verticalOf(me) === "pharmacy";

  return (
    <AppShell title="Loyalty" subtitle="Customer cashback and rewards">
      {!isPharmacy ? (
        <EmptyState
          icon={Gift}
          title="Loyalty is rolling out to pharmacy first"
          description="The cashback system is built around pharmacy retention. We'll bring it elsewhere as the pattern generalises."
        />
      ) : (
        <BetaFeatureGate
          featureKey="cashback_loyalty"
          featureName="Cashback Loyalty"
          description="Reward repeat customers with cashback on every order. Set the rate, watch wallets accrue, redeem at checkout."
        >
          <div className="space-y-6">
            <CashbackConfigCard />
            <WalletsCard />
          </div>
        </BetaFeatureGate>
      )}
    </AppShell>
  );
}
