import { Instagram, Facebook, Calendar } from "lucide-react";
import { Frame } from "./Frame";
import { Chip } from "../ui/Chip";

const week = [
  { day: "M", dots: 1 },
  { day: "T", dots: 0 },
  { day: "W", dots: 2 },
  { day: "T", dots: 1 },
  { day: "F", dots: 1, active: true },
  { day: "S", dots: 0 },
  { day: "S", dots: 1 },
];

export function MarketingMock() {
  return (
    <Frame url="marketing · conddo.io">
      <div className="bg-neutral-surface p-5">
        {/* Mini content calendar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-content-muted" />
            <p className="text-[13px] font-medium text-ink">Content calendar</p>
          </div>
          <span className="font-mono text-[11px] text-content-muted">This week</span>
        </div>
        <div className="mb-4 grid grid-cols-7 gap-1.5">
          {week.map((d, i) => (
            <div
              key={i}
              className={`flex h-14 flex-col items-center justify-between rounded-md border p-1.5 ${
                d.active
                  ? "border-primary bg-primary-bg"
                  : "border-neutral-border bg-neutral-surface"
              }`}
            >
              <span className="font-mono text-[10px] text-content-muted">{d.day}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: d.dots }).map((_, j) => (
                  <span key={j} className="h-1.5 w-1.5 rounded-full bg-primary" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Scheduled post */}
        <div className="mb-3 flex items-center justify-between rounded-lg border border-neutral-border px-3.5 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1">
              <Instagram size={15} className="text-primary" />
              <Facebook size={15} className="text-primary" />
            </div>
            <span className="text-[12px] text-ink">New arrivals post</span>
          </div>
          <Chip tone="primary">Fri 10:00</Chip>
        </div>

        {/* Ad campaign — the Naira unlock */}
        <div className="rounded-lg bg-ink p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-medium text-white">Meta Ads campaign</span>
            <Chip tone="success">Active</Chip>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] text-white/50">Budget · Naira</p>
              <p className="font-mono text-[18px] font-medium leading-none text-white">
                ₦15,000<span className="text-[11px] text-white/50">/wk</span>
              </p>
            </div>
            <span className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-white">
              Top up in ₦
            </span>
          </div>
        </div>
      </div>
    </Frame>
  );
}
