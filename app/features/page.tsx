"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, Compass } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/States";
import { FeatureLockedCard } from "@/components/app/FeatureLockedCard";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { verticalOf } from "@/lib/verticalCopy";
import { featuresApi, ROADMAP_FEATURES, type FeatureCatalogueEntry } from "@/lib/api/features";

/** Pharmacy feature roadmap overview. Each card is a locked teaser with a
 *  "Request Beta access" or "Notify me" CTA. The cards group by area so the
 *  page reads as a product tour, not a flat checklist. */
export default function FeaturesPage() {
  const { data: me } = useApiQuery(meQuery);
  const vertical = verticalOf(me);
  const isPharmacy = vertical === "pharmacy";

  // Seed `requested` from the server-known flag state so a tenant who's
  // already opted in (in another browser, or by ops grant) sees the
  // confirmed pill the moment they land. Local additions then layer on top.
  const flagsQ = useApiQuery(featuresApi.flags);
  const [requested, setRequested] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!flagsQ.data) return;
    setRequested((prev) => {
      const next = new Set(prev);
      flagsQ.data?.forEach((f) => next.add(f.featureKey));
      return next;
    });
  }, [flagsQ.data]);
  const markRequested = (key: string) =>
    setRequested((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });

  const grouped = useMemo(() => {
    const map = new Map<FeatureCatalogueEntry["area"], FeatureCatalogueEntry[]>();
    for (const f of ROADMAP_FEATURES) {
      const arr = map.get(f.area) ?? [];
      arr.push(f);
      map.set(f.area, arr);
    }
    return Array.from(map.entries());
  }, []);

  const betaCount = ROADMAP_FEATURES.filter((f) => f.status === "beta").length;
  const soonCount = ROADMAP_FEATURES.filter((f) => f.status === "coming_soon").length;

  return (
    <AppShell
      title="What's coming next"
      subtitle="The pharmacy roadmap — features in beta and on the way."
    >
      {!isPharmacy ? (
        <EmptyState
          icon={Compass}
          title="Roadmap is pharmacy-only for now"
          description="We're rolling these features out to the pharmacy vertical first. As they mature we'll bring the equivalents to your vertical — and you'll see them here when we do."
        />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary-bg/30 px-4 py-3 text-[13px] text-content-secondary">
            <Sparkles size={15} className="text-primary" />
            <span>
              <strong className="font-medium text-ink">{betaCount} in beta</strong> · {" "}
              <strong className="font-medium text-ink">{soonCount} coming soon</strong>.
              Click any card to register interest — early-adopter tenants get first access.
            </span>
          </div>

          <div className="space-y-8">
            {grouped.map(([area, items]) => (
              <section key={area}>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-[12px] font-medium uppercase tracking-[0.06em] text-content-muted">
                    {area}
                  </h2>
                  <Chip tone="neutral">{items.length}</Chip>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((f) => (
                    <FeatureLockedCard
                      key={f.key}
                      feature={f}
                      requested={requested.has(f.key)}
                      onRequested={markRequested}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
