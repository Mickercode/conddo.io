"use client";

import Link from "next/link";
import { ClipboardPlus, ArrowRight, Users, TrendingUp } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { featuresApi } from "@/lib/api/features";
import { programsApi } from "@/lib/api/programs";
import { naira } from "@/lib/format";

/** Pharmacy dashboard widget — surfaces drug program MRR + enrolment count.
 *  Self-gates on the `drug_programs` flag. */
export function DashboardProgramsWidget() {
  const flagsQ = useApiQuery(featuresApi.flags);
  const enabled = flagsQ.data?.some((f) => f.featureKey === "drug_programs" && f.enabled);

  const programsQ = useApiQuery(
    () => enabled ? programsApi.list() : Promise.resolve({ data: [] as Awaited<ReturnType<typeof programsApi.list>>["data"] }),
    [enabled],
  );

  if (!enabled) return null;

  const programs = programsQ.data ?? [];
  const publishedCount = programs.filter((p) => p.isPublished).length;
  const totalEnrolled = programs.reduce((s, p) => s + (p.enrollmentsCount ?? 0), 0);
  const mrr = programs.reduce(
    (s, p) => s + p.monthlyPrice * (p.enrollmentsCount ?? 0),
    0,
  );

  return (
    <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/[0.08] text-primary">
            <ClipboardPlus size={15} />
          </span>
          <div>
            <h3 className="text-[14px] font-medium text-white">Care programs</h3>
            <p className="text-[12px] text-white/45">
              {publishedCount === 0 ? "No published programs yet." : (
                <>{publishedCount} program{publishedCount === 1 ? "" : "s"} live</>
              )}
            </p>
          </div>
        </div>
        <Link
          href="/pharmacy/programs"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
        >
          Manage <ArrowRight size={11} />
        </Link>
      </div>

      {programsQ.loading ? (
        <p className="py-4 text-center text-[12px] text-white/45">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-white/[0.02] px-3 py-2.5">
            <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.05em] text-white/45">
              <Users size={10} /> Enrolled
            </p>
            <p className="mt-1 font-mono text-[20px] font-medium leading-none text-white">
              {totalEnrolled}
            </p>
          </div>
          <div className="rounded-md bg-emerald-500/15/50 px-3 py-2.5">
            <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.05em] text-emerald-300">
              <TrendingUp size={10} /> MRR
            </p>
            <p className="mt-1 font-mono text-[20px] font-medium leading-none text-emerald-300">
              {naira(mrr)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
