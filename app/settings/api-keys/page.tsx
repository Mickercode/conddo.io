"use client";

import { KeyRound, Trash2 } from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
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
      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={keys.length === 0}
        onRetry={refetch}
        empty={
          <EmptyState
            icon={KeyRound}
            title="API keys coming soon"
            description="You'll be able to issue and revoke keys from here once the integrations module lands."
          />
        }
      >
        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] uppercase tracking-[0.05em] text-white/65">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Key</th>
                  <th className="px-6 py-3 font-medium">Created</th>
                  <th className="px-6 py-3 font-medium">Last used</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {keys.map((k) => (
                  <tr key={k.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5 text-[14px] text-white">{k.name}</td>
                    <td className="px-6 py-3.5 font-mono text-[13px] text-white/65">{k.prefix}••••••••</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-[13px] text-white/45">{k.createdAt}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-[13px] text-white/45">{k.lastUsed ?? "Never"}</td>
                    <td className="px-6 py-3.5 text-right">
                      <button aria-label="Revoke key" className="text-white/45 transition-colors hover:text-rose-200">
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
