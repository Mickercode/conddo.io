"use client";

import { useEffect, useState } from "react";
import { ClipboardList, AlertCircle, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextArea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { emrApi, NOTE_TYPE_LABELS, type EmrNoteType } from "@/lib/api/emr";
import { ApiError } from "@/lib/api/client";

/** Add an immutable clinical note to the patient's EMR. Per spec, notes
 *  cannot be edited or deleted — the modal hammers home the permanence. */
export function AddEmrNoteModal({
  open,
  onClose,
  customerId,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  customerId: string;
  onAdded?: () => void;
}) {
  const toast = useToast();
  const [noteType, setNoteType] = useState<EmrNoteType>("CLINICAL");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNoteType("CLINICAL");
    setNote("");
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) {
      toast.error("Note can't be empty");
      return;
    }
    if (!window.confirm("Save this note? It can't be edited or deleted later.")) return;
    setSaving(true);
    try {
      await emrApi.addNote(customerId, { note: note.trim(), noteType });
      toast.success("Note added to patient record");
      onAdded?.();
      onClose();
    } catch (err) {
      toast.error(
        "Couldn't save note",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title="Add clinical note"
      description="Clinical notes are permanent — they form the patient's medical history."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="en-form" disabled={saving}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : (<><ClipboardList size={14} /> Save note</>)}
          </Button>
        </>
      }
    >
      <form id="en-form" onSubmit={submit} className="space-y-4">
        <Field label="Type" htmlFor="en-type">
          <Select
            id="en-type"
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as EmrNoteType)}
          >
            {Object.entries(NOTE_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </Field>
        <Field label="Note" htmlFor="en-body" required>
          <TextArea
            id="en-body"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={6}
            placeholder={
              noteType === "ALLERGY"
                ? "e.g. Reported rash 30 min after first dose of amoxicillin — discontinued."
                : noteType === "REFERRAL"
                ? "e.g. Symptoms suggest pneumonia — referred to Dr. Adekunle, Igando Clinic."
                : noteType === "COUNSELLING"
                ? "e.g. Counselled patient on antibiotic adherence — complete the 7-day course even if feeling better."
                : "Document the clinical encounter, findings, advice given."
            }
          />
        </Field>
        <p className="flex items-start gap-1.5 rounded-md bg-warning-bg px-3 py-2 text-[11px] text-warning">
          <AlertCircle size={11} className="mt-0.5 shrink-0" />
          Once saved, this note cannot be edited or deleted. It will appear timestamped + with your name on the patient's record.
        </p>
      </form>
    </Modal>
  );
}
