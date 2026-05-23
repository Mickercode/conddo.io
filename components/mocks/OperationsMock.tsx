import { Package, AlertTriangle } from "lucide-react";
import { Frame } from "./Frame";
import { Chip } from "../ui/Chip";

const pipeline = [
  { id: "#1042", name: "Adaeze — Wrap dress", tone: "info" as const, stage: "Received" },
  { id: "#1039", name: "Tunde — 3pc Agbada", tone: "warning" as const, stage: "In production" },
  { id: "#1036", name: "Ngozi — Gele set", tone: "primary" as const, stage: "Ready" },
  { id: "#1031", name: "Bola — Kaftan", tone: "success" as const, stage: "Delivered" },
];

export function OperationsMock() {
  return (
    <Frame url="orders · conddo.io">
      <div className="bg-neutral-surface p-5">
        {/* Order pipeline */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] font-medium text-ink">Order pipeline</p>
          <span className="font-mono text-[11px] text-content-muted">4 active</span>
        </div>
        <ul className="space-y-2">
          {pipeline.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between rounded-lg border border-neutral-border bg-neutral-surface px-3.5 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-content-muted">{o.id}</span>
                <span className="text-[13px] text-ink">{o.name}</span>
              </div>
              <Chip tone={o.tone}>{o.stage}</Chip>
            </li>
          ))}
        </ul>

        {/* Inventory alert */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-warning-bg px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={16} className="text-warning" />
            <div>
              <p className="text-[12px] font-medium text-ink">Ankara fabric — navy</p>
              <p className="text-[11px] text-content-secondary">Low stock</p>
            </div>
          </div>
          <span className="font-mono text-[13px] font-medium text-warning">3 left</span>
        </div>

        {/* Customer record hint */}
        <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-neutral-border px-3.5 py-2.5">
          <Package size={15} className="text-content-muted" />
          <p className="text-[12px] text-content-secondary">
            Every order linked to its customer record &amp; history
          </p>
        </div>
      </div>
    </Frame>
  );
}
