"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Users, ShoppingCart, CalendarDays, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { searchApi, type SearchHit, type SearchResults } from "@/lib/api/search";
import { isNotConfigured, isServerError } from "@/lib/api/client";

type Group = { key: keyof SearchResults; label: string; icon: LucideIcon; href: (id: string) => string };

const GROUPS: Group[] = [
  { key: "customers", label: "Customers", icon: Users, href: (id) => `/customers/${id}` },
  { key: "orders", label: "Orders", icon: ShoppingCart, href: (id) => `/orders/${id}` },
  { key: "bookings", label: "Bookings", icon: CalendarDays, href: () => `/bookings` },
];

export default function SearchPage() {
  return (
    <Suspense fallback={<AppShell title="Search" subtitle="Find customers, orders, and bookings"><div /></AppShell>}>
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = query.trim();
    // Keep the URL shareable/back-friendly.
    const usp = new URLSearchParams(q ? { q } : {});
    router.replace(`/search${q ? `?${usp.toString()}` : ""}`);

    if (q.length < 2) {
      setResults(null);
      setSearched(false);
      return;
    }
    let active = true;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await searchApi.query(q);
        if (active) { setResults(data); setSearched(true); }
      } catch (err) {
        // Unbuilt/not-configured → just show "no results" rather than an error.
        if (active) { setResults(isNotConfigured(err) || isServerError(err) ? { customers: [], orders: [], bookings: [] } : null); setSearched(true); }
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => { active = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const total = results ? results.customers.length + results.orders.length + results.bookings.length : 0;

  return (
    <AppShell title="Search" subtitle="Find customers, orders, and bookings">
      <div className="mx-auto max-w-2xl">
        <div className="relative">
          <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-content-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, reference, phone…"
            className="w-full rounded-xl border border-neutral-border bg-neutral-surface py-3.5 pl-12 pr-4 text-[15px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="mt-6 space-y-6">
          {query.trim().length < 2 ? (
            <p className="py-12 text-center text-[14px] text-content-muted">Type at least 2 characters to search.</p>
          ) : loading && !results ? (
            <p className="py-12 text-center text-[14px] text-content-secondary">Searching…</p>
          ) : searched && total === 0 ? (
            <p className="py-12 text-center text-[14px] text-content-secondary">No results for “{query.trim()}”.</p>
          ) : (
            GROUPS.map((g) => {
              const hits = results?.[g.key] ?? [];
              if (hits.length === 0) return null;
              return (
                <section key={g.key}>
                  <div className="mb-2 flex items-center gap-2 px-1 text-[11px] uppercase tracking-[0.05em] text-content-muted">
                    <g.icon size={14} /> {g.label}
                  </div>
                  <ul className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface divide-y divide-neutral-border">
                    {hits.map((h: SearchHit) => (
                      <li key={h.id}>
                        <Link href={g.href(h.id)} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-surface2">
                          <span className="min-w-0">
                            <span className="block truncate text-[14px] text-ink">{h.label}</span>
                            {h.sublabel && <span className="block truncate text-[12px] text-content-muted">{h.sublabel}</span>}
                          </span>
                          <span className="text-[13px] text-primary">Open →</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
