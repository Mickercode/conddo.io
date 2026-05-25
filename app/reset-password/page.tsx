"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { resetPassword } from "@/lib/api/account";

const inputCls =
  "h-11 w-full rounded-md border border-neutral-strong bg-neutral-surface px-3.5 text-[15px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none";
const labelCls = "mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-content-secondary";

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

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-bg px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Image src="/conddo_logo.png" alt="conddo.io" width={1800} height={480} priority className="h-8 w-auto" />
        </div>

        <div className="rounded-2xl border border-neutral-border bg-neutral-surface p-7 sm:p-8">
          {done ? (
            <div className="text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-success-bg text-success">
                <CheckCircle2 size={26} />
              </span>
              <h1 className="text-[22px] leading-tight tracking-[-0.01em] text-ink">Password updated</h1>
              <p className="mt-2 text-[15px] text-content-secondary">Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <header className="mb-6 text-center">
                <h1 className="text-[24px] leading-tight tracking-[-0.01em] text-ink">Set a new password</h1>
                <p className="mt-1.5 text-[15px] text-content-secondary">Enter the code from your email and choose a new password.</p>
              </header>

              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-[14px] text-danger">
                  <AlertCircle size={18} className="shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className={labelCls}>Reset code</label>
                  <input
                    className={`${inputCls} font-mono`}
                    placeholder="Paste the code from your email"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>New password</label>
                  <div className="relative">
                    <input
                      className={`${inputCls} pr-11`}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-secondary"
                    >
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Confirm password</label>
                  <input
                    className={inputCls}
                    type={show ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
                <Button variant="primary" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                  {submitting ? "Updating…" : "Update password"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-[14px] font-medium text-content-secondary hover:text-ink">
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
