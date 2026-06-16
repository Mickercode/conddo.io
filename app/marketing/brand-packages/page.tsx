"use client";

import { useState } from "react";
import {
  Sparkles, Check, Calendar, Loader2, AlertTriangle,
  Image as ImageIcon, Film, type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { MarketingTabs } from "@/components/app/MarketingTabs";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  brandPackagesApi,
  type BrandPackageOffering,
  type BrandPackageSubscription,
  type SubscriptionStatus,
} from "@/lib/api/brandPackages";
import { naira } from "@/lib/format";
import { ApiError } from "@/lib/api/client";

const koboToNaira = (k: number) => Math.round(k / 100);

// Per-creative-offering presentation. Keep this aligned with the BE catalog
// keys returned by /creative-services/offerings + each brand package's
// `includes` map.
const OFFERING_META: Record<string, { label: string; icon: LucideIcon }> = {
  design_static:        { label: "Static designs",      icon: ImageIcon },
  design_reels:         { label: "Reels / vertical video", icon: Film },
  ad_creative_static:   { label: "Static ad creatives", icon: ImageIcon },
  ad_creative_video:    { label: "Video ad creatives",  icon: Film },
  brand_kit_starter:    { label: "Brand kits",          icon: Sparkles },
};

const STATUS_CHIP: Record<SubscriptionStatus, { tone: "success" | "warning" | "neutral"; label: string }> = {
  active:    { tone: "success", label: "Active" },
  past_due:  { tone: "warning", label: "Past due" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};

function fmtDate(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

function CurrentSubscriptionCard({
  subscription,
  offering,
  usage,
  onCancel,
  cancelling,
}: {
  subscription: BrandPackageSubscription;
  offering: BrandPackageOffering;
  usage: Partial<Record<string, number>>;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const chip = STATUS_CHIP[subscription.status];
  return (
    <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/[0.08] p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-[18px] font-medium text-white">{offering.name}</h2>
            <Chip tone={chip.tone}>{chip.label}</Chip>
          </div>
          <p className="font-mono text-[13px] text-white/65">
            {naira(koboToNaira(offering.monthlyPriceKobo))}/month
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-white/45">
            <Calendar size={12} />
            Renews {fmtDate(subscription.currentPeriodEnd)}
            {subscription.cancelledAt && ` · cancelled ${fmtDate(subscription.cancelledAt)}`}
          </p>
        </div>
        {subscription.status === "active" && !subscription.cancelledAt && (
          <button
            type="button"
            onClick={onCancel}
            disabled={cancelling}
            className="rounded-md border border-white/10 px-3 py-1.5 text-[12px] font-medium text-white/65 transition-colors hover:bg-white/[0.02] hover:text-white disabled:opacity-50"
          >
            {cancelling ? "Cancelling…" : "Cancel renewal"}
          </button>
        )}
      </div>

      {/* Quota usage — one row per included offering code, with bar */}
      <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.06em] text-white/45">This month</p>
      <div className="space-y-2.5">
        {Object.entries(offering.includes).map(([code, total]) => {
          const meta = OFFERING_META[code] ?? { label: code, icon: Sparkles };
          const used = usage[code] ?? 0;
          const remaining = Math.max(0, (total ?? 0) - used);
          const pct = total ? Math.min(100, Math.round((used / total) * 100)) : 0;
          return (
            <div key={code} className="flex items-center gap-3 rounded-lg bg-cinema-elev px-3 py-2">
              <meta.icon size={14} className="shrink-0 text-white/65" />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="text-[13px] text-white">{meta.label}</span>
                  <span className="font-mono text-[12px] text-white/65">
                    {used} / {total} <span className="text-white/45">· {remaining} left</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.02]">
                  <div
                    className={`h-full ${used >= (total ?? 0) ? "bg-warning" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OfferingCard({
  offering,
  isCurrent,
  onSubscribe,
  subscribing,
}: {
  offering: BrandPackageOffering;
  isCurrent: boolean;
  onSubscribe: () => void;
  subscribing: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-6 ${
        isCurrent ? "border-2 border-primary bg-cinema-elev" : "border-white/[0.06] bg-cinema-elev"
      }`}
    >
      <div className="mb-3">
        <h3 className="text-[16px] font-medium text-white">{offering.name}</h3>
        <p className="mt-1 text-[12px] text-white/45">{offering.description}</p>
      </div>
      <p className="mb-4 font-mono text-[24px] text-white">
        {naira(koboToNaira(offering.monthlyPriceKobo))}
        <span className="text-[12px] text-white/45"> / month</span>
      </p>
      <ul className="mb-6 flex-1 space-y-1.5">
        {Object.entries(offering.includes).map(([code, count]) => {
          const meta = OFFERING_META[code] ?? { label: code };
          return (
            <li key={code} className="flex items-center gap-2 text-[13px] text-white/65">
              <Check size={13} className="shrink-0 text-emerald-300" />
              <span><strong className="text-white">{count}</strong> {meta.label}/mo</span>
            </li>
          );
        })}
      </ul>
      <Button
        variant={isCurrent ? "secondary" : "primary"}
        size="md"
        onClick={onSubscribe}
        disabled={isCurrent || subscribing}
        className="w-full"
      >
        {subscribing ? <><Loader2 size={15} className="animate-spin" /> Redirecting…</> :
         isCurrent ? "Current package" : "Subscribe"}
      </Button>
    </div>
  );
}

/** Brand Packages — monthly creative bundles. Subscribe once, get N
 *  designs / videos / ad creatives per month consumed from the
 *  brand-package quota instead of paid per-job. Spec:
 *  backend/SOCIAL_AND_CREATIVE_SERVICES_SPEC.md §6. */
export default function BrandPackagesPage() {
  const toast = useToast();
  const offeringsQ = useApiQuery(brandPackagesApi.offerings);
  const currentQ = useApiQuery(brandPackagesApi.current);
  const usageQ = useApiQuery(brandPackagesApi.usage);

  const offerings = offeringsQ.data ?? [];
  const current = currentQ.data?.subscription ?? null;
  const currentOffering = currentQ.data?.offering ?? null;
  // /usage 5xx's on unsubscribed tenants — soft-fall to empty counts.
  const usage = usageQ.data?.counts ?? {};

  const [subscribingCode, setSubscribingCode] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  async function subscribe(code: string) {
    setSubscribingCode(code);
    try {
      const { data } = await brandPackagesApi.subscribe(code);
      if (data.checkoutUrl) {
        toast.success("Redirecting to checkout…");
        window.location.href = data.checkoutUrl;
      } else {
        toast.success("Subscription started");
        currentQ.refetch();
        usageQ.refetch();
      }
    } catch (err) {
      toast.error("Couldn't subscribe", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSubscribingCode(null);
    }
  }

  async function cancel() {
    if (!confirm("Cancel renewal? You keep access until the period ends, but won't be charged again.")) return;
    setCancelling(true);
    try {
      await brandPackagesApi.cancel();
      toast.success("Renewal cancelled", "Your package stays active until the period ends.");
      currentQ.refetch();
    } catch (err) {
      toast.error("Couldn't cancel", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <AppShell title="Marketing" subtitle="Monthly creative bundles — fixed price, fixed quota.">
      <MarketingTabs active="Brand Packages" />

      <QueryBoundary
        loading={offeringsQ.loading}
        error={offeringsQ.error}
        isEmpty={offerings.length === 0}
        onRetry={offeringsQ.refetch}
        loadingLabel="Loading brand packages…"
        gatedFeatureTitle="Brand Packages"
        empty={
          <EmptyState
            icon={Sparkles}
            title="Brand Packages launching soon"
            description="Monthly creative bundles — fixed price, fixed quota of designs and videos delivered to your social channels. Will appear here when ready."
          />
        }
      >
        {current && currentOffering && (
          <CurrentSubscriptionCard
            subscription={current}
            offering={currentOffering}
            usage={usage}
            onCancel={cancel}
            cancelling={cancelling}
          />
        )}

        {!current && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.08] px-5 py-4 text-[13px] text-primary">
            <Sparkles size={16} className="mt-0.5 shrink-0" />
            <p>
              <span className="font-medium text-white">Lock in a monthly cadence.</span>{" "}
              Brand Packages bundle the most-requested creative services into a single
              subscription so you can plan content without per-job pricing surprises.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {offerings.map((o) => (
            <OfferingCard
              key={o.code}
              offering={o}
              isCurrent={current?.offeringCode === o.code && current.status === "active"}
              onSubscribe={() => subscribe(o.code)}
              subscribing={subscribingCode === o.code}
            />
          ))}
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-lg border border-white/[0.06] bg-cinema-elev px-4 py-3 text-[12px] text-white/65">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-white/45" />
          <p>
            Unused quota doesn't roll over to the next month. Cancel anytime — your package
            stays active until the period ends.
          </p>
        </div>
      </QueryBoundary>
    </AppShell>
  );
}
