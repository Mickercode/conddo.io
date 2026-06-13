"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity, ArrowLeft, Plus, Upload, ClipboardList, AlertCircle, Heart,
  ShieldAlert, Pill, Syringe, FileText, ExternalLink,
  Loader2, Save, Trash2, X,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Field, TextInput, Select, TextArea } from "@/components/ui/Field";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { BetaFeatureGate } from "@/components/app/BetaFeatureGate";
import { AddEmrNoteModal } from "@/components/app/AddEmrNoteModal";
import { UploadEmrDocumentModal } from "@/components/app/UploadEmrDocumentModal";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { verticalOf } from "@/lib/verticalCopy";
import { customersApi } from "@/lib/api/customers";
import {
  emrApi,
  NOTE_TYPE_LABELS,
  DOC_TYPE_LABELS,
  noteTone,
  type EmrAllergy,
  type EmrCondition,
  type EmrImmunization,
  type UpdateEmrInput,
} from "@/lib/api/emr";
import { ApiError } from "@/lib/api/client";

const BLOOD_GROUPS = ["", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const GENOTYPES = ["", "AA", "AS", "AC", "SS", "SC", "CC"];

function fmtWhen(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDate(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function EmrPage({ params }: { params: { customerId: string } }) {
  const { customerId } = params;
  const { data: me } = useApiQuery(meQuery);
  const isPharmacy = verticalOf(me) === "pharmacy";

  return (
    <AppShell title="Medical record" subtitle="Patient EMR">
      <Link
        href={`/customers/${customerId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-white/65 hover:text-white"
      >
        <ArrowLeft size={14} /> Back to patient
      </Link>

      {!isPharmacy ? (
        <EmptyState
          icon={Activity}
          title="EMR is a pharmacy feature"
          description="Electronic medical records are built for pharmacy patient care."
        />
      ) : (
        <BetaFeatureGate
          featureKey="emr_basic"
          featureName="Electronic Medical Records"
          description="Track demographics, allergies, chronic conditions, vaccinations, clinical notes, and lab documents per patient."
        >
          <EmrBody customerId={customerId} />
        </BetaFeatureGate>
      )}
    </AppShell>
  );
}

function EmrBody({ customerId }: { customerId: string }) {
  const toast = useToast();
  const customerQ = useApiQuery(() => customersApi.get(customerId), [customerId]);
  const emrQ = useApiQuery(() => emrApi.get(customerId), [customerId]);
  const docsQ = useApiQuery(() => emrApi.listDocuments(customerId), [customerId]);

  const [bloodGroup, setBloodGroup] = useState("");
  const [genotype, setGenotype] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [savingDemo, setSavingDemo] = useState(false);

  useEffect(() => {
    const d = emrQ.data;
    if (!d) return;
    setBloodGroup(d.bloodGroup ?? "");
    setGenotype(d.genotype ?? "");
    setHeightCm(d.heightCm != null ? String(d.heightCm) : "");
    setWeightKg(d.weightKg != null ? String(d.weightKg) : "");
  }, [emrQ.data]);

  const [noteOpen, setNoteOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  async function saveDemo() {
    const h = heightCm ? Number(heightCm) : null;
    const w = weightKg ? Number(weightKg) : null;
    if (h != null && (Number.isNaN(h) || h < 30 || h > 250)) {
      toast.error("Height looks off", "Enter a value in cm.");
      return;
    }
    if (w != null && (Number.isNaN(w) || w < 1 || w > 400)) {
      toast.error("Weight looks off", "Enter a value in kg.");
      return;
    }
    const body: UpdateEmrInput = {
      bloodGroup: (bloodGroup || null) as UpdateEmrInput["bloodGroup"],
      genotype: (genotype || null) as UpdateEmrInput["genotype"],
      heightCm: h,
      weightKg: w,
    };
    setSavingDemo(true);
    try {
      if (emrQ.data) {
        await emrApi.update(customerId, body);
      } else {
        await emrApi.create(customerId, body);
      }
      toast.success("Demographics saved");
      emrQ.refetch();
    } catch (err) {
      toast.error("Couldn't save", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSavingDemo(false);
    }
  }

  const customer = customerQ.data;
  const emr = emrQ.data;
  const notes = emr?.notes ?? [];
  const docs = docsQ.data ?? [];

  return (
    <>
      {/* Patient identity strip */}
      <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/[0.06] bg-cinema-elev p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/[0.08] font-mono text-[15px] font-semibold text-primary">
            {(customer?.name ?? "?").trim().split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "?"}
          </span>
          <div>
            <p className="text-[16px] font-medium text-white">{customer?.name ?? "Loading…"}</p>
            <p className="text-[13px] text-white/45">{customer?.phone ?? "—"} · {customer?.email ?? "—"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={() => setUploadOpen(true)}>
            <Upload size={14} /> Upload document
          </Button>
          <Button variant="primary" size="md" onClick={() => setNoteOpen(true)}>
            <Plus size={14} /> Add note
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(0,340px)]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Demographics */}
          <div className="rounded-2xl border border-white/[0.06] bg-cinema-elev p-5">
            <div className="mb-4 flex items-center gap-2">
              <Heart size={16} className="text-primary" />
              <h2 className="text-[15px] font-medium text-white">Demographics & vitals</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Blood group" htmlFor="d-blood">
                <Select id="d-blood" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>{g || "Unknown"}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Genotype" htmlFor="d-geno">
                <Select id="d-geno" value={genotype} onChange={(e) => setGenotype(e.target.value)}>
                  {GENOTYPES.map((g) => (
                    <option key={g} value={g}>{g || "Unknown"}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Height (cm)" htmlFor="d-h">
                <TextInput
                  id="d-h"
                  inputMode="numeric"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="170"
                />
              </Field>
              <Field label="Weight (kg)" htmlFor="d-w">
                <TextInput
                  id="d-w"
                  inputMode="numeric"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="70"
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="primary" size="md" onClick={saveDemo} disabled={savingDemo}>
                {savingDemo ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : (<><Save size={14} /> Save</>)}
              </Button>
            </div>
          </div>

          {/* Allergies */}
          <ListSection
            title="Allergies"
            icon={ShieldAlert}
            tone="danger"
            items={emr?.allergies ?? []}
            keyOf={(a) => a.substance}
            render={(a: EmrAllergy) => (
              <>
                <span className="font-medium text-white">{a.substance}</span>
                {a.severity && <Chip tone="danger">{a.severity}</Chip>}
                {a.reaction && <span className="text-[12px] text-white/45">— {a.reaction}</span>}
              </>
            )}
            onChange={async (next) => {
              try {
                await emrApi.update(customerId, { allergies: next as EmrAllergy[] });
                emrQ.refetch();
              } catch (err) {
                toast.error("Couldn't save", err instanceof ApiError ? err.message : "Please try again.");
              }
            }}
            newItem={() => ({ substance: "", severity: "Mild" } as EmrAllergy)}
            editor={(item, set) => (
              <AllergyEditor item={item as EmrAllergy} set={set as (n: EmrAllergy) => void} />
            )}
            emptyTitle="No known allergies"
            emptyDesc="Add any drug or food allergies the patient reports."
          />

          {/* Chronic conditions */}
          <ListSection
            title="Chronic conditions"
            icon={Pill}
            tone="warning"
            items={emr?.chronicConditions ?? []}
            keyOf={(c) => c.name}
            render={(c: EmrCondition) => (
              <>
                <span className="font-medium text-white">{c.name}</span>
                {c.status && <Chip tone={c.status === "Resolved" ? "success" : "neutral"}>{c.status}</Chip>}
                {c.diagnosedAt && <span className="text-[12px] text-white/45">since {fmtDate(c.diagnosedAt)}</span>}
              </>
            )}
            onChange={async (next) => {
              try {
                await emrApi.update(customerId, { chronicConditions: next as EmrCondition[] });
                emrQ.refetch();
              } catch (err) {
                toast.error("Couldn't save", err instanceof ApiError ? err.message : "Please try again.");
              }
            }}
            newItem={() => ({ name: "", status: "Active" } as EmrCondition)}
            editor={(item, set) => (
              <ConditionEditor item={item as EmrCondition} set={set as (n: EmrCondition) => void} />
            )}
            emptyTitle="No chronic conditions"
            emptyDesc="Add diabetes, hypertension, asthma, anything ongoing."
          />

          {/* Immunizations */}
          <ListSection
            title="Vaccinations"
            icon={Syringe}
            tone="primary"
            items={emr?.immunizations ?? []}
            keyOf={(i) => `${i.vaccine}-${i.administeredAt}`}
            render={(i: EmrImmunization) => (
              <>
                <span className="font-medium text-white">{i.vaccine}</span>
                {typeof i.doseNumber === "number" && <Chip tone="primary">Dose {i.doseNumber}</Chip>}
                <span className="text-[12px] text-white/45">{fmtDate(i.administeredAt)}</span>
              </>
            )}
            onChange={async (next) => {
              try {
                await emrApi.update(customerId, { immunizations: next as EmrImmunization[] });
                emrQ.refetch();
              } catch (err) {
                toast.error("Couldn't save", err instanceof ApiError ? err.message : "Please try again.");
              }
            }}
            newItem={() => ({ vaccine: "", administeredAt: new Date().toISOString().slice(0, 10) } as EmrImmunization)}
            editor={(item, set) => (
              <ImmunizationEditor item={item as EmrImmunization} set={set as (n: EmrImmunization) => void} />
            )}
            emptyTitle="No vaccinations on file"
            emptyDesc="Add COVID, hepatitis, yellow fever, anything you've administered."
          />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Documents */}
          <div className="rounded-2xl border border-white/[0.06] bg-cinema-elev p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <h3 className="text-[15px] font-medium text-white">Documents</h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="inline-flex items-center gap-1 rounded-md text-[12px] font-medium text-primary hover:underline"
              >
                <Plus size={12} /> Upload
              </button>
            </div>
            {docs.length === 0 ? (
              <p className="text-[12px] text-white/45">No documents yet.</p>
            ) : (
              <ul className="space-y-2">
                {docs.map((d) => (
                  <li key={d.id} className="rounded-md bg-white/[0.02] px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-medium text-white">
                        {d.label ?? DOC_TYPE_LABELS[d.docType]}
                      </p>
                      <a
                        href={d.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Open document"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white/45 hover:bg-primary/[0.08] hover:text-primary"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <p className="mt-0.5 text-[11px] text-white/45">
                      {DOC_TYPE_LABELS[d.docType]} · {fmtWhen(d.uploadedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Clinical notes timeline */}
          <div className="rounded-2xl border border-white/[0.06] bg-cinema-elev p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-primary" />
                <h3 className="text-[15px] font-medium text-white">Clinical notes</h3>
              </div>
              <button
                type="button"
                onClick={() => setNoteOpen(true)}
                className="inline-flex items-center gap-1 rounded-md text-[12px] font-medium text-primary hover:underline"
              >
                <Plus size={12} /> Add note
              </button>
            </div>

            <QueryBoundary
              loading={emrQ.loading}
              error={emrQ.error}
              isEmpty={notes.length === 0}
              onRetry={emrQ.refetch}
              loadingLabel="Loading…"
              empty={
                <p className="text-[12px] text-white/45">No clinical notes yet.</p>
              }
            >
              <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-neutral-border">
                {notes.map((n, i) => (
                  <li key={n.id} className="relative flex gap-3">
                    <span className={`z-10 mt-1 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border bg-cinema-elev ${i === 0 ? "border-primary" : "border-white/[0.06]"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-primary" : "bg-neutral-strong"}`} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                        <Chip tone={noteTone(n.noteType)}>{NOTE_TYPE_LABELS[n.noteType]}</Chip>
                        <span className="font-mono text-[10px] text-white/45">{fmtWhen(n.createdAt)}</span>
                      </div>
                      <p className="whitespace-pre-line text-[13px] text-white/65">{n.note}</p>
                      {n.createdBy?.name && (
                        <p className="mt-0.5 text-[10px] text-white/45">By {n.createdBy.name}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </QueryBoundary>
          </div>
        </div>
      </div>

      <p className="mt-6 flex items-center gap-1.5 text-[11px] text-white/45">
        <AlertCircle size={11} />
        Clinical notes are immutable. Documents are stored privately — pre-signed URLs only.
      </p>

      <AddEmrNoteModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        customerId={customerId}
        onAdded={emrQ.refetch}
      />
      <UploadEmrDocumentModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        customerId={customerId}
        onUploaded={docsQ.refetch}
      />
    </>
  );
}

/** Generic inline-editable card for the allergies / conditions / vaccinations
 *  sections. Owns its add-row state; on save, returns the next list to the
 *  parent which PUTs it. */
function ListSection<T>({
  title,
  icon: Icon,
  tone,
  items,
  keyOf,
  render,
  onChange,
  newItem,
  editor,
  emptyTitle,
  emptyDesc,
}: {
  title: string;
  icon: React.ElementType;
  tone: "danger" | "warning" | "primary";
  items: T[];
  keyOf: (item: T) => string;
  render: (item: T) => React.ReactNode;
  onChange: (next: T[]) => Promise<void>;
  newItem: () => T;
  editor: (item: T, set: (next: T) => void) => React.ReactNode;
  emptyTitle: string;
  emptyDesc: string;
}) {
  const [adding, setAdding] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);

  async function commit() {
    if (!adding) return;
    setSaving(true);
    try {
      await onChange([...(items ?? []), adding]);
      setAdding(null);
    } finally {
      setSaving(false);
    }
  }

  async function remove(index: number) {
    if (!window.confirm(`Remove this entry from ${title.toLowerCase()}?`)) return;
    const next = items.filter((_, i) => i !== index);
    await onChange(next);
  }

  const toneClass: Record<typeof tone, string> = {
    danger: "text-rose-200",
    warning: "text-amber-300",
    primary: "text-primary",
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-cinema-elev p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={16} className={toneClass[tone]} />
          <h2 className="text-[15px] font-medium text-white">{title}</h2>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(newItem())}
            className="inline-flex items-center gap-1 rounded-md text-[12px] font-medium text-primary hover:underline"
          >
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {items.length === 0 && !adding && (
        <div className="rounded-md bg-white/[0.02] px-4 py-6 text-center">
          <p className="text-[13px] font-medium text-white">{emptyTitle}</p>
          <p className="mt-0.5 text-[12px] text-white/45">{emptyDesc}</p>
        </div>
      )}

      <ul className="space-y-2">
        {items.map((it, idx) => (
          <li
            key={keyOf(it)}
            className="group flex items-center justify-between gap-3 rounded-md bg-white/[0.02] px-3 py-2"
          >
            <span className="flex min-w-0 flex-wrap items-center gap-2 text-[13px]">{render(it)}</span>
            <button
              type="button"
              onClick={() => remove(idx)}
              aria-label="Remove"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/45 opacity-0 transition-opacity hover:bg-rose-500/[0.06] hover:text-rose-200 group-hover:opacity-100"
            >
              <Trash2 size={12} />
            </button>
          </li>
        ))}
      </ul>

      {adding && (
        <div className="mt-3 rounded-md border border-primary/20 bg-primary/[0.08]/30 p-3">
          {editor(adding, setAdding)}
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setAdding(null)} disabled={saving}>
              <X size={13} /> Cancel
            </Button>
            <Button variant="primary" size="md" onClick={commit} disabled={saving}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : (<><Plus size={13} /> Add</>)}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AllergyEditor({ item, set }: { item: EmrAllergy; set: (next: EmrAllergy) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Field label="Substance" htmlFor="al-sub">
        <TextInput id="al-sub" value={item.substance} onChange={(e) => set({ ...item, substance: e.target.value })} placeholder="e.g. Penicillin" />
      </Field>
      <Field label="Severity" htmlFor="al-sev">
        <Select id="al-sev" value={item.severity ?? "Mild"} onChange={(e) => set({ ...item, severity: e.target.value })}>
          {["Mild", "Moderate", "Severe", "Life-threatening"].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </Field>
      <Field label="Reaction" htmlFor="al-rxn">
        <TextInput id="al-rxn" value={item.reaction ?? ""} onChange={(e) => set({ ...item, reaction: e.target.value })} placeholder="e.g. Hives" />
      </Field>
    </div>
  );
}

function ConditionEditor({ item, set }: { item: EmrCondition; set: (next: EmrCondition) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Field label="Condition" htmlFor="cn-n">
        <TextInput id="cn-n" value={item.name} onChange={(e) => set({ ...item, name: e.target.value })} placeholder="e.g. Type 2 diabetes" />
      </Field>
      <Field label="Diagnosed" htmlFor="cn-d">
        <TextInput id="cn-d" type="date" value={item.diagnosedAt ?? ""} onChange={(e) => set({ ...item, diagnosedAt: e.target.value })} />
      </Field>
      <Field label="Status" htmlFor="cn-s">
        <Select id="cn-s" value={item.status ?? "Active"} onChange={(e) => set({ ...item, status: e.target.value })}>
          {["Active", "Resolved", "In remission"].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </Field>
      <div className="sm:col-span-3">
        <Field label="Notes" htmlFor="cn-no">
          <TextArea id="cn-no" value={item.notes ?? ""} onChange={(e) => set({ ...item, notes: e.target.value })} rows={2} />
        </Field>
      </div>
    </div>
  );
}

function ImmunizationEditor({ item, set }: { item: EmrImmunization; set: (next: EmrImmunization) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Field label="Vaccine" htmlFor="im-v">
        <TextInput id="im-v" value={item.vaccine} onChange={(e) => set({ ...item, vaccine: e.target.value })} placeholder="e.g. COVID-19" />
      </Field>
      <Field label="Date" htmlFor="im-d">
        <TextInput id="im-d" type="date" value={item.administeredAt} onChange={(e) => set({ ...item, administeredAt: e.target.value })} />
      </Field>
      <Field label="Dose #" htmlFor="im-do">
        <TextInput
          id="im-do"
          inputMode="numeric"
          value={item.doseNumber != null ? String(item.doseNumber) : ""}
          onChange={(e) => set({ ...item, doseNumber: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="1"
        />
      </Field>
    </div>
  );
}
