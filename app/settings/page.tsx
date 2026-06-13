"use client";

import { useState } from "react";
import { Lock, Save, Loader2 } from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ApiError, isNotConfigured } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";
import { settingsApi } from "@/lib/api/settings";
import { mediaApi } from "@/lib/api/media";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const anyFilled = (...vals: string[]) => vals.some((v) => v.length > 0);

const inputCls =
  "w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary";
const labelCls = "mb-1.5 block text-[11px] uppercase tracking-[0.05em] text-white/45";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/[0.06] bg-cinema-elev p-6">
      <h3 className="mb-5 text-[16px] font-medium text-white">{title}</h3>
      {children}
    </section>
  );
}

export default function BusinessProfileSettings() {
  const toast = useToast();
  const { data, loading, error } = useApiQuery(settingsApi.businessProfile);
  const { data: location } = useApiQuery(settingsApi.location);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  async function onLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
      toast.error("Unsupported file", "Use a PNG, JPG, or SVG.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large", "Keep it under 2MB.");
      return;
    }
    setUploadingLogo(true);
    try {
      const { data: media } = await mediaApi.upload(file, "logo");
      setLogoUrl(media.url);
      toast.success("Logo uploaded", "Save to apply it to your branding.");
    } catch (err) {
      toast.error("Upload failed", err instanceof ApiError ? err.message : "Image uploads aren't available yet.");
    } finally {
      setUploadingLogo(false);
    }
  }

  const p = data; // null when not loaded / no backend
  const hours = WEEKDAYS.map((day) => ({ day, on: false, open: undefined as string | undefined, close: undefined as string | undefined }));
  const hadError = error && !isNotConfigured(error);

  // Saves fan out to the right endpoints (profile / branding / social / location).
  // Branding & social have no GET, so to avoid blanking we only PUT them when filled.
  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    setSaved(false);

    const jobs: Promise<unknown>[] = [
      settingsApi.updateBusinessProfile({
        name: str(form, "name"),
        tagline: str(form, "tagline"),
        description: str(form, "description"),
        email: str(form, "email"),
        phone: str(form, "phone"),
      }),
    ];

    const primaryColor = str(form, "primaryColor");
    const logoUrl = str(form, "logoUrl");
    if (anyFilled(primaryColor, logoUrl)) {
      jobs.push(settingsApi.updateBranding({ primaryColor: primaryColor || undefined, logoUrl: logoUrl || undefined }));
    }

    const instagram = str(form, "instagram"), twitter = str(form, "twitter"),
      facebook = str(form, "facebook"), linkedin = str(form, "linkedin");
    if (anyFilled(instagram, twitter, facebook, linkedin)) {
      jobs.push(settingsApi.updateSocialHandles({ instagram, twitter, facebook, linkedin }));
    }

    const street = str(form, "street"), city = str(form, "city"), state = str(form, "state");
    if (anyFilled(street, city, state)) {
      jobs.push(settingsApi.updateLocation({ street, city, state }));
    }

    const results = await Promise.allSettled(jobs);
    setSaving(false);
    const failed = results.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
    if (failed) {
      const reason = failed.reason;
      toast.error("Couldn't save all changes", reason instanceof ApiError ? reason.message : "Please try again.");
    } else {
      setSaved(true);
      toast.success("Settings saved");
    }
  }

  return (
    <SettingsShell active="profile" title="Business Profile" description="This information appears on your website and in your dashboard.">
      {loading ? (
        <p className="flex items-center gap-2 text-[14px] text-white/65">
          <Loader2 size={16} className="animate-spin" /> Loading your profile…
        </p>
      ) : (
        // `key` lets defaultValues populate once data (profile + location) arrives.
        <form key={`${p ? "p" : ""}${location ? "l" : ""}`} onSubmit={onSave} className="space-y-6">
          {hadError && (
            <p className="rounded-lg border border-danger/20 bg-rose-500/[0.06] px-4 py-3 text-[13px] text-rose-200">
              {error.message}
            </p>
          )}

          <Section title="Business Details">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelCls}>Business Name</label>
                <input name="name" defaultValue={p?.name ?? ""} placeholder="Your business name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tagline</label>
                <input name="tagline" defaultValue={p?.tagline ?? ""} placeholder="A short line that describes what you do" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea name="description" rows={4} defaultValue={p?.description ?? ""} placeholder="Tell customers about your business…" className={`${inputCls} resize-none`} />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelCls}>Industry (Locked)</label>
                  <div className="flex cursor-not-allowed items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-[14px] text-white/65">
                    <span>{p?.industry ?? "—"}</span>
                    <Lock size={16} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input name="email" type="email" defaultValue={p?.email ?? ""} placeholder="you@business.com" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input name="phone" type="tel" defaultValue={p?.phone ?? ""} placeholder="+234 …" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Subdomain</label>
                  <div className="cursor-not-allowed rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 font-mono text-[14px] text-white/65">
                    {p?.subdomain ? `${p.subdomain}.conddo.io` : "—.conddo.io"}
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Branding">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelCls}>Logo</label>
                <input type="hidden" name="logoUrl" value={logoUrl} />
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-3.5 py-3 transition-colors hover:border-primary">
                  <input type="file" accept="image/png,image/jpeg,image/svg+xml" className="sr-only" onChange={onLogoUpload} disabled={uploadingLogo} />
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-9 w-auto max-w-[120px] object-contain" />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/[0.08] text-primary"><Save size={16} /></span>
                  )}
                  <span className="text-[14px] text-primary">{uploadingLogo ? "Uploading…" : logoUrl ? "Change logo" : "Upload a logo"}</span>
                </label>
                <p className="mt-1 text-[12px] text-white/45">PNG, JPG or SVG · up to 2MB</p>
              </div>
              <div>
                <label className={labelCls}>Primary Brand Color</label>
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 shrink-0 rounded-lg border border-white/[0.06] bg-primary" />
                  <input name="primaryColor" placeholder="#7C5CBF" className={`${inputCls} font-mono uppercase`} />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Social Handles">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {([
                ["Instagram", "instagram", "@"],
                ["Twitter/X", "twitter", "@"],
                ["Facebook", "facebook", "/"],
              ] as const).map(([label, name, prefix]) => (
                <div key={name}>
                  <label className={labelCls}>{label}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/45">{prefix}</span>
                    <input name={name} placeholder="yourhandle" className={`${inputCls} pl-7`} />
                  </div>
                </div>
              ))}
              <div>
                <label className={labelCls}>LinkedIn</label>
                <input name="linkedin" placeholder="Company profile URL" className={inputCls} />
              </div>
            </div>
          </Section>

          <Section title="Location">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelCls}>Street Address</label>
                <input name="street" defaultValue={(location?.street as string) ?? ""} placeholder="Street address" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>City</label>
                  <input name="city" defaultValue={(location?.city as string) ?? ""} placeholder="City" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <input name="state" defaultValue={(location?.state as string) ?? ""} placeholder="State" className={inputCls} />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Business Hours">
            <div className="divide-y divide-white/[0.06]">
              {hours.map((h) => (
                <div key={h.day} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked={h.on} className="peer sr-only" />
                      <div className="h-6 w-11 rounded-full bg-neutral-strong transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-5" />
                    </label>
                    <span className={`w-24 text-[14px] ${h.on ? "font-medium text-white" : "text-white/45"}`}>{h.day}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input defaultValue={h.open ?? ""} placeholder="09:00 AM" className="w-24 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-center font-mono text-[13px] text-white placeholder:text-white/35" />
                    <span className="text-[12px] text-white/45">to</span>
                    <input defaultValue={h.close ?? ""} placeholder="06:00 PM" className="w-24 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-center font-mono text-[13px] text-white placeholder:text-white/35" />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <div className="flex items-center justify-between border-t border-white/[0.06] pt-6">
            <span className="text-[13px] text-emerald-300">{saved ? "Saved." : ""}</span>
            <Button variant="primary" size="md" disabled={saving}>
              {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      )}
    </SettingsShell>
  );
}
