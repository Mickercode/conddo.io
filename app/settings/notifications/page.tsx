"use client";

import { useEffect, useState } from "react";
import { BellOff, Save, Loader2 } from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import { Button } from "@/components/ui/Button";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { ApiError, api } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";
import { settingsApi } from "@/lib/api/settings";

type NotificationPref = {
  key: string;
  label: string;
  description: string;
  email: boolean;
  sms: boolean;
};

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <div className="h-6 w-11 rounded-full bg-neutral-strong transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-5" />
    </label>
  );
}

export default function NotificationSettings() {
  const toast = useToast();
  const { data, loading, error, refetch } = useApiQuery<NotificationPref[]>(
    () => api.get<NotificationPref[]>("/settings/notifications"),
  );
  const [prefs, setPrefs] = useState<NotificationPref[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (Array.isArray(data)) setPrefs(data);
  }, [data]);

  function setPref(key: string, channel: "email" | "sms", value: boolean) {
    setPrefs((prev) => prev.map((p) => (p.key === key ? { ...p, [channel]: value } : p)));
  }

  async function save() {
    setSaving(true);
    try {
      const body = Object.fromEntries(prefs.map((p) => [p.key, { email: p.email, sms: p.sms }]));
      await settingsApi.updateNotifications(body);
      toast.success("Notification preferences saved");
    } catch (err) {
      toast.error("Couldn't save preferences", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

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
        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-white/[0.06] bg-white/[0.02] px-6 py-3 text-[11px] uppercase tracking-[0.05em] text-white/65">
            <span>Notify me about</span>
            <span className="w-12 text-center">Email</span>
            <span className="w-12 text-center">SMS</span>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {prefs.map((p) => (
              <li key={p.key} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-4">
                <div>
                  <p className="text-[14px] font-medium text-white">{p.label}</p>
                  <p className="text-[13px] text-white/45">{p.description}</p>
                </div>
                <div className="flex w-12 justify-center"><Toggle on={p.email} onChange={(v) => setPref(p.key, "email", v)} /></div>
                <div className="flex w-12 justify-center"><Toggle on={p.sms} onChange={(v) => setPref(p.key, "sms", v)} /></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="primary" size="md" onClick={save} disabled={saving}>
            {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
            {saving ? "Saving…" : "Save preferences"}
          </Button>
        </div>
      </QueryBoundary>
    </SettingsShell>
  );
}
