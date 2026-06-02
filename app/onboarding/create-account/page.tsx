"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep } from "@/lib/onboarding-steps";
import { registerStart } from "@/lib/api/account";

const inputCls =
  "h-11 w-full rounded-md border border-neutral-strong bg-neutral-surface px-3.5 text-[15px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none";
const labelCls =
  "mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-content-secondary";

// Built from the Stitch "Sign Up - Step 1" screen, adapted into the consistent
// onboarding chrome (the marketing split-panel is dropped for flow consistency).
export default function CreateAccountStep() {
  const router = useRouter();
  const { update } = useOnboarding();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize the local number to E.164-ish for the backend (min 7 chars).
  const normalizedPhone = () => {
    const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
    return digits ? `+234${digits}` : "";
  };

  const onContinue = async () => {
    setError(null);
    if (!fullName.trim()) return setError("Enter your full name.");
    if (normalizedPhone().length < 7) return setError("Enter a valid phone number.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");

    setSubmitting(true);
    try {
      const { registrationId, resendCooldownSeconds } = await registerStart({
        fullName: fullName.trim(),
        phone: normalizedPhone(),
        email: email.trim(),
        password,
      });
      update({ fullName, phone, email, password, registrationId, resendCooldownSeconds });
      const next = nextStep("create-account");
      if (next) router.push(hrefFor(next.slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create your account. Please try again.");
    } finally {
      // Always reset so a failed transition can't leave the button locked in
      // "Creating account…" — the success path navigates away anyway.
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <header className="mb-8 text-center">
        <h1 className="text-[28px] leading-tight tracking-[-0.02em] md:text-[32px]">
          Create your account
        </h1>
        <p className="mt-2 text-[16px] text-content-secondary">
          Free for 14 days. No credit card.
        </p>
      </header>

      <div className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-[14px] text-danger">
            <AlertCircle size={18} className="shrink-0" /> {error}
          </div>
        )}
        <div>
          <label className={labelCls}>Full name</label>
          <input
            className={inputCls}
            placeholder="Amaka Obi"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Phone number</label>
          <div className="flex">
            <span className="inline-flex h-11 items-center rounded-l-md border border-r-0 border-neutral-strong bg-neutral-surface2 px-3 font-mono text-[14px] text-content-secondary">
              +234
            </span>
            <input
              className={`${inputCls} rounded-l-none`}
              placeholder="812 345 6789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <p className="mt-1.5 text-[13px] text-content-muted">We&apos;ll email you a code to verify your account.</p>
        </div>
        <div>
          <label className={labelCls}>Email address</label>
          <input
            className={inputCls}
            type="email"
            placeholder="amaka@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Password</label>
          <div className="relative">
            <input
              className={`${inputCls} pr-11`}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-secondary"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="mt-1.5 text-[13px] text-content-muted">Minimum 8 characters.</p>
        </div>

        <Button onClick={onContinue} variant="primary" size="lg" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
          {submitting ? "Creating account…" : "Create account"}
        </Button>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-neutral-border" />
          <span className="text-[12px] uppercase tracking-[0.08em] text-content-muted">or</span>
          <span className="h-px flex-1 bg-neutral-border" />
        </div>

        <Button href="#" variant="secondary" size="lg" className="w-full">
          <span className="font-mono text-[15px] font-medium text-primary">G</span>
          Continue with Google
        </Button>

        <p className="text-center text-[14px] text-content-secondary">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>

      <p className="mt-6 text-center text-[12px] leading-relaxed text-content-muted">
        By clicking “Create account”, you agree to our{" "}
        <a href="#" className="text-content-secondary underline">Terms of Service</a> and{" "}
        <a href="#" className="text-content-secondary underline">Privacy Policy</a>.
      </p>
    </div>
  );
}
