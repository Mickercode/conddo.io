import { TrendingUp } from "lucide-react";
import { Frame } from "./Frame";
import { APP_DOMAIN } from "@/lib/brand";

const stats = [
  { label: "Revenue", value: "₦1.84M" },
  { label: "Orders", value: "146" },
  { label: "Conversion", value: "4.8%" },
];

const top = [
  { name: "Ankara Wrap Dress", pct: 92, sales: "38" },
  { name: "Tailored Agbada", pct: 71, sales: "24" },
  { name: "Silk Gele Set", pct: 54, sales: "19" },
  { name: "Kaftan", pct: 33, sales: "11" },
];

const line = [30, 42, 38, 55, 48, 67, 60, 78];

export function AnalyticsMock() {
  return (
    <Frame url={`analytics · ${APP_DOMAIN}`}>
      <div className="bg-neutral-surface p-5">
        {/* Stat tiles */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-neutral-border p-3">
              <p className="text-[11px] text-content-muted">{s.label}</p>
              <p className="mt-1 font-mono text-lg font-medium leading-none text-ink">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Trend chart */}
        <div className="mb-4 rounded-lg border border-neutral-border p-4">
          <div className="mb-3 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-success" />
            <p className="text-[12px] font-medium text-ink">Revenue trend</p>
            <span className="ml-auto font-mono text-[11px] text-success">+18%</span>
          </div>
          <div className="flex h-20 items-end gap-1.5">
            {line.map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm ${
                  i === line.length - 1 ? "bg-primary" : "bg-primary/25"
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-lg border border-neutral-border p-4">
          <p className="mb-3 text-[12px] font-medium text-ink">Best sellers</p>
          <ul className="space-y-2.5">
            {top.map((p) => (
              <li key={p.name} className="flex items-center gap-3">
                <span className="w-28 truncate text-[12px] text-content-secondary">
                  {p.name}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-surface2">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
                <span className="w-6 text-right font-mono text-[11px] text-content-muted">
                  {p.sales}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Frame>
  );
}
