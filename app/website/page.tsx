"use client";

import { useState } from "react";
import { Globe, MessageSquarePlus, Eye, MailQuestion, Lock, LayoutTemplate } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { RequestChangesModal } from "@/components/app/RequestChangesModal";
import { api } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";
import type { Result } from "@/lib/api/types";

// FE-side normalized status — keep this stable; backend casing/values get
// mapped to these.
type WebsiteStatus = "live" | "in_progress" | "draft";

// Wire shapes — match WebsiteService.java records.
type WireSite = {
  subdomain: string;
  customDomain: string | null;
  status: string;              // "NOT_STARTED" | "IN_PROGRESS" | "LIVE" (backend casing)
  publishedAt: string | null;
};
type WireStatus = { state: string; domain: string; visitsToday: number; enquiries: number };
type WireSection = { type: string; label: string; configured: boolean };

type WebsiteSection = { id: string; name: string; configured: boolean };
type Website = {
  subdomain: string;
  customDomain: string | null;
  status: WebsiteStatus;
  publishedAt: string | null;
  visitsToday: number;
  enquiries: number;
  sections: WebsiteSection[];
};

const statusChip: Record<WebsiteStatus, { tone: "success" | "warning" | "neutral"; label: string }> = {
  live: { tone: "success", label: "● Live" },
  in_progress: { tone: "warning", label: "In progress" },
  draft: { tone: "neutral", label: "Draft" },
};

function normalizeStatus(s: string | null | undefined): WebsiteStatus {
  const v = (s ?? "").toUpperCase();
  if (v === "LIVE") return "live";
  if (v === "IN_PROGRESS") return "in_progress";
  return "draft"; // covers NOT_STARTED + anything unexpected
}

// Combine /website + /website/status + /website/sections into one screen-shaped
// payload. Tolerant: if /status or /sections fail (e.g. a 500 during early
// build-out), we still render the page with sensible defaults instead of
// crashing the whole tab.
async function fetchWebsite(): Promise<Result<Website>> {
  const siteRes = await api.get<WireSite>("/website");
  const [statusRes, sectionsRes] = await Promise.all([
    api.get<WireStatus>("/website/status").catch(() => null),
    api.get<WireSection[]>("/website/sections").catch(() => null),
  ]);
  const sections: WebsiteSection[] = (sectionsRes?.data ?? []).map((s) => ({
    id: s.type,
    name: s.label,
    configured: s.configured,
  }));
  return {
    data: {
      subdomain: siteRes.data.subdomain,
      customDomain: siteRes.data.customDomain,
      status: normalizeStatus(siteRes.data.status),
      publishedAt: siteRes.data.publishedAt,
      visitsToday: statusRes?.data.visitsToday ?? 0,
      enquiries: statusRes?.data.enquiries ?? 0,
      sections,
    },
    meta: siteRes.meta,
  };
}

function WebsiteContent({ site }: { site: Website }) {
  const [requestOpen, setRequestOpen] = useState(false);
  const domain = site.customDomain ?? `${site.subdomain}.conddo.io`;
  const chip = statusChip[site.status] ?? statusChip.draft;

  return (
    <div className="space-y-6">
      {/* Status hero */}
      <div className="flex flex-col gap-4 rounded-xl border border-neutral-border bg-neutral-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Chip tone={chip.tone}>{chip.label}</Chip>
            {site.publishedAt && <span className="text-[12px] text-content-muted">Published {site.publishedAt}</span>}
          </div>
          <p className="font-mono text-[18px] text-ink">{domain}</p>
        </div>
        <div className="flex gap-2">
          <Button href={`https://${domain}`} variant="secondary" size="md">
            <Eye size={16} /> View site
          </Button>
          <Button variant="primary" size="md" onClick={() => setRequestOpen(true)}>
            <MessageSquarePlus size={16} /> Request changes
          </Button>
        </div>
      </div>
      <RequestChangesModal open={requestOpen} onClose={() => setRequestOpen(false)} />

      {/* Traffic */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] text-content-secondary">Visits today</p>
            <Eye size={18} className="text-content-muted" />
          </div>
          <p className="font-mono text-[24px] font-medium leading-none text-ink">{site.visitsToday}</p>
        </div>
        <div className="rounded-xl border border-neutral-border bg-neutral-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] text-content-secondary">New enquiries</p>
            <MailQuestion size={18} className="text-content-muted" />
          </div>
          <p className="font-mono text-[24px] font-medium leading-none text-ink">{site.enquiries}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
        <div className="border-b border-neutral-border px-6 py-4">
          <h2 className="text-[15px] font-medium text-ink">Pages &amp; sections</h2>
        </div>
        {site.sections.length > 0 ? (
          <ul className="divide-y divide-neutral-border">
            {site.sections.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-6 py-3.5">
                <span className="flex items-center gap-3 text-[14px] text-ink">
                  <LayoutTemplate size={16} className="text-content-muted" />
                  {s.name}
                </span>
                <Chip tone={s.configured ? "success" : "neutral"}>{s.configured ? "Configured" : "Default"}</Chip>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-8 text-center text-[14px] text-content-secondary">No sections configured yet.</p>
        )}
      </div>

      {/* Custom domain */}
      <div className="rounded-xl border border-neutral-border bg-neutral-surface p-6">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-[15px] font-medium text-ink">Custom domain</h2>
          <span className="rounded bg-primary-bg px-1.5 py-0.5 text-[10px] font-bold text-primary">PRO</span>
        </div>
        <p className="mb-4 text-[14px] text-content-secondary">
          Point your own domain (e.g. yourbusiness.com) at your conddo.io website.
        </p>
        <Button variant="secondary" size="md" disabled className="opacity-60">
          <Lock size={16} /> Available on Pro
        </Button>
      </div>
    </div>
  );
}

export default function WebsitePage() {
  const { data, loading, error, refetch } = useApiQuery<Website>(fetchWebsite);

  return (
    <AppShell title="Website" subtitle="Your online storefront">
      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={!data}
        onRetry={refetch}
        loadingLabel="Loading your website…"
        empty={
          <EmptyState
            icon={Globe}
            title="Your website isn't live yet"
            description="Our team is building your site from your business brief. Its status, traffic, and pages will appear here once it's ready."
            action={<Button variant="primary" size="md">Request a status update</Button>}
          />
        }
      >
        {data && <WebsiteContent site={data} />}
      </QueryBoundary>
    </AppShell>
  );
}
