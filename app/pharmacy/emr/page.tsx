"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity, Search, ArrowRight, User, Phone, AlertCircle, Heart, Users,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { BetaFeatureGate } from "@/components/app/BetaFeatureGate";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { verticalOf } from "@/lib/verticalCopy";
import { customersApi } from "@/lib/api/customers";

/** EMR index — patient picker scoped for clinical workflow. The actual EMR
 *  data lives at /pharmacy/emr/[customerId]; this page is the search +
 *  pick step the pharmacist hits when they want to open a patient's record
 *  without first navigating through /customers.
 *
 *  Today this just lists every customer via the existing `/customers` API
 *  (BE doesn't have a "list patients with EMR" endpoint yet — when it
 *  ships, we'll swap to that to put EMR-having patients on top + show
 *  blood group / chronic conditions inline). */
export default function EmrIndexPage() {
  const { data: me } = useApiQuery(meQuery);
  const isPharmacy = verticalOf(me) === "pharmacy";

  return (
    <AppShell title="Medical Records" subtitle="Pick a patient to open their EMR">
      {!isPharmacy ? (
        <EmptyState
          icon={Activity}
          title="EMR is a pharmacy feature"
          description="Electronic medical records are built for pharmacy patient care."
        />
      ) : (
        <BetaFeatureGate
          featureKey="emr_basic"
          featureName="Electronic Medical Records"
          description="Track demographics, allergies, chronic conditions, vaccinations, clinical notes, and lab documents per patient."
        >
          <EmrIndexBody />
        </BetaFeatureGate>
      )}
    </AppShell>
  );
}

function EmrIndexBody() {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const { data, loading, error, refetch } = useApiQuery(
    () => customersApi.list({ search: appliedSearch, size: 50 }),
    [appliedSearch],
  );
  const customers = data ?? [];

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setAppliedSearch(search.trim());
        }}
        className="relative"
      >
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search by name or phone"
          autoFocus
          className="h-12 w-full max-w-xl rounded-lg border border-neutral-border bg-neutral-surface pl-11 pr-3 text-[15px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none"
        />
      </form>

      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={customers.length === 0}
        onRetry={refetch}
        loadingLabel="Loading patients…"
        gatedFeatureTitle="Patient records"
        empty={
          <EmptyState
            icon={Users}
            title={appliedSearch ? "No patients match" : "No patients yet"}
            description={
              appliedSearch
                ? "Try a different search, or add the patient from the Customers page."
                : "Add customers and they'll appear here for clinical lookup."
            }
          />
        }
      >
        <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
          <ul className="divide-y divide-neutral-border">
            {customers.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/pharmacy/emr/${c.id}`}
                  className="group flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-neutral-surface2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-bg text-primary">
                      <User size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-ink group-hover:text-primary">
                        {c.name || "—"}
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-2 font-mono text-[11px] text-content-muted">
                        {c.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone size={9} /> {c.phone}
                          </span>
                        )}
                        {c.tag && <Chip tone="neutral">{c.tag}</Chip>}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Open EMR <ArrowRight size={11} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </QueryBoundary>

      <p className="flex items-start gap-1.5 rounded-md bg-neutral-surface2 px-4 py-3 text-[12px] text-content-muted">
        <AlertCircle size={11} className="mt-0.5 shrink-0" />
        <span>
          <Heart size={11} className="mr-1 inline -mt-0.5 text-content-muted" />
          EMR entries are immutable — every clinical note you save is permanent. Patients are sorted alphabetically; a future BE upgrade will surface EMR-having patients first with vitals + chronic conditions inline.
        </span>
      </p>
    </div>
  );
}
