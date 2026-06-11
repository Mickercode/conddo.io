"use client";

import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { featuresApi } from "@/lib/api/features";
import { emrApi } from "@/lib/api/emr";

/** Hard-coded high-visibility allergy alert at the top of customer detail
 *  for pharmacy tenants. Self-gates on `emr_basic` flag AND on the EMR
 *  having at least one allergy on file — silent otherwise. Prevents the
 *  pharmacist from dispensing without seeing the contraindication. */
export function CustomerEmrAllergiesBanner({ customerId }: { customerId: string }) {
  const flagsQ = useApiQuery(featuresApi.flags);
  const enabled = flagsQ.data?.some((f) => f.featureKey === "emr_basic" && f.enabled);

  const emrQ = useApiQuery(
    () => enabled ? emrApi.get(customerId) : Promise.resolve({ data: null as never }),
    [enabled, customerId],
  );

  if (!enabled) return null;
  if (emrQ.loading) return null;
  if (emrQ.error || !emrQ.data) return null;

  const allergies = emrQ.data.allergies ?? [];
  if (allergies.length === 0) return null;

  const lifethreatening = allergies.find((a) => a.severity?.toLowerCase().includes("life"));
  const tone = lifethreatening ? "danger" : "warning";

  return (
    <div className={`rounded-xl border p-4 ${
      tone === "danger"
        ? "border-danger/30 bg-danger-bg/40"
        : "border-warning/30 bg-warning-bg/40"
    }`}>
      <div className="flex items-start gap-3">
        <ShieldAlert size={18} className={tone === "danger" ? "shrink-0 text-danger" : "shrink-0 text-warning"} />
        <div className="min-w-0 flex-1">
          <p className={`text-[14px] font-medium ${tone === "danger" ? "text-danger" : "text-warning"}`}>
            {allergies.length} known allergy{allergies.length === 1 ? "" : "ies"} on file
          </p>
          <ul className="mt-1.5 space-y-1">
            {allergies.slice(0, 4).map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-[12px] text-content-secondary">
                <span className="font-medium text-ink">{a.substance}</span>
                {a.severity && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    a.severity.toLowerCase().includes("life") || a.severity.toLowerCase().includes("severe")
                      ? "bg-danger text-white"
                      : "bg-warning/20 text-warning"
                  }`}>
                    {a.severity}
                  </span>
                )}
                {a.reaction && <span className="text-content-muted">— {a.reaction}</span>}
              </li>
            ))}
            {allergies.length > 4 && (
              <li className="text-[11px] text-content-muted">+ {allergies.length - 4} more</li>
            )}
          </ul>
        </div>
        <Link
          href={`/pharmacy/emr/${customerId}`}
          className="shrink-0 self-start text-[12px] font-medium text-primary hover:underline"
          aria-label="Open EMR"
        >
          EMR <ArrowRight size={11} className="inline -mt-0.5" />
        </Link>
      </div>
    </div>
  );
}
