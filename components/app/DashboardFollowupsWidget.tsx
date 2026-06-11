"use client";

import Link from "next/link";
import { ListChecks, CalendarClock, AlertCircle, ArrowRight, Phone } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { useApiQuery } from "@/hooks/useApiQuery";
import { featuresApi } from "@/lib/api/features";
import { followupsApi, followupProductName, type Followup } from "@/lib/api/followups";

function fmtTimeShort(s: string): string {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const dt = new Date(d); dt.setHours(0, 0, 0, 0);
  const timePart = d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  if (dt.getTime() === today.getTime()) return `Today · ${timePart}`;
  if (dt.getTime() === tomorrow.getTime()) return `Tomorrow · ${timePart}`;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

/** Pharmacy dashboard widget — shows the next handful of follow-ups due.
 *  Self-gates on the `followup_workflow` flag; renders nothing until the
 *  tenant is granted access (no "request access" CTA here — that lives
 *  on the dedicated /pharmacy/followups page). */
export function DashboardFollowupsWidget() {
  const flagsQ = useApiQuery(featuresApi.flags);
  const enabled = flagsQ.data?.some((f) => f.featureKey === "followup_workflow" && f.enabled);

  const dueQ = useApiQuery(
    () => enabled ? followupsApi.dueToday() : Promise.resolve({ data: [] as Followup[] }),
    [enabled],
  );

  if (!enabled) return null;

  const dueRaw = dueQ.data ?? [];
  const due = dueRaw.slice(0, 4);
  const overdue = dueRaw.filter((f) => new Date(f.dueDate).getTime() < Date.now()).length;

  return (
    <div className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-bg text-primary">
            <ListChecks size={15} />
          </span>
          <div>
            <h3 className="text-[14px] font-medium text-ink">Follow-ups due</h3>
            <p className="text-[12px] text-content-muted">
              {dueRaw.length === 0 ? "Nothing scheduled in the next 24h." : (
                <>{dueRaw.length} due{overdue > 0 ? ` · ${overdue} overdue` : ""}</>
              )}
            </p>
          </div>
        </div>
        <Link
          href="/pharmacy/followups"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
        >
          View all <ArrowRight size={11} />
        </Link>
      </div>

      {dueQ.loading ? (
        <p className="py-4 text-center text-[12px] text-content-muted">Loading…</p>
      ) : due.length === 0 ? (
        <div className="rounded-md bg-neutral-surface2 px-3 py-4 text-center">
          <p className="text-[12px] text-content-muted">All caught up — no follow-ups due in the next 24 hours.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {due.map((f) => {
            const productName = followupProductName(f.product);
            const isOverdue = new Date(f.dueDate).getTime() < Date.now();
            return (
              <li
                key={f.id}
                className="flex items-start gap-3 rounded-md bg-neutral-surface2 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-[13px] font-medium text-ink">
                      {f.customer.name ?? "Patient"}
                    </p>
                    {isOverdue && <Chip tone="danger">Overdue</Chip>}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-content-secondary">
                    {productName ? `${productName} — ` : ""}{f.checkNote}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-content-muted">
                    <CalendarClock size={10} /> {fmtTimeShort(f.dueDate)}
                  </p>
                </div>
                {f.customer.phone && (
                  <a
                    href={`tel:${f.customer.phone}`}
                    aria-label={`Call ${f.customer.name ?? ""}`}
                    title={f.customer.phone}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-content-muted hover:bg-primary-bg hover:text-primary"
                  >
                    <Phone size={12} />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {overdue > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-[10px] text-danger">
          <AlertCircle size={10} /> Overdue follow-ups need a call today.
        </p>
      )}
    </div>
  );
}
