"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  LayoutGrid,
  Globe,
  ChevronRight,
  Copy,
  UserPlus,
  ShoppingBag,
  Instagram,
  Loader2,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useOnboarding } from "@/lib/onboarding-store";
import { registerComplete } from "@/lib/api/account";

const tasks: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Add your first customer", href: "/customers", icon: UserPlus },
  { label: "Create your first order", href: "/orders", icon: ShoppingBag },
  { label: "Connect Instagram", href: "/settings", icon: Instagram },
];

// Built from the Stitch "Onboarding Completion" screen (step 5 of 5). On mount
// this finalises signup (POST /auth/register/complete) — creating the tenant and
// logging the user in — so "Go to my dashboard" lands them authenticated.
export default function ReadyStep() {
  const router = useRouter();
  const { fullName, businessName, verticalId, planId, registrationId } = useOnboarding();
  const [status, setStatus] = useState<"creating" | "ready" | "error">(registrationId ? "creating" : "ready");
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  async function finalise() {
    if (!registrationId) return;
    setStatus("creating");
    setError(null);
    try {
      await registerComplete({ registrationId, businessName: businessName.trim() || "My business", businessType: verticalId, planId });
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't finish setting up your workspace.");
      setStatus("error");
    }
  }

  useEffect(() => {
    if (started.current || !registrationId) return;
    started.current = true;
    finalise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstName = fullName.trim().split(/\s+/)[0];
  const greeting = firstName ? `You're all set, ${firstName}.` : "You're all set!";
  const business = businessName.trim() || "Your business";
  const slug = businessName.trim()
    ? businessName.trim().toLowerCase().replace(/\s+/g, "-")
    : "your-business";

  return (
    <div className="w-full max-w-2xl">
      {/* Success header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary">
          <Check size={30} className="text-primary" strokeWidth={2.5} />
        </span>
        <h1 className="text-[28px] leading-tight tracking-[-0.02em] md:text-[34px]">
          {greeting}
        </h1>
        <p className="mt-2 text-[16px] text-white/65">
          {business} is now on conddo.io.
        </p>
      </div>

      {/* Status cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
              <LayoutGrid size={20} />
            </span>
            <Chip tone="success">Live</Chip>
          </div>
          <h3 className="text-[15px] font-medium text-white">Your dashboard is ready</h3>
          <p className="mt-1 text-[14px] leading-relaxed text-white/65">
            Start adding customers, orders, and inventory right now.
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
              <Globe size={20} />
            </span>
            <Chip tone="warning">In progress</Chip>
          </div>
          <h3 className="text-[15px] font-medium text-white">Your website is being built</h3>
          <p className="mt-1 text-[14px] leading-relaxed text-white/65">
            Our team is working on your website. You&apos;ll get a notification when it&apos;s ready.
          </p>
        </div>
      </div>

      {/* Head-start checklist */}
      <div className="mb-8 rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
        <p className="mb-3 text-[14px] font-medium text-white">While you wait, get a head start:</p>
        <ul className="divide-y divide-neutral-border">
          {tasks.map(({ label, href, icon: Icon }) => (
            <li key={label}>
              <a
                href={href}
                className="flex items-center justify-between py-3 transition-colors hover:text-primary"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.02] text-white/65">
                    <Icon size={16} />
                  </span>
                  <span className="text-[14px] text-white">{label}</span>
                </span>
                <ChevronRight size={18} className="text-white/45" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-5">
        {status === "error" && (
          <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-danger/20 bg-rose-500/[0.06] px-4 py-3 text-[14px] text-rose-200">
            <AlertCircle size={18} className="shrink-0" /> {error}
          </div>
        )}
        {status === "creating" ? (
          <Button variant="primary" size="lg" className="w-full max-w-sm" disabled>
            <Loader2 size={18} className="animate-spin" /> Setting up your workspace…
          </Button>
        ) : status === "error" ? (
          <Button onClick={finalise} variant="primary" size="lg" className="w-full max-w-sm">
            Try again
          </Button>
        ) : (
          <Button onClick={() => router.push("/dashboard")} variant="primary" size="lg" className="w-full max-w-sm">
            Go to my dashboard
          </Button>
        )}
        <div className="text-center">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-white/45">
            Share your conddo.io link
          </p>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-cinema-elev px-3.5 py-1.5">
            <span className="font-mono text-[13px] text-primary">{slug}.conddo.io</span>
            <Copy size={14} className="text-white/45" />
          </span>
        </div>
      </div>
    </div>
  );
}
