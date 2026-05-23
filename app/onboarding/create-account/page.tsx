"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep } from "@/lib/onboarding-steps";

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

  const onContinue = () => {
    update({ fullName, phone, email, password });
    const next = nextStep("create-account");
    if (next) router.push(hrefFor(next.slug));
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
          <p className="mt-1.5 text-[13px] text-content-muted">We&apos;ll send an OTP to verify it.</p>
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

        <Button onClick={onContinue} variant="primary" size="lg" className="w-full">
          Create account
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
          <a href="#" className="font-medium text-primary hover:underline">
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
