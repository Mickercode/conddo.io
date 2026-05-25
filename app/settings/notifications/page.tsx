"use client";

import { BellOff } from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { api } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";

type NotificationPref = {
  key: string;
  label: string;
  description: string;
  email: boolean;
  sms: boolean;
};

function Toggle({ on }: { on: boolean }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" defaultChecked={on} className="peer sr-only" />
      <div className="h-6 w-11 rounded-full bg-neutral-strong transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-5" />
    </label>
  );
}

export default function NotificationSettings() {
  const { data, loading, error, refetch } = useApiQuery<NotificationPref[]>(() => api.get("/settings/notifications"));
  const prefs = data ?? [];

  return (
    <SettingsShell active="notifications" title="Notifications" description="Choose how you want to be notified about activity in your business.">
      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={prefs.length === 0}
        onRetry={refetch}
        empty={
          <EmptyState
            icon={BellOff}
            title="No notification preferences yet"
            description="Your notification settings will appear here once your account is set up."
          />
        }
      >
        <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-neutral-border bg-neutral-surface2 px-6 py-3 text-[11px] uppercase tracking-[0.05em] text-content-secondary">
            <span>Notify me about</span>
            <span className="w-12 text-center">Email</span>
            <span className="w-12 text-center">SMS</span>
          </div>
          <ul className="divide-y divide-neutral-border">
            {prefs.map((p) => (
              <li key={p.key} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-4">
                <div>
                  <p className="text-[14px] font-medium text-ink">{p.label}</p>
                  <p className="text-[13px] text-content-muted">{p.description}</p>
                </div>
                <div className="flex w-12 justify-center"><Toggle on={p.email} /></div>
                <div className="flex w-12 justify-center"><Toggle on={p.sms} /></div>
              </li>
            ))}
          </ul>
        </div>
      </QueryBoundary>
    </SettingsShell>
  );
}
