"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Gift, AlertCircle, ListOrdered } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { NewRefillOfferModal } from "@/components/app/NewRefillOfferModal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { verticalOf } from "@/lib/verticalCopy";
import {
  refillOffersApi,
  refillProductName,
  summariseOffer,
  type RefillOffer,
} from "@/lib/api/refillOffers";

function OfferRow({ o }: { o: RefillOffer }) {
  return (
    <li className="flex flex-col gap-3 px-5 py-4 hover:bg-neutral-surface2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-bg text-primary">
          <Gift size={15} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[14px] font-medium text-ink">
              {refillProductName(o.product)}
            </p>
            <Chip tone={o.isActive ? "success" : "neutral"}>
              {o.isActive ? "Active" : "Paused"}
            </Chip>
          </div>
          <p className="mt-0.5 text-[12px] text-content-muted">{summariseOffer(o)}</p>
          {o.maxUses > 1 && (
            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-content-muted">
              <ListOrdered size={11} /> Up to {o.maxUses} uses per customer
            </p>
          )}
          {o.createdBy?.name && (
            <p className="mt-0.5 text-[11px] text-content-muted">
              Created by {o.createdBy.name}
            </p>
          )}
        </div>
      </div>
      <p className="shrink-0 text-[11px] text-content-muted">
        Issue this offer to a customer from their order detail after dispense.
      </p>
    </li>
  );
}

/** Pharmacy refill offers manager (Spec v2 §12E). Create the offer once;
 *  issue per-customer from an order after dispense — that's when the
 *  redemption code is minted (see refillOffersApi.issue). */
export default function RefillOffersPage() {
  const { data: me } = useApiQuery(meQuery);
  const vertical = verticalOf(me);
  const isPharmacy = vertical === "pharmacy";

  const [createOpen, setCreateOpen] = useState(false);

  const { data, loading, error, refetch } = useApiQuery(refillOffersApi.list);
  const offers = data ?? [];

  return (
    <AppShell
      title="Refill offers"
      subtitle="Discounted return prices that bring customers back"
      actions={
        isPharmacy ? (
          <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
            <Plus size={17} />
            <span className="hidden sm:inline">New refill offer</span>
          </Button>
        ) : undefined
      }
    >
      <Link
        href="/marketing"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-content-secondary hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to Marketing
      </Link>

      {!isPharmacy ? (
        <EmptyState
          icon={Gift}
          title="Refill offers aren't enabled for your vertical yet"
          description="This is a pharmacy-first feature — designed around chronic refills. We'll bring it elsewhere as the patterns generalise."
        />
      ) : (
        <>
          <QueryBoundary
            loading={loading}
            error={error}
            isEmpty={offers.length === 0}
            onRetry={refetch}
            loadingLabel="Loading refill offers…"
            gatedFeatureTitle="Pharmacy refill offers"
            empty={
              <EmptyState
                icon={Gift}
                title="No refill offers yet"
                description="Create a refill offer per product. After a customer's pickup, issue the offer from their order — they'll get a code by SMS and a discount window to return."
                action={
                  <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
                    <Plus size={17} /> Create your first refill offer
                  </Button>
                }
              />
            }
          >
            <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
              <ul className="divide-y divide-neutral-border">
                {offers.map((o) => (
                  <OfferRow key={o.id} o={o} />
                ))}
              </ul>
            </div>
          </QueryBoundary>

          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-content-muted">
            <AlertCircle size={11} />
            Codes are generated per customer when you click <em>Issue</em>{" "}from an order detail page — not from this list.
          </p>

          <NewRefillOfferModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onCreated={refetch}
          />
        </>
      )}
    </AppShell>
  );
}
