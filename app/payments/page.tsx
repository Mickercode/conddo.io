import { Plus, Download, CalendarDays, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { naira } from "@/lib/format";

type Status = "Paid" | "Overdue" | "Outstanding";
const statusTone: Record<Status, "success" | "danger" | "warning"> = {
  Paid: "success",
  Overdue: "danger",
  Outstanding: "warning",
};

const stats = [
  { label: "This month", value: naira(847000), tone: "text-primary" },
  { label: "Outstanding", value: naira(124500), tone: "text-warning" },
  { label: "Paid invoices", value: "34", tone: "text-ink" },
  { label: "Overdue", value: naira(31000), tone: "text-danger" },
];

const FILTERS = ["All", "Received", "Outstanding", "Overdue"];

type Txn = {
  date: string;
  customer: string;
  description: string;
  amount: number;
  method: string | null;
  status: Status;
};

const TXNS: Txn[] = [
  { date: "23 May", customer: "Chioma Eze", description: "ORD-0891 Balance", amount: 17500, method: "Paystack", status: "Paid" },
  { date: "22 May", customer: "Funmi Adeyemi", description: "ORD-0889 Deposit", amount: 12000, method: "Bank transfer", status: "Paid" },
  { date: "20 May", customer: "Ada Nwosu", description: "ORD-0885 Balance", amount: 18500, method: null, status: "Overdue" },
  { date: "19 May", customer: "Bisi Adegoke", description: "ORD-0882 Balance", amount: 14000, method: null, status: "Outstanding" },
];

const OUTSTANDING = [
  { name: "Ada Nwosu", note: "3 Overdue invoices", amount: 18500, tone: "text-danger" },
  { name: "Bisi Adegoke", note: "1 Outstanding invoice", amount: 14000, tone: "text-warning" },
  { name: "Ngozi Obi", note: "2 Pending deposits", amount: 45000, tone: "text-ink" },
  { name: "Zainab Saliu", note: "1 Overdue invoice", amount: 12500, tone: "text-danger" },
];

export default function PaymentsPage() {
  return (
    <AppShell
      title="Payments"
      actions={
        <>
          <Button variant="secondary" size="md" className="hidden md:inline-flex">
            <Download size={16} />
            Export CSV
          </Button>
          <Button variant="secondary" size="md" className="hidden sm:inline-flex">
            Payment link
          </Button>
          <Button variant="primary" size="md">
            <Plus size={17} />
            <span className="hidden sm:inline">Create Invoice</span>
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        {/* Left: stats + table */}
        <div className="min-w-0 space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
                <p className="mb-2 text-[11px] uppercase tracking-[0.05em] text-content-secondary">{s.label}</p>
                <p className={`font-mono text-[26px] font-medium leading-none ${s.tone}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const active = f === "All";
              return (
                <button
                  key={f}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
                    active
                      ? "border-primary/20 bg-primary-bg font-medium text-primary"
                      : "border-neutral-border bg-neutral-surface text-content-secondary hover:bg-neutral-surface2"
                  }`}
                >
                  {f}
                </button>
              );
            })}
            <span className="mx-1 hidden h-6 w-px bg-neutral-border sm:block" />
            <button className="flex items-center gap-1.5 rounded-full border border-neutral-border bg-neutral-surface px-3.5 py-1.5 text-[13px] text-content-secondary hover:bg-neutral-surface2">
              <CalendarDays size={15} />
              May 1 – May 31, 2024
            </button>
          </div>

          {/* Transactions table */}
          <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-neutral-border bg-neutral-surface2 text-[11px] uppercase tracking-[0.05em] text-content-secondary">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-center font-medium">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border">
                  {TXNS.map((t) => (
                    <tr key={t.customer} className="transition-colors hover:bg-neutral-surface2">
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[13px] text-content-secondary">{t.date}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[14px] text-ink">{t.customer}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[14px] text-content-secondary">{t.description}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-[13px] text-ink">{naira(t.amount)}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[14px] text-content-secondary">{t.method ?? <span className="text-content-muted">—</span>}</td>
                      <td className="px-4 py-3.5"><Chip tone={statusTone[t.status]}>{t.status}</Chip></td>
                      <td className="px-4 py-3.5 text-center">
                        {t.status === "Paid" ? (
                          <button aria-label="Download receipt" className="text-content-muted transition-colors hover:text-primary">
                            <Download size={18} />
                          </button>
                        ) : (
                          <button className="text-[12px] font-medium text-primary hover:underline">Send reminder</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: outstanding */}
        <aside className="rounded-xl border border-neutral-border bg-neutral-surface">
          <div className="border-b border-neutral-border p-6">
            <h3 className="mb-4 text-[16px] font-medium text-ink">Outstanding</h3>
            <div className="flex gap-3 rounded-lg border border-warning/15 bg-warning-bg p-4">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
              <div>
                <p className="mb-0.5 text-[11px] font-medium uppercase tracking-[0.05em] text-warning">Action Required</p>
                <p className="text-[13px] text-content-secondary">4 customers have payments overdue by more than 7 days.</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="mb-4 text-[11px] uppercase tracking-[0.05em] text-content-secondary">By Customer</p>
            <div className="space-y-5">
              {OUTSTANDING.map((c) => (
                <div key={c.name}>
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <p className="text-[14px] font-medium text-ink">{c.name}</p>
                      <p className="text-[11px] text-content-muted">{c.note}</p>
                    </div>
                    <span className={`font-mono text-[14px] ${c.tone}`}>{naira(c.amount)}</span>
                  </div>
                  <button className="w-full rounded-md border border-neutral-border bg-neutral-surface2 py-2 text-[13px] font-medium text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white">
                    Send reminder
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
