"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, AlertCircle, MailCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { forgotPassword, slugify } from "@/lib/api/account";

const inputCls =
  "h-11 w-full rounded-md border border-neutral-strong bg-neutral-surface px-3.5 text-[15px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none";
const labelCls = "mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-content-secondary";

export default function ForgotPasswordPage() {
  const [workspace, setWorkspace] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword({ tenantSlug: slugify(workspace), email });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start the reset. Please try again.");
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
          {sent ? (
            <div className="text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-bg text-primary">
                <MailCheck size={26} />
              </span>
              <h1 className="text-[22px] leading-tight tracking-[-0.01em] text-ink">Check your email</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-content-secondary">
                If an account matches <span className="font-medium text-ink">{email}</span>, we&apos;ve sent a reset code.
                Use it on the reset page to set a new password.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Button href="/reset-password" variant="primary" size="lg" className="w-full">
                  Enter reset code
                </Button>
                <Link href="/login" className="text-[14px] font-medium text-content-secondary hover:text-ink">
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <>
              <header className="mb-6 text-center">
                <h1 className="text-[24px] leading-tight tracking-[-0.01em] text-ink">Reset your password</h1>
                <p className="mt-1.5 text-[15px] text-content-secondary">We&apos;ll email you a code to reset it.</p>
              </header>

              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-[14px] text-danger">
                  <AlertCircle size={18} className="shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className={labelCls}>Workspace</label>
                  <div className="flex">
                    <input
                      className={`${inputCls} rounded-r-none`}
                      placeholder="your-business"
                      value={workspace}
                      onChange={(e) => setWorkspace(e.target.value)}
                      required
                    />
                    <span className="inline-flex h-11 items-center rounded-r-md border border-l-0 border-neutral-strong bg-neutral-surface2 px-3 font-mono text-[13px] text-content-muted">
                      .conddo.io
                    </span>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email address</label>
                  <input
                    className={inputCls}
                    type="email"
                    placeholder="you@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button variant="primary" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                  {submitting ? "Sending…" : "Send reset code"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-content-secondary hover:text-ink">
                  <ArrowLeft size={15} /> Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
