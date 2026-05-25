import { PauseCircle, Trash2 } from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";

const ACTIONS = [
  {
    icon: PauseCircle,
    title: "Deactivate business",
    description: "Temporarily take your website offline and pause your subscription. You can reactivate anytime.",
    cta: "Deactivate",
  },
  {
    icon: Trash2,
    title: "Delete business",
    description: "Permanently delete this business, its website, customers, orders, and all data. This cannot be undone.",
    cta: "Delete permanently",
  },
];

export default function DangerZoneSettings() {
  return (
    <SettingsShell active="danger" title="Danger Zone" description="Irreversible and destructive actions. Proceed with care.">
      <div className="space-y-4">
        {ACTIONS.map((a) => (
          <div
            key={a.title}
            className="flex flex-col gap-4 rounded-xl border border-danger/30 bg-neutral-surface p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger-bg text-danger">
                <a.icon size={20} />
              </span>
              <div>
                <h3 className="text-[15px] font-medium text-ink">{a.title}</h3>
                <p className="mt-1 max-w-md text-[14px] leading-relaxed text-content-secondary">{a.description}</p>
              </div>
            </div>
            <button className="shrink-0 rounded-md border border-danger bg-neutral-surface px-4 py-2.5 text-[14px] font-medium text-danger transition-colors hover:bg-danger hover:text-white">
              {a.cta}
            </button>
          </div>
        ))}
      </div>
    </SettingsShell>
  );
}
