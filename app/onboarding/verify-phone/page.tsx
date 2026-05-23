"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep, prevStep } from "@/lib/onboarding-steps";

const CODE_LENGTH = 4;

// Built from the Stitch "OTP Verification" screen (split-panel dropped for
// flow consistency). Phone OTP is the verification sub-step of step 1.
export default function VerifyPhoneStep() {
  const router = useRouter();
  const { phone } = useOnboarding();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(52);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = d;
      return next;
    });
    if (d && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const onVerify = () => {
    const next = nextStep("verify-phone");
    if (next) router.push(hrefFor(next.slug));
  };

  const goBack = () => {
    const prev = prevStep("verify-phone");
    if (prev) router.push(hrefFor(prev.slug));
  };

  const masked = phone ? `+234 ${phone}` : "your phone number";
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="w-full max-w-md rounded-xl border border-neutral-border bg-neutral-surface p-8">
      <header className="mb-7 text-center">
        <h1 className="text-[24px] leading-tight tracking-[-0.01em] md:text-[26px]">
          Verify your phone number
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-content-secondary">
          We&apos;ve sent a 4-digit code to{" "}
          <span className="font-medium text-ink">{masked}</span>. Enter it below to continue.
        </p>
      </header>

      <div className="mb-6 flex justify-center gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={d}
            inputMode="numeric"
            maxLength={1}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className="h-16 w-14 rounded-lg border border-neutral-strong bg-neutral-surface text-center font-mono text-[24px] text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        ))}
      </div>

      <p className="mb-5 text-center text-[13px] text-content-muted">
        {seconds > 0 ? (
          <>Resend code in {mm}:{ss}</>
        ) : (
          <button className="font-medium text-primary hover:underline" onClick={() => setSeconds(52)}>
            Resend code
          </button>
        )}
      </p>

      <Button onClick={onVerify} variant="primary" size="lg" className="w-full">
        Verify and continue
      </Button>

      <button
        onClick={goBack}
        className="mt-4 block w-full text-center text-[14px] text-content-secondary hover:text-ink"
      >
        Change phone number
      </button>

      <p className="mt-6 text-center text-[13px] text-content-muted">
        Need help?{" "}
        <a href="#" className="font-medium text-primary hover:underline">Contact support</a>
      </p>
    </div>
  );
}
