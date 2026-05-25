"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Check } from "lucide-react";
import { TextInput } from "@/components/ui/Field";
import { customersApi, type Customer } from "@/lib/api/customers";

/**
 * Search-or-type customer picker: pick an existing CRM customer (links by id,
 * `onPick`) or type a free-text name (`onTypeName`). Shared by New Order and
 * New Booking. Debounced search against GET /customers?search=.
 */
export function CustomerPicker({
  value,
  onPick,
  onTypeName,
  error,
}: {
  value: { id: string | null; name: string };
  onPick: (c: Customer) => void;
  onTypeName: (name: string) => void;
  error?: string;
}) {
  const [query, setQuery] = useState(value.name);
  const [results, setResults] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Keep the input in sync when the parent resets/sets the value externally.
  useEffect(() => setQuery(value.name), [value.name]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    const t = setTimeout(async () => {
      try {
        const { data } = await customersApi.list({ search: q, size: 6 });
        if (active) setResults(data ?? []);
      } catch {
        if (active) setResults([]);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
      <TextInput
        value={query}
        error={error}
        className="pl-9"
        placeholder="Search customers or type a name"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onTypeName(e.target.value);
          setOpen(true);
        }}
      />
      {value.id && (
        <span className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-[11px] font-medium text-success">
          <Check size={12} /> Linked
        </span>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-neutral-border bg-neutral-surface py-1">
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(c);
                  setQuery(c.name);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-neutral-surface2"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-bg font-mono text-[11px] font-medium text-primary">
                  {c.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] text-ink">{c.name}</span>
                  <span className="block truncate text-[11px] text-content-muted">{c.phone || c.email}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
