"use client";

import { useState } from "react";
import {
  BellOff,
  CheckCheck,
  Check,
  Loader2,
  ShoppingCart,
  Wallet,
  CalendarDays,
  Users,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { notificationsApi, type Notification, type NotificationType } from "@/lib/api/notifications";
import { ApiError } from "@/lib/api/client";

const typeIcon: Record<NotificationType, LucideIcon> = {
  order: ShoppingCart,
  payment: Wallet,
  booking: CalendarDays,
  customer: Users,
  system: Bell,
};

const fmtTime = (n: { time?: string; createdAt?: string }) => {
  const t = n.time ?? n.createdAt;
  if (!t) return "";
  const d = new Date(t);
  return isNaN(d.getTime()) ? t : d.toLocaleString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function NotificationsPage() {
  const toast = useToast();
  const { data, loading, error, refetch } = useApiQuery(notificationsApi.list);
  const items = data?.items ?? [];
  const unread = data?.unread ?? 0;
  const hasUnread = unread > 0;

  // Optimistically clear individual rows so the UI feels instant — refetch
  // happens in the background to reconcile with BE truth.
  const [busyId, setBusyId] = useState<string | null>(null);
  const [optimisticRead, setOptimisticRead] = useState<Set<string>>(new Set());

  async function markAllRead() {
    try {
      await notificationsApi.markAllRead();
      toast.success(unread === 1 ? "1 notification marked as read" : `${unread} notifications marked as read`);
      setOptimisticRead(new Set());
      refetch();
    } catch (e) {
      toast.error("Couldn't mark all as read", e instanceof Error ? e.message : undefined);
    }
  }

  async function markOne(n: Notification) {
    if (n.read || optimisticRead.has(n.id)) return;
    setBusyId(n.id);
    // Optimistically flip the dot off before the round-trip lands.
    setOptimisticRead((prev) => new Set(prev).add(n.id));
    try {
      await notificationsApi.markRead(n.id);
      refetch();
    } catch (err) {
      // Rollback on failure so the dot returns.
      setOptimisticRead((prev) => {
        const next = new Set(prev);
        next.delete(n.id);
        return next;
      });
      toast.error("Couldn't mark as read", err instanceof ApiError ? err.message : undefined);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppShell
      title="Notifications"
      backHref="/dashboard"
      actions={
        items.length > 0 ? (
          <Button variant="secondary" size="md" onClick={markAllRead} disabled={!hasUnread}>
            <CheckCheck size={16} />
            <span className="hidden sm:inline">Mark all as read</span>
          </Button>
        ) : undefined
      }
    >
      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        onRetry={refetch}
        loadingLabel="Loading notifications…"
        empty={
          <EmptyState
            icon={BellOff}
            title="You're all caught up"
            description="New orders, payments, bookings, and alerts about your business will show up here."
          />
        }
      >
        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
          <ul className="divide-y divide-neutral-border">
            {items.map((n) => {
              const Icon = (n.type && typeIcon[n.type]) || Bell;
              const isUnread = !n.read && !optimisticRead.has(n.id);
              return (
                <li
                  key={n.id}
                  className={`group flex gap-3 px-5 py-4 transition-colors hover:bg-neutral-surface2 ${
                    isUnread ? "bg-primary-bg/30" : ""
                  }`}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-bg text-primary">
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[14px] font-medium text-ink">{n.title}</p>
                      <span className="shrink-0 text-[12px] text-content-muted">{fmtTime(n)}</span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-content-secondary">{n.body}</p>
                  </div>
                  {isUnread ? (
                    <button
                      type="button"
                      onClick={() => markOne(n)}
                      disabled={busyId === n.id}
                      aria-label="Mark as read"
                      title="Mark as read"
                      className="mt-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
                    >
                      {busyId === n.id ? (
                        <Loader2 size={11} className="animate-spin text-primary" />
                      ) : (
                        <span className="block h-2 w-2 rounded-full bg-primary transition-all group-hover:hidden" />
                      )}
                      <Check size={11} className="hidden text-current group-hover:block" />
                    </button>
                  ) : (
                    <span className="mt-2 inline-flex h-6 w-6 shrink-0" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </QueryBoundary>
    </AppShell>
  );
}
