"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Loader2, FileText, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { emrApi, DOC_TYPE_LABELS, type EmrDocumentType } from "@/lib/api/emr";
import { ApiError } from "@/lib/api/client";

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Upload a document to the patient's EMR. Lab results, prescriptions,
 *  referral letters, imaging — all stored privately per spec (signed-URL
 *  reads BE-side). */
export function UploadEmrDocumentModal({
  open,
  onClose,
  customerId,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  customerId: string;
  onUploaded?: () => void;
}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [docType, setDocType] = useState<EmrDocumentType>("LAB_RESULT");
  const [label, setLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDocType("LAB_RESULT");
    setLabel("");
    setFile(null);
  }, [open]);

  function pick() {
    fileRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      toast.error("File too large", "Cap is 20 MB per upload.");
      return;
    }
    setFile(f);
    if (!label.trim()) setLabel(f.name.replace(/\.[^.]+$/, ""));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Pick a file first");
      return;
    }
    setUploading(true);
    try {
      await emrApi.uploadDocument(customerId, file, docType, label.trim() || undefined);
      toast.success("Document uploaded", file.name);
      onUploaded?.();
      onClose();
    } catch (err) {
      toast.error(
        "Couldn't upload",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !uploading && onClose()}
      title="Upload document"
      description="Lab result, prescription, referral letter, imaging — anything you want on the patient's record."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={uploading}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="ud-form" disabled={uploading || !file}>
            {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : (<><Upload size={14} /> Upload</>)}
          </Button>
        </>
      }
    >
      <form id="ud-form" onSubmit={submit} className="space-y-4">
        <Field label="Document type" htmlFor="ud-type">
          <Select
            id="ud-type"
            value={docType}
            onChange={(e) => setDocType(e.target.value as EmrDocumentType)}
          >
            {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </Field>

        <Field label="Label" htmlFor="ud-label" hint="Optional — defaults to the filename.">
          <TextInput
            id="ud-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={
              docType === "LAB_RESULT"   ? "e.g. FBC + LFT — 8 Jun 2026"
              : docType === "PRESCRIPTION" ? "e.g. Dr Okafor Rx — chest infection"
              : docType === "IMAGING"      ? "e.g. Chest X-ray report"
              : "Describe this document"
            }
          />
        </Field>

        <Field label="File" htmlFor="ud-file" required>
          <div className="flex flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              id="ud-file"
              accept="image/*,application/pdf"
              onChange={onFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-neutral-border bg-neutral-surface2 px-3 py-2">
                <span className="flex min-w-0 items-center gap-2 text-[13px] text-ink">
                  <FileText size={14} className="shrink-0 text-content-muted" />
                  <span className="truncate">{file.name}</span>
                  <span className="text-content-muted">· {fmtSize(file.size)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  aria-label="Remove file"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-content-muted hover:bg-danger-bg hover:text-danger"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={pick}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-neutral-border bg-neutral-surface px-3 py-6 text-[13px] text-content-secondary hover:border-primary hover:bg-primary-bg hover:text-primary"
              >
                <Upload size={14} /> Choose a PDF or image
              </button>
            )}
          </div>
        </Field>
      </form>
    </Modal>
  );
}
