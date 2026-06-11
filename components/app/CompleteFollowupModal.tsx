"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextArea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import {
  followupsApi,
  FOLLOWUP_OUTCOME_LABELS,
  type CompleteFollowupInput,
  type Followup,
  type FollowupOutcomeType,
} from "@/lib/api/followups";
import { ApiError } from "@/lib/api/client";

/** Record the outcome of a completed follow-up. Per spec, this is permanent —
 *  the outcome is appended to the patient's health profile as an immutable
 *  clinical note. */
export function CompleteFollowupModal({
  open,
  onClose,
  followup,
  onCompleted,
}: {
  open: boolean;
  onClose: () => void;
  followup: Followup | null;
  onCompleted?: () => void;
}) {
  const toast = useToast();
  const [outcomeType, setOutcomeType] = useState<FollowupOutcomeType>("RECOVERED");
  const [outcome, setOutcome] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setOutcomeType("RECOVERED");
    setOutcome("");
  }, [open]);

  if (!followup) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!outcome.trim()) {
      toast.error("Add a brief note", "Describe what happened on the follow-up.");
      return;
    }
    const body: CompleteFollowupInput = { outcome: outcome.trim(), outcomeType };
    setSaving(true);
    try {
      await followupsApi.complete(followup!.id, body);
      toast.success("Follow-up logged", "Outcome saved to the patient's record.");
      onCompleted?.();
      onClose();
    } catch (err) {
      toast.error(
        "Couldn't log outcome",
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
      title="Log follow-up outcome"
      description={`Patient: ${followup.customer.name ?? "—"}. What happened?`}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="cfu-form" disabled={saving}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : (<><Check size={14} /> Save outcome</>)}
          </Button>
        </>
      }
    >
      <form id="cfu-form" onSubmit={submit} className="space-y-4">
        <Field label="Outcome type" htmlFor="cfu-type">
          <Select
            id="cfu-type"
            value={outcomeType}
            onChange={(e) => setOutcomeType(e.target.value as FollowupOutcomeType)}
          >
            {Object.entries(FOLLOWUP_OUTCOME_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </Field>

        <Field label="Notes" htmlFor="cfu-note" required hint="Permanent — appended to the patient's clinical record.">
          <TextArea
            id="cfu-note"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            rows={4}
            placeholder={
              outcomeType === "RECOVERED" ? "e.g. Patient confirmed full recovery, no side effects."
              : outcomeType === "REFERRED" ? "e.g. Symptoms persisting — referred to Dr. Adekunle at Igando Clinic."
              : outcomeType === "SIDE_EFFECT" ? "e.g. Mild nausea reported — switched to amoxicillin clavulanate."
              : outcomeType === "NO_RESPONSE" ? "e.g. Called twice, no answer. Will try again next week."
              : "What was the outcome?"
            }
          />
        </Field>
      </form>
    </Modal>
  );
}
