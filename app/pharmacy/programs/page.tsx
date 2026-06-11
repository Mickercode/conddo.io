"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus, ClipboardPlus, Repeat, Globe, EyeOff, Users, Calendar, Loader2,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { BetaFeatureGate } from "@/components/app/BetaFeatureGate";
import { NewProgramModal } from "@/components/app/NewProgramModal";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { meQuery } from "@/lib/api/account";
import { verticalOf } from "@/lib/verticalCopy";
import {
  programsApi,
  type Program,
} from "@/lib/api/programs";
import { ApiError } from "@/lib/api/client";

function ProgramCard({ p, onChanged }: { p: Program; onChanged: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function togglePublish() {
    setBusy(true);
    try {
      await programsApi.publish(p.id, !p.isPublished);
      toast.success(p.isPublished ? "Program unpublished" : "Program published", "Customer enrolment opens via your website.");
      onChanged();
    } catch (err) {
      toast.error("Couldn't update", err instanceof ApiError ? err.message : "Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-border bg-neutral-surface p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-medium text-ink">{p.name}</h3>
            <Chip tone={p.isPublished ? "success" : "neutral"}>
              {p.isPublished ? "Published" : "Draft"}
            </Chip>
            {p.targetCondition && <Chip tone="primary">{p.targetCondition}</Chip>}
          </div>
          {p.description && (
            <p className="mt-1 line-clamp-2 text-[13px] text-content-secondary">{p.description}</p>
          )}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-md bg-neutral-surface2 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.05em] text-content-muted">Price/mo</p>
          <p className="mt-0.5 font-mono text-[14px] font-medium text-ink">{naira(p.monthlyPrice)}</p>
        </div>
        <div className="rounded-md bg-neutral-surface2 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.05em] text-content-muted">Duration</p>
          <p className="mt-0.5 font-mono text-[14px] font-medium text-ink">
            {p.durationMonths ? `${p.durationMonths}mo` : "Ongoing"}
          </p>
        </div>
        <div className="rounded-md bg-neutral-surface2 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.05em] text-content-muted">Enrolled</p>
          <p className="mt-0.5 font-mono text-[14px] font-medium text-ink">
            {p.enrollmentsCount ?? 0}
          </p>
        </div>
      </div>

      {p.items?.length > 0 && (
        <div className="mb-4">
          <p className="mb-1 text-[10px] uppercase tracking-[0.05em] text-content-muted">Includes</p>
          <ul className="space-y-1">
            {p.items.slice(0, 3).map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-[12px] text-content-secondary">
                <Repeat size={11} className="text-content-muted" />
                <span className="truncate">
                  {item.productName ?? `Product ${item.productId.slice(0, 8)}…`} × {item.quantity}
                </span>
                {item.frequency && <span className="text-content-muted">· {item.frequency.toLowerCase()}</span>}
              </li>
            ))}
            {p.items.length > 3 && (
              <li className="text-[11px] text-content-muted">+ {p.items.length - 3} more</li>
            )}
          </ul>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2">
        <Link
          href={`/pharmacy/programs/${p.id}`}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
        >
          <Users size={12} /> View enrolments
        </Link>
        <Button variant="secondary" size="md" onClick={togglePublish} disabled={busy}>
          {busy ? (
            <Loader2 size={13} className="animate-spin" />
          ) : p.isPublished ? (
            <><EyeOff size={13} /> Unpublish</>
          ) : (
            <><Globe size={13} /> Publish</>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function ProgramsPage() {
  const { data: me } = useApiQuery(meQuery);
  const isPharmacy = verticalOf(me) === "pharmacy";

  const [createOpen, setCreateOpen] = useState(false);
  const { data, loading, error, refetch } = useApiQuery(programsApi.list);
  const programs = data ?? [];

  const totalEnrolled = programs.reduce((sum, p) => sum + (p.enrollmentsCount ?? 0), 0);
  const monthlyRecurring = programs.reduce(
    (sum, p) => sum + p.monthlyPrice * (p.enrollmentsCount ?? 0),
    0,
  );
  const publishedCount = programs.filter((p) => p.isPublished).length;

  return (
    <AppShell
      title="Drug programs"
      subtitle="Subscription care plans for chronic patients"
      actions={
        isPharmacy ? (
          <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
            <Plus size={17} />
            <span className="hidden sm:inline">New program</span>
          </Button>
        ) : undefined
      }
    >
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-content-secondary hover:text-ink"
      >
        ← Back to Dashboard
      </Link>

      {!isPharmacy ? (
        <EmptyState
          icon={ClipboardPlus}
          title="Programs are a pharmacy feature"
          description="Subscription drug-program management is built for pharmacy chronic care."
        />
      ) : (
        <BetaFeatureGate
          featureKey="drug_programs"
          featureName="Drug Programs"
          description="Bundle products + reminders + consultations into a monthly subscription patients can enrol in."
        >
          {/* Headline stats */}
          {programs.length > 0 && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[13px] text-content-secondary">Active programs</p>
                  <CheckCircle2 size={18} className="text-content-muted" />
                </div>
                <p className="font-mono text-[24px] font-medium leading-none text-ink">{publishedCount}</p>
              </div>
              <div className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[13px] text-content-secondary">Total enrolled</p>
                  <Users size={18} className="text-content-muted" />
                </div>
                <p className="font-mono text-[24px] font-medium leading-none text-ink">{totalEnrolled}</p>
              </div>
              <div className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[13px] text-content-secondary">Monthly recurring</p>
                  <Calendar size={18} className="text-content-muted" />
                </div>
                <p className="font-mono text-[24px] font-medium leading-none text-success">
                  {naira(monthlyRecurring)}
                </p>
              </div>
            </div>
          )}

          <QueryBoundary
            loading={loading}
            error={error}
            isEmpty={programs.length === 0}
            onRetry={refetch}
            loadingLabel="Loading programs…"
            gatedFeatureTitle="Pharmacy programs"
            empty={
              <EmptyState
                icon={ClipboardPlus}
                title="No programs yet"
                description="Build a care program around a chronic condition. Patients subscribe; you get predictable recurring revenue."
                action={
                  <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
                    <Plus size={17} /> Create your first program
                  </Button>
                }
              />
            }
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {programs.map((p) => (
                <ProgramCard key={p.id} p={p} onChanged={refetch} />
              ))}
            </div>
          </QueryBoundary>

          <NewProgramModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onCreated={refetch}
          />
        </BetaFeatureGate>
      )}
    </AppShell>
  );
}
