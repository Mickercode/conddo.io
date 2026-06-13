"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Pencil, Trash2, Check, X, Loader2, Tag, Sparkles, AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { inventoryApi, type Category } from "@/lib/api/inventory";
import { meQuery } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import { inventoryCategorySuggestions, verticalOf } from "@/lib/verticalCopy";

function CategoryRow({
  cat,
  existingNames,
  onChanged,
}: {
  cat: Category;
  existingNames: Set<string>;
  onChanged: () => void;
}) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const count = cat.productCount;
  const hasProducts = (count ?? 0) > 0;

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name can't be empty");
      return;
    }
    if (trimmed === cat.name) {
      setEditing(false);
      return;
    }
    if (existingNames.has(trimmed.toLowerCase())) {
      toast.error("Already in use", "Another category has that name.");
      return;
    }
    setSaving(true);
    try {
      await inventoryApi.updateCategory(cat.id, { name: trimmed });
      toast.success("Category renamed", trimmed);
      setEditing(false);
      onChanged();
    } catch (err) {
      toast.error("Couldn't rename", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (hasProducts) {
      toast.error("Move products first", `${count} product${count === 1 ? "" : "s"} are still in this category.`);
      return;
    }
    if (!confirm(`Delete "${cat.name}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      await inventoryApi.removeCategory(cat.id);
      toast.success("Category deleted", cat.name);
      onChanged();
    } catch (err) {
      toast.error("Couldn't delete", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-white/[0.02]">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/[0.08] text-primary">
          <Tag size={14} />
        </span>
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); save(); }
              if (e.key === "Escape") { setName(cat.name); setEditing(false); }
            }}
            disabled={saving}
            autoFocus
            className="h-9 flex-1 rounded-md border border-primary bg-cinema-base px-3 text-[14px] text-white focus:outline-none"
          />
        ) : (
          <p className="truncate text-[14px] font-medium text-white">{cat.name}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-mono text-[12px] text-white/45">
          {count != null ? `${count} product${count === 1 ? "" : "s"}` : "—"}
        </span>
        {editing ? (
          <>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              aria-label="Save"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-300 hover:bg-emerald-500/15 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={15} />}
            </button>
            <button
              type="button"
              onClick={() => { setName(cat.name); setEditing(false); }}
              disabled={saving}
              aria-label="Cancel"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/45 hover:bg-cinema-elev hover:text-white"
            >
              <X size={15} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Rename"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/45 hover:bg-cinema-elev hover:text-white"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={deleting || hasProducts}
              aria-label="Delete"
              title={hasProducts ? `${count} product${count === 1 ? "" : "s"} still in this category — move them first.` : "Delete category"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/45 hover:bg-rose-500/[0.06] hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/45"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </>
        )}
      </div>
    </li>
  );
}

function AddCategoryRow({
  existingNames,
  onAdded,
}: {
  existingNames: Set<string>;
  onAdded: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (existingNames.has(trimmed.toLowerCase())) {
      toast.error("Already in use", `"${trimmed}" already exists.`);
      return;
    }
    setSaving(true);
    try {
      await inventoryApi.createCategory(trimmed);
      toast.success("Category added", trimmed);
      setName("");
      onAdded();
    } catch (err) {
      toast.error("Couldn't add", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2 border-t border-white/[0.06] bg-white/[0.02] px-5 py-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        disabled={saving}
        placeholder="Add a category (press Enter)…"
        className="h-9 flex-1 rounded-md border border-white/10 bg-cinema-base px-3 text-[14px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none"
      />
      <Button variant="primary" size="md" onClick={add} disabled={saving || !name.trim()}>
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={15} />}
        Add
      </Button>
    </div>
  );
}

function SuggestionChips({
  suggestions,
  existingNames,
  onAdded,
}: {
  suggestions: string[];
  existingNames: Set<string>;
  onAdded: (name: string) => void;
}) {
  const toast = useToast();
  const [adding, setAdding] = useState<string | null>(null);
  const remaining = suggestions.filter((s) => !existingNames.has(s.toLowerCase()));
  if (remaining.length === 0) return null;

  async function quickAdd(name: string) {
    setAdding(name);
    try {
      await inventoryApi.createCategory(name);
      onAdded(name);
    } catch (err) {
      toast.error("Couldn't add", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setAdding(null);
    }
  }

  async function addAll() {
    for (const name of remaining) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await inventoryApi.createCategory(name);
      } catch {
        /* skip on conflict; quietly continue */
      }
    }
    onAdded("__bulk__");
    toast.success("Categories added", `${remaining.length} categor${remaining.length === 1 ? "y" : "ies"} from the starter set.`);
  }

  return (
    <div className="mb-5 rounded-xl border border-primary/20 bg-primary/[0.08]/40 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-primary" />
          <p className="text-[13px] font-medium text-white">Quick start for your vertical</p>
        </div>
        <button
          type="button"
          onClick={addAll}
          disabled={adding !== null}
          className="rounded-md border border-primary/30 bg-cinema-elev px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/[0.08] disabled:opacity-50"
        >
          Add all {remaining.length}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {remaining.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => quickAdd(s)}
            disabled={adding === s}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-cinema-elev px-3 py-1 text-[12px] text-white/65 transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {adding === s ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Inventory category manager. Pharmacy tenants typically organise their
 *  catalog into clinical groupings (Analgesics, Anti-Malaria, Antibiotics,
 *  Vitamins, etc.). Other verticals get their own suggestion sets — see
 *  lib/verticalCopy.ts → inventoryCategorySuggestions. */
export default function InventoryCategoriesPage() {
  const { data: me } = useApiQuery(meQuery);
  const { data, loading, error, refetch } = useApiQuery(inventoryApi.categories);
  const categories = data ?? [];

  const existingNames = new Set(categories.map((c) => c.name.trim().toLowerCase()));
  const suggestions = inventoryCategorySuggestions(verticalOf(me));

  return (
    <AppShell title="Categories" subtitle="Organise your inventory into the groups your customers search by.">
      <Link
        href="/inventory"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-white/65 hover:text-white"
      >
        <ArrowLeft size={14} /> Back to Inventory
      </Link>

      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={categories.length === 0}
        onRetry={refetch}
        loadingLabel="Loading categories…"
        gatedFeatureTitle="Inventory categories"
        empty={
          <>
            <SuggestionChips
              suggestions={suggestions}
              existingNames={existingNames}
              onAdded={refetch}
            />
            <EmptyState
              icon={Tag}
              title="No categories yet"
              description="Add categories so customers can browse your catalog by group — and your stock reports group by them too. Click any suggestion above, or add your own below."
            />
            <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
              <AddCategoryRow existingNames={existingNames} onAdded={refetch} />
            </div>
          </>
        }
      >
        <SuggestionChips
          suggestions={suggestions}
          existingNames={existingNames}
          onAdded={refetch}
        />

        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
          <div className="border-b border-white/[0.06] bg-white/[0.02] px-5 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.05em] text-white/45">
              {categories.length} categor{categories.length === 1 ? "y" : "ies"}
            </p>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {categories.map((cat) => (
              <CategoryRow
                key={cat.id}
                cat={cat}
                existingNames={existingNames}
                onChanged={refetch}
              />
            ))}
          </ul>
          <AddCategoryRow existingNames={existingNames} onAdded={refetch} />
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-white/45">
          <AlertCircle size={11} />
          Categories with products can't be deleted — move products to another category first.
        </p>
      </QueryBoundary>
    </AppShell>
  );
}
