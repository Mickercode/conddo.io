"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, MailCheck, ArrowLeft, ArrowRight } from "lucide-react";
import {
  CinematicAuthShell,
  AuthCard,
  fieldLabelCls,
  fieldInputCls,
} from "@/components/auth/CinematicAuthShell";
import { forgotPassword, slugify } from "@/lib/api/account";

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

  if (sent) {
    return (
      <CinematicAuthShell>
        <div className="cinema-tile p-8 md:p-9 text-center">
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary-light border border-primary/25">
            <MailCheck size={26} strokeWidth={1.5} />
          </span>
          <h1 className="text-balance text-[28px] md:text-[32px] font-semibold tracking-tighter text-white leading-[1.1]">
            Check your email
          </h1>
          <p className="mt-3 text-[14.5px] text-white/65 leading-relaxed">
            If an account matches <span className="font-medium text-white">{email}</span>, we&apos;ve sent a reset code. Use it on the reset page to set a new password.
          </p>
          <div className="mt-7 flex flex-col gap-3">
            <Link
              href="/reset-password"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[14.5px] font-medium text-ink transition-all hover:bg-white/90"
            >
              Enter reset code
              <ArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="text-[13.5px] font-medium text-white/55 hover:text-white transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </CinematicAuthShell>
    );
  }

  return (
    <CinematicAuthShell>
      <AuthCard title="Reset your password" subtitle="We'll email you a code to reset it.">
        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-500/[0.06] px-4 py-3 text-[13.5px] text-rose-200">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className={fieldLabelCls}>Workspace</label>
            <div className="flex">
              <input
                className={`${fieldInputCls} rounded-r-none`}
                placeholder="your-business"
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                required
              />
              <span className="inline-flex h-11 items-center rounded-r-lg border border-l-0 border-white/10 bg-white/[0.02] px-3 font-mono text-[12.5px] text-white/45">
                .conddo.io
              </span>
            </div>
          </div>
          <div>
            <label className={fieldLabelCls}>Email address</label>
            <input
              className={fieldInputCls}
              type="email"
              placeholder="you@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[14.5px] font-medium text-ink transition-all hover:bg-white/90 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? "Sending…" : "Send reset code"}
            {!submitting && <ArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </AuthCard>
    </CinematicAuthShell>
  );
}
