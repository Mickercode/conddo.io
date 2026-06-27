import { Link2, Copy } from "lucide-react";
import { Frame } from "./Frame";
import { Chip } from "../ui/Chip";
import { APP_DOMAIN, tenantPayUrl } from "@/lib/brand";

const invoices = [
  { id: "INV-204", name: "Adaeze O.", amount: "₦42,000", tone: "success" as const, status: "Paid" },
  { id: "INV-203", name: "Tunde B.", amount: "₦85,000", tone: "warning" as const, status: "Due soon" },
  { id: "INV-201", name: "Chioma N.", amount: "₦28,000", tone: "danger" as const, status: "Overdue" },
];

export function PaymentsMock() {
  return (
    <Frame url={`payments · ${APP_DOMAIN}`}>
      <div className="bg-neutral-surface p-5">
        {/* Headline figure */}
        <div className="mb-4 rounded-lg border border-neutral-border p-4">
          <p className="text-[11px] text-content-muted">Received this month</p>
          <p className="mt-1 font-mono text-[28px] font-medium leading-none text-ink">
            ₦1,840,500
          </p>
          <div className="mt-3 flex gap-2">
            <span className="font-mono text-[11px] text-warning">
              ₦240,000 outstanding
            </span>
            <span className="text-content-muted">·</span>
            <span className="font-mono text-[11px] text-danger">
              ₦65,000 overdue
            </span>
          </div>
        </div>

        {/* Invoice list */}
        <ul className="mb-4 space-y-2">
          {invoices.map((inv) => (
            <li
              key={inv.id}
              className="flex items-center justify-between rounded-lg border border-neutral-border px-3.5 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-content-muted">{inv.id}</span>
                <span className="text-[13px] text-ink">{inv.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[12px] text-ink">{inv.amount}</span>
                <Chip tone={inv.tone}>{inv.status}</Chip>
              </div>
            </li>
          ))}
        </ul>

        {/* Payment link */}
        <div className="flex items-center justify-between rounded-lg bg-primary-bg px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <Link2 size={15} className="text-primary" />
            <span className="font-mono text-[12px] text-primary">
              {tenantPayUrl("amaka-styles")}
            </span>
          </div>
          <Copy size={14} className="text-primary" />
        </div>
      </div>
    </Frame>
  );
}
