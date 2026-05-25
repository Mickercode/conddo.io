"use client";

import { useState } from "react";
import { PauseCircle, Trash2 } from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";
import { settingsApi } from "@/lib/api/settings";

export default function DangerZoneSettings() {
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [working, setWorking] = useState(false);

  async function deactivate() {
    setWorking(true);
    try {
      await settingsApi.deactivate();
      toast.success("Business deactivated", "Your website is now offline. Reactivate anytime.");
      setConfirmOpen(false);
    } catch (err) {
      toast.error("Couldn't deactivate", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <SettingsShell active="danger" title="Danger Zone" description="Irreversible and destructive actions. Proceed with care.">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 rounded-xl border border-danger/30 bg-neutral-surface p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger-bg text-danger">
              <PauseCircle size={20} />
            </span>
            <div>
              <h3 className="text-[15px] font-medium text-ink">Deactivate business</h3>
              <p className="mt-1 max-w-md text-[14px] leading-relaxed text-content-secondary">
                Temporarily take your website offline and pause your subscription. You can reactivate anytime.
              </p>
            </div>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="shrink-0 rounded-md border border-danger bg-neutral-surface px-4 py-2.5 text-[14px] font-medium text-danger transition-colors hover:bg-danger hover:text-white"
          >
            Deactivate
          </button>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-danger/30 bg-neutral-surface p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger-bg text-danger">
              <Trash2 size={20} />
            </span>
            <div>
              <h3 className="text-[15px] font-medium text-ink">Delete business</h3>
              <p className="mt-1 max-w-md text-[14px] leading-relaxed text-content-secondary">
                Permanently delete this business, its website, customers, orders, and all data. This cannot be undone.
              </p>
            </div>
          </div>
          <button
            disabled
            title="Permanent deletion is coming soon — deactivate instead, or contact support."
            className="shrink-0 cursor-not-allowed rounded-md border border-neutral-border bg-neutral-surface px-4 py-2.5 text-[14px] font-medium text-content-muted"
          >
            Delete permanently
          </button>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => !working && setConfirmOpen(false)}
        title="Deactivate business?"
        description="Your public website goes offline and your subscription pauses. You can reactivate anytime."
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => !working && setConfirmOpen(false)} disabled={working}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={deactivate} disabled={working}>
              {working ? "Deactivating…" : "Yes, deactivate"}
            </Button>
          </>
        }
      >
        <p className="text-[14px] text-content-secondary">
          This is reversible — nothing is deleted. Customers visiting your site will see it as temporarily unavailable.
        </p>
      </Modal>
    </SettingsShell>
  );
}
