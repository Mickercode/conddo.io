"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  Download,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { AddCustomerModal } from "@/components/app/AddCustomerModal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { customersApi, tagTone } from "@/lib/api/customers";
import { downloadCsv } from "@/lib/csv";

const FILTERS = ["All", "New this month", "High value", "Inactive"];
const FILTER_PARAM: Record<string, string> = {
  All: "",
  "New this month": "new",
  "High value": "high_value",
  Inactive: "inactive",
};
const PAGE_SIZE = 20;

export default function CustomersPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [addOpen, setAddOpen] = useState(false);

  const { data, meta, loading, error, refetch } = useApiQuery(
    () => customersApi.list({ search, filter: FILTER_PARAM[activeFilter], page, size: PAGE_SIZE }),
    [search, activeFilter, page],
  );
  const customers = data ?? [];
  const total = meta?.total ?? 0;
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min(total, (page + 1) * PAGE_SIZE);

  return (
    <AppShell
      title="Customers"
      subtitle={total > 0 ? `${total} customers` : undefined}
      actions={
        <>
          <Button
            variant="secondary"
            size="md"
            onClick={() =>
              downloadCsv("customers", customers, [
                { header: "Name", accessor: (c) => c.name },
                { header: "Phone", accessor: (c) => c.phone ?? "" },
                { header: "Email", accessor: (c) => c.email ?? "" },
                { header: "Total spent (NGN)", accessor: (c) => c.totalSpent },
                { header: "Orders", accessor: (c) => c.orders },
                { header: "Last active", accessor: (c) => c.lastActive ?? "" },
                { header: "Tag", accessor: (c) => c.tag ?? "" },
              ])
            }
            disabled={customers.length === 0}
            className="hidden sm:inline-flex"
          >
            <Download size={16} />
            Export CSV
          </Button>
          <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
            <Plus size={17} />
            <span className="hidden sm:inline">Add Customer</span>
          </Button>
        </>
      }
    >
      {/* Filters + search */}
      <div className="mb-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = f === activeFilter;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setActiveFilter(f);
                    setPage(0);
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
                    active
                      ? "border border-primary bg-neutral-surface font-medium text-primary"
                      : "border border-transparent text-content-secondary hover:text-primary"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </nav>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(0);
            setSearch(searchInput.trim());
          }}
          className="relative"
        >
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, phone, or email"
            className="w-full rounded-lg border border-neutral-border bg-neutral-surface py-2.5 pl-11 pr-4 text-[14px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </form>
      </div>

      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={customers.length === 0}
        onRetry={refetch}
        loadingLabel="Loading customers…"
        empty={
          <EmptyState
            icon={Users}
            title={search || activeFilter !== "All" ? "No matching customers" : "No customers yet"}
            description={
              search || activeFilter !== "All"
                ? "Try a different search or clear the filter."
                : "Add customers to start tracking orders, spend, and contact details."
            }
            action={
              !search && activeFilter === "All" ? (
                <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
                  <Plus size={17} /> Add your first customer
                </Button>
              ) : undefined
            }
          />
        }
      >
        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-neutral-border text-[11px] uppercase tracking-[0.05em] text-content-muted">
                  <th className="py-3 pl-5 pr-5 font-medium">Customer</th>
                  <th className="py-3 pr-5 font-medium">Phone</th>
                  <th className="py-3 pr-5 font-medium">Total Spent</th>
                  <th className="py-3 pr-5 text-center font-medium">Orders</th>
                  <th className="py-3 pr-5 font-medium">Last Active</th>
                  <th className="py-3 pr-5 font-medium">Tags</th>
                  <th className="py-3 pr-5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {customers.map((c) => (
                  <tr key={c.id} className="group transition-colors hover:bg-neutral-surface2">
                    <td className="py-3 pl-5 pr-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-bg font-mono text-[12px] font-medium text-primary">
                          {c.initials}
                        </span>
                        <span className="whitespace-nowrap text-[14px] text-ink">{c.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-5 text-[14px] text-content-secondary">{c.phone}</td>
                    <td className="whitespace-nowrap py-3 pr-5 font-mono text-[13px] text-ink">{naira(c.totalSpent)}</td>
                    <td className="py-3 pr-5 text-center text-[14px] text-content-secondary">{c.orders}</td>
                    <td className="whitespace-nowrap py-3 pr-5 text-[14px] text-content-secondary">
                      {c.lastActive === "Never" ? <span className="italic text-content-muted">Never</span> : c.lastActive}
                    </td>
                    <td className="py-3 pr-5">{c.tag && <Chip tone={tagTone[c.tag]}>{c.tag}</Chip>}</td>
                    <td className="py-3 pr-5 text-right">
                      <Link
                        href={`/customers/${c.id}`}
                        className="whitespace-nowrap text-[13px] font-medium text-primary opacity-0 transition-opacity hover:underline group-hover:opacity-100"
                      >
                        View profile →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-[13px] text-content-secondary">
            Showing {from}–{to} of {total}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-border text-content-muted hover:bg-neutral-surface2 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => (to < total ? p + 1 : p))}
              disabled={to >= total}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-border text-content-muted hover:bg-neutral-surface2 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </QueryBoundary>

      <AddCustomerModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setPage(0);
          setActiveFilter("All");
          setSearch("");
          setSearchInput("");
          refetch();
        }}
      />
    </AppShell>
  );
}
