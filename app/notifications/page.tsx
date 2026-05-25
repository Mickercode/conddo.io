"use client";

import {
  BellOff,
  CheckCheck,
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
import { useApiQuery } from "@/hooks/useApiQuery";
import { notificationsApi, type NotificationType } from "@/lib/api/notifications";

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
  const { data, loading, error, refetch } = useApiQuery(notificationsApi.list);
  const items = data?.items ?? [];
  const hasUnread = (data?.unread ?? 0) > 0;

  async function markAllRead() {
    try {
      await notificationsApi.markAllRead();
      refetch();
    } catch {
      /* best effort */
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
              return (
                <li
                  key={n.id}
                  className={`flex gap-3 px-5 py-4 transition-colors hover:bg-neutral-surface2 ${
                    n.read ? "" : "bg-primary-bg/30"
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
                  {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </li>
              );
            })}
          </ul>
        </div>
      </QueryBoundary>
    </AppShell>
  );
}
