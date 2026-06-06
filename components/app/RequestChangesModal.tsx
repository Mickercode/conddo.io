"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { websiteApi } from "@/lib/api/website";
import { ApiError } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { websiteChangeExample, verticalOf } from "@/lib/verticalCopy";

// Common areas — the backend accepts any string (area is optional + not
// validated against an enum), but offering a list keeps requests skim-able
// for whoever picks them up in Studio.
const AREAS = ["Homepage", "About", "Services", "Products", "Pricing", "Gallery", "Contact", "Other"];

/** Request a website edit (POST /website/change-requests). */
export function RequestChangesModal({
  open,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}) {
  const toast = useToast();
  const { data: me } = useApiQuery(meQuery);
  const detailsPlaceholder = websiteChangeExample(verticalOf(me));
  const [area, setArea] = useState("Homepage");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  function close() {
    if (saving) return;
    setArea("Homepage"); setDetails(""); setError(undefined);
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!details.trim()) { setError("Tell us what you'd like changed."); return; }
    setSaving(true);
    try {
      await websiteApi.requestChange({ area, details: details.trim() });
      toast.success("Change request sent", "Our team will pick this up shortly.");
      close();
      onSubmitted?.();
    } catch (err) {
      toast.error("Couldn't send your request", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Request website changes"
      description="Describe the edits you'd like — copy, images, layout, anything. Our team handles the rest."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="request-changes-form" disabled={saving}>
            {saving ? "Sending…" : "Send request"}
          </Button>
        </>
      }
    >
      <form id="request-changes-form" onSubmit={submit} className="space-y-4">
        <Field label="Section" htmlFor="rc-area" hint="Which part of your website?">
          <Select id="rc-area" value={area} onChange={(e) => setArea(e.target.value)}>
            {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
        </Field>
        <Field label="What would you like changed?" htmlFor="rc-details" required error={error}>
          <TextArea
            id="rc-details"
            value={details}
            error={error}
            onChange={(e) => setDetails(e.target.value)}
            rows={5}
            placeholder={detailsPlaceholder}
          />
        </Field>
      </form>
    </Modal>
  );
}
