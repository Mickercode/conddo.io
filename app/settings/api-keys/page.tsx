"use client";

import { KeyRound, Plus, Trash2 } from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import { Button } from "@/components/ui/Button";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { api } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";

type ApiKey = { id: string; name: string; prefix: string; createdAt: string; lastUsed: string | null };

export default function ApiKeysSettings() {
  const { data, loading, error, refetch } = useApiQuery<ApiKey[]>(() => api.get("/settings/api-keys"));
  const keys = data ?? [];

  return (
    <SettingsShell active="api-keys" title="API Keys" description="Create keys to integrate Conddo with your other tools. Keep them secret.">
      <div className="mb-5 flex justify-end">
        <Button variant="primary" size="md">
          <Plus size={17} /> Create key
        </Button>
      </div>

      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={keys.length === 0}
        onRetry={refetch}
        empty={
          <EmptyState
            icon={KeyRound}
            title="No API keys yet"
            description="Create an API key to connect Conddo to external systems. You'll see the full key once at creation."
            action={
              <Button variant="primary" size="md">
                <Plus size={17} /> Create your first key
              </Button>
            }
          />
        }
      >
        <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-neutral-border bg-neutral-surface2 text-[11px] uppercase tracking-[0.05em] text-content-secondary">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Key</th>
                  <th className="px-6 py-3 font-medium">Created</th>
                  <th className="px-6 py-3 font-medium">Last used</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {keys.map((k) => (
                  <tr key={k.id} className="transition-colors hover:bg-neutral-surface2">
                    <td className="px-6 py-3.5 text-[14px] text-ink">{k.name}</td>
                    <td className="px-6 py-3.5 font-mono text-[13px] text-content-secondary">{k.prefix}••••••••</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-[13px] text-content-muted">{k.createdAt}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-[13px] text-content-muted">{k.lastUsed ?? "Never"}</td>
                    <td className="px-6 py-3.5 text-right">
                      <button aria-label="Revoke key" className="text-content-muted transition-colors hover:text-danger">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </QueryBoundary>
    </SettingsShell>
  );
}
