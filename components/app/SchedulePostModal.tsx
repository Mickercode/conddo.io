"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { marketingApi, type MarketingPost } from "@/lib/api/marketing";
import { ApiError } from "@/lib/api/client";

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
];

/** Schedule a social post across one or more platforms (POST /marketing/posts). */
export function SchedulePostModal({
  open,
  onClose,
  defaultDate,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  defaultDate?: string; // YYYY-MM-DD
  onCreated?: (p: MarketingPost) => void;
}) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["instagram"]);
  const [scheduledAt, setScheduledAt] = useState(defaultDate ? `${defaultDate}T09:00` : "");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  function close() {
    if (saving) return;
    setTitle(""); setContent(""); setPlatforms(["instagram"]); setScheduledAt(defaultDate ? `${defaultDate}T09:00` : ""); setError(undefined);
    onClose();
  }

  function togglePlatform(p: string) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() && !content.trim()) { setError("Add a title or some content."); return; }
    if (platforms.length === 0) { setError("Pick at least one platform."); return; }
    setSaving(true);
    try {
      const { data } = await marketingApi.createPost({
        title: title.trim() || undefined,
        content: content.trim() || undefined,
        platforms,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      });
      toast.success("Post scheduled", title.trim() || "Draft saved");
      close();
      onCreated?.(data);
    } catch (err) {
      toast.error("Couldn't schedule post", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Schedule post"
      description="Compose once, publish to the channels you choose."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="schedule-post-form" disabled={saving}>
            {saving ? "Scheduling…" : "Schedule post"}
          </Button>
        </>
      }
    >
      <form id="schedule-post-form" onSubmit={submit} className="space-y-4">
        <Field label="Title" htmlFor="sp-title" error={error}>
          <TextInput id="sp-title" value={title} error={error} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New collection launch" autoFocus />
        </Field>
        <Field label="Content" htmlFor="sp-content">
          <TextArea id="sp-content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Caption / body…" />
        </Field>
        <Field label="Platforms">
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const on = platforms.includes(p.value);
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePlatform(p.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${on ? "border-primary bg-primary-bg font-medium text-primary" : "border-neutral-border text-content-secondary hover:bg-neutral-surface2"}`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Schedule for" htmlFor="sp-when" hint="Leave blank to save as a draft.">
          <TextInput id="sp-when" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}
