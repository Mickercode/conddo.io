"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep } from "@/lib/onboarding-steps";
import { businessNamePlaceholder, type VerticalId } from "@/lib/verticalCopy";

const NIGERIAN_STATES = ["Lagos", "Abuja (FCT)", "Rivers", "Oyo", "Kano"];
const SWATCHES = ["#7C5CBF", "#111111", "#1A6B4A", "#C0392B", "#2980B9", "#C17F3A", "#E84393", "#00CEC9"];

const inputCls =
  "h-11 w-full rounded-md border border-neutral-strong bg-neutral-surface px-3.5 text-[15px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none";
const labelCls =
  "mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-content-secondary";

// Built from the Stitch "Business Profile Setup" screen, adapted into the
// consistent onboarding chrome (form + live preview; setup-sidebar dropped).
export default function BusinessProfileStep() {
  const router = useRouter();
  const { update, verticalId } = useOnboarding();
  const namePlaceholder = businessNamePlaceholder((verticalId as VerticalId | null) ?? undefined);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [color, setColor] = useState("#7C5CBF");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
      setLogoError("Use a PNG, JPG, or SVG image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Image must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  const onContinue = () => {
    update({ businessName: name, description, address });
    const next = nextStep("business-profile");
    if (next) router.push(hrefFor(next.slug));
  };

  return (
    <>
      <header className="mb-10 text-center">
        <h1 className="text-[28px] leading-tight tracking-[-0.02em] md:text-[32px]">
          Tell us about your business
        </h1>
        <p className="mt-2 text-[16px] text-content-secondary">
          This builds your website automatically based on the details you provide.
        </p>
      </header>

      <div className="grid w-full gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Business name</label>
            <input
              className={inputCls}
              placeholder={namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Tagline</label>
            <input
              className={inputCls}
              placeholder="e.g. Custom fashion, made for you"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Business description</label>
            <textarea
              rows={3}
              className={`${inputCls} h-auto py-2.5`}
              placeholder="Briefly describe what you do, your history, or your unique value proposition..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Phone number</label>
              <div className="flex">
                <span className="inline-flex h-11 items-center rounded-l-md border border-r-0 border-neutral-strong bg-neutral-surface2 px-3 font-mono text-[14px] text-content-secondary">
                  +234
                </span>
                <input className={`${inputCls} rounded-l-none`} placeholder="801 234 5678" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} type="email" placeholder="contact@business.com" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Business address</label>
            <input className={inputCls} placeholder="Street name, building number" />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>City</label>
              <input
                className={inputCls}
                placeholder="e.g. Ikeja"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <select className={`${inputCls} appearance-none`} defaultValue="Lagos">
                {NIGERIAN_STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Logo upload */}
          <div>
            <label className={labelCls}>Logo</label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-strong bg-neutral-bg px-6 py-7 text-center transition-colors hover:border-primary hover:bg-primary-bg/30">
              <input type="file" accept="image/png,image/jpeg,image/svg+xml" className="sr-only" onChange={onLogoChange} />
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="h-16 w-auto max-w-[180px] object-contain" />
              ) : (
                <Upload size={20} className="text-content-muted" />
              )}
              <p className="text-[14px] text-content-secondary">
                <span className="text-primary">{logoPreview ? "Change logo" : "Upload your logo"}</span>
              </p>
              <p className="font-mono text-[11px] text-content-muted">PNG, JPG or SVG · up to 2MB</p>
            </label>
            {logoError && <p className="mt-1 text-[12px] text-danger">{logoError}</p>}
          </div>

          {/* Brand primary colour */}
          <div>
            <label className={labelCls}>Brand primary colour</label>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Full-spectrum picker */}
              <label
                className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-full ring-1 ring-neutral-border transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                title="Pick any colour"
              >
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#7C5CBF"}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 h-[200%] w-[200%] cursor-pointer opacity-0"
                />
              </label>
              <span className="mr-1 h-5 w-px bg-neutral-border" />
              {SWATCHES.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setColor(hex)}
                  aria-label={hex}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    color === hex
                      ? "ring-2 ring-primary ring-offset-2"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
              <div className="ml-1 flex items-center">
                <span className="inline-flex h-9 items-center rounded-l-md border border-r-0 border-neutral-strong bg-neutral-surface2 px-2 font-mono text-[13px] text-content-muted">
                  #
                </span>
                <input
                  value={color.replace("#", "")}
                  onChange={(e) => setColor("#" + e.target.value.replace("#", ""))}
                  className="h-9 w-24 rounded-r-md border border-neutral-strong bg-neutral-surface px-2 font-mono text-[13px] uppercase text-ink focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <Button onClick={onContinue} variant="primary" size="lg" className="w-full">
            Save and continue
          </Button>
        </div>

        {/* Live website preview */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.06em] text-content-muted">
            Your website preview
          </p>
          <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
            <div className="flex items-center gap-1.5 border-b border-neutral-border bg-neutral-surface2 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-neutral-strong" />
              <span className="h-2 w-2 rounded-full bg-neutral-strong" />
              <span className="h-2 w-2 rounded-full bg-neutral-strong" />
              <span className="ml-2 truncate font-mono text-[10px] text-content-muted">
                {(name ? name.toLowerCase().replace(/\s+/g, "-") : "your-business")}.conddo.io
              </span>
            </div>
            <div className="flex flex-col items-center px-5 py-7 text-center">
              <span
                className="mb-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg"
                style={{ backgroundColor: logoPreview ? "transparent" : color + "22" }}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="" className="h-full w-full object-contain" />
                ) : (
                  <ImageIcon size={22} style={{ color }} />
                )}
              </span>
              <p className="text-[16px] font-medium text-ink">
                {name || "Your Business Name"}
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-content-secondary">
                {tagline || "Your tagline or mission statement will appear here automatically."}
              </p>
              <span
                className="mt-4 rounded-md px-4 py-2 text-[12px] font-medium text-white"
                style={{ backgroundColor: color }}
              >
                Book a Consultation
              </span>
              <div className="mt-5 grid w-full grid-cols-2 gap-2">
                <span className="h-12 rounded-md bg-neutral-surface2" />
                <span className="h-12 rounded-md bg-neutral-surface2" />
              </div>
            </div>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-content-muted">
            Changes you make on the left update this preview in real-time.
          </p>
        </aside>
      </div>
    </>
  );
}
