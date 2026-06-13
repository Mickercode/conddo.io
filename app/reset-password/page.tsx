"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import {
  CinematicAuthShell,
  AuthCard,
  fieldLabelCls,
  fieldInputCls,
} from "@/components/auth/CinematicAuthShell";
import { resetPassword } from "@/lib/api/account";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetInner />
    </Suspense>
  );
}

function ResetInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [token, setToken] = useState(params.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword({ token: token.trim(), newPassword: password });
      setDone(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reset your password. The code may have expired.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <CinematicAuthShell>
        <div className="cinema-tile p-8 md:p-9 text-center">
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
            <CheckCircle2 size={26} strokeWidth={1.5} />
          </span>
          <h1 className="text-balance text-[28px] md:text-[32px] font-semibold tracking-tighter text-white leading-[1.1]">
            Password updated
          </h1>
          <p className="mt-3 text-[14.5px] text-white/65">Redirecting you to sign in…</p>
        </div>
      </CinematicAuthShell>
    );
  }

  return (
    <CinematicAuthShell>
      <AuthCard title="Set a new password" subtitle="Enter the code from your email and choose a new password.">
        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-500/[0.06] px-4 py-3 text-[13.5px] text-rose-200">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className={fieldLabelCls}>Reset code</label>
            <input
              className={`${fieldInputCls} font-mono`}
              placeholder="Paste the code from your email"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={fieldLabelCls}>New password</label>
            <div className="relative">
              <input
                className={`${fieldInputCls} pr-11`}
                type={show ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
              >
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          <div>
            <label className={fieldLabelCls}>Confirm password</label>
            <input
              className={fieldInputCls}
              type={show ? "text" : "password"}
              placeholder="Re-enter your new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[14.5px] font-medium text-ink transition-all hover:bg-white/90 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? "Updating…" : "Update password"}
            {!submitting && <ArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-[13.5px] font-medium text-white/55 transition-colors hover:text-white">
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    </CinematicAuthShell>
  );
}
