"use client";

import { useEffect, useRef, useState } from "react";
import {
  MoreHorizontal, Loader2, AlertCircle, Pencil, ArrowLeft, ArrowRight, Trash2, X, PlusCircle,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { ordersApi, type Stage } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";

/**
 * Stage management — Add Stage button + per-column 3-dot menu. The Kanban
 * stages live behind GET /orders/stages (with id+position) and the existing
 * Board response (which is grouped by name). To map a board column to its
 * stage id, the parent fetches both and passes the lookup map down.
 *
 * Three actions on each column:
 *  - Rename → inline modal with the current name
 *  - Move left / Move right → swap positions with the neighbour
 *  - Delete → confirm modal (server returns 422 if the stage still has orders)
 *
 * "Delivered" is treated as a terminal stage by the backend and can't be
 * deleted from the FE; we hide the delete option for it.
 */

// ---------------------------------------------------------------------------
// 1. Add Stage modal
// ---------------------------------------------------------------------------

export function AddStageButton({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 px-5 text-white/45 transition-colors hover:border-primary hover:text-primary"
      >
        <PlusCircle size={18} />
        <span className="text-[13px] font-medium">Add Stage</span>
      </button>
      {open && (
        <AddStageModal
          onClose={() => setOpen(false)}
          onCreated={() => { setOpen(false); onAdded(); }}
        />
      )}
    </>
  );
}

function AddStageModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await ordersApi.createStage({ name: trimmed });
      toast.success("Stage added", trimmed);
      onCreated();
    } catch (err) {
      toast.error("Couldn't add stage", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={() => !saving && onClose()}
      title="New stage"
      description="Stages appear as columns on the board, in order. New stages slot in at the end — drag to reorder later."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="add-stage-form" disabled={saving || !name.trim()}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? "Adding…" : "Add stage"}
          </Button>
        </>
      }
    >
      <form id="add-stage-form" onSubmit={submit} className="space-y-3">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-white/65">
            Stage name
          </label>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Quality Check"
            autoFocus
          />
          <p className="mt-1.5 text-[12px] text-white/45">
            Short and concrete — what's happening at this step?
          </p>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// 2. Per-column actions menu (3 dots)
// ---------------------------------------------------------------------------

export function StageActionsMenu({
  stage, allStages, hasOrders, onChanged,
}: {
  stage: Stage;
  allStages: Stage[];
  hasOrders: boolean;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // If the stage is unmaterialised (id === null), the FE can still trigger
  // a rename/move/delete — backend materialises the vertical defaults on the
  // first write. Until that happens we don't have an id; createStage isn't
  // applicable here, but updateStage / deleteStage need an id. So the menu
  // surfaces a "Customise stages" hint instead of broken actions for null-id.
  const canMutate = stage.id !== null;

  // Sort + locate this stage's position to decide if Move-left / Move-right
  // are enabled.
  const sorted = [...allStages].sort((a, b) => a.position - b.position);
  const idx = sorted.findIndex((s) => s.name === stage.name);
  const canMoveLeft = canMutate && idx > 0;
  const canMoveRight = canMutate && idx >= 0 && idx < sorted.length - 1;

  // "Delivered" is the terminal stage; allow rename but not delete.
  const isTerminal = stage.name.toLowerCase() === "delivered";

  // Close on outside click / escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-label={`${stage.name} actions`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white/45 transition-colors hover:bg-cinema-elev hover:text-white"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-white/[0.06] bg-cinema-elev text-[13px] shadow-lg"
        >
          {!canMutate ? (
            <p className="px-3 py-2.5 text-[12px] text-white/45">
              Customise this stage in any column to start managing them — the platform default stages materialise on first edit.
            </p>
          ) : (
            <>
              <MenuItem icon={Pencil} onClick={() => { setOpen(false); setRenaming(true); }}>
                Rename
              </MenuItem>
              <MenuItem
                icon={ArrowLeft}
                disabled={!canMoveLeft}
                onClick={async () => {
                  setOpen(false);
                  if (!canMoveLeft) return;
                  await moveStage(stage, sorted[idx - 1].position, onChanged);
                }}
              >
                Move left
              </MenuItem>
              <MenuItem
                icon={ArrowRight}
                disabled={!canMoveRight}
                onClick={async () => {
                  setOpen(false);
                  if (!canMoveRight) return;
                  await moveStage(stage, sorted[idx + 1].position, onChanged);
                }}
              >
                Move right
              </MenuItem>
              {!isTerminal && (
                <>
                  <div className="border-t border-white/[0.06]" />
                  <MenuItem
                    icon={Trash2}
                    tone="danger"
                    onClick={() => { setOpen(false); setConfirmDelete(true); }}
                  >
                    Delete
                  </MenuItem>
                </>
              )}
            </>
          )}
        </div>
      )}

      {renaming && stage.id && (
        <RenameStageModal stage={stage} onClose={() => setRenaming(false)} onSaved={() => { setRenaming(false); onChanged(); }} />
      )}
      {confirmDelete && stage.id && (
        <ConfirmDeleteStageModal
          stage={stage}
          hasOrders={hasOrders}
          onClose={() => setConfirmDelete(false)}
          onDeleted={() => { setConfirmDelete(false); onChanged(); }}
        />
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon, children, onClick, disabled, tone,
}: {
  icon: typeof Pencil;
  children: React.ReactNode;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  tone?: "danger";
}) {
  const danger = tone === "danger";
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        danger ? "text-rose-200 hover:bg-rose-500/[0.06]" : "text-white/65 hover:bg-white/[0.02] hover:text-white"
      }`}
    >
      <Icon size={14} />
      {children}
    </button>
  );
}

async function moveStage(stage: Stage, neighbourPos: number, onChanged: () => void) {
  if (!stage.id) return;
  try {
    await ordersApi.updateStage(stage.id, { position: neighbourPos });
    onChanged();
  } catch {
    // Failures fall through silently — the next refetch will reflect the truth.
  }
}

// ---------------------------------------------------------------------------
// 3. Rename + confirm-delete modals
// ---------------------------------------------------------------------------

function RenameStageModal({
  stage, onClose, onSaved,
}: {
  stage: Stage;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState(stage.name);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === stage.name || !stage.id) return;
    setSaving(true);
    try {
      await ordersApi.updateStage(stage.id, { name: trimmed });
      toast.success("Stage renamed", `${stage.name} → ${trimmed}`);
      onSaved();
    } catch (err) {
      toast.error("Couldn't rename", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={() => !saving && onClose()}
      title={`Rename "${stage.name}"`}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="rename-stage-form"
            disabled={saving || !name.trim() || name.trim() === stage.name}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="rename-stage-form" onSubmit={submit}>
        <label className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-white/65">
          Stage name
        </label>
        <TextInput value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </form>
    </Modal>
  );
}

function ConfirmDeleteStageModal({
  stage, hasOrders, onClose, onDeleted,
}: {
  stage: Stage;
  hasOrders: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doDelete() {
    if (!stage.id) return;
    setDeleting(true);
    setError(null);
    try {
      await ordersApi.deleteStage(stage.id);
      toast.success("Stage deleted", stage.name);
      onDeleted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete this stage.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      open
      onClose={() => !deleting && onClose()}
      title={`Delete "${stage.name}"?`}
      description={hasOrders
        ? "There are orders still in this stage. Move them first — the server will refuse to delete a stage that's still in use."
        : "This stage will be removed from the board. Orders that were here would need to be reassigned, but it's currently empty."}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={deleting}>Cancel</Button>
          <button
            type="button"
            onClick={doDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-danger px-4 py-2 text-[14px] font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-danger/20 bg-rose-500/[0.06] px-3 py-2 text-[13px] text-rose-200">
          <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}
      {hasOrders ? (
        <p className="text-[14px] text-white/65">
          Currently has open orders — drag them to another stage before deleting.
        </p>
      ) : null}
    </Modal>
  );
}
