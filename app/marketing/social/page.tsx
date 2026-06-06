"use client";

import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Camera, ThumbsUp, MessageCircle, Briefcase, Send, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { MarketingTabs } from "@/components/app/MarketingTabs";
import { SchedulePostModal } from "@/components/app/SchedulePostModal";
import { Button } from "@/components/ui/Button";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { marketingApi, type MarketingPost } from "@/lib/api/marketing";
import { ApiError } from "@/lib/api/client";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FILTERS = ["All", "instagram", "facebook", "twitter", "linkedin"];
const FILTER_LABEL: Record<string, string> = { All: "All", instagram: "Instagram", facebook: "Facebook", twitter: "Twitter", linkedin: "LinkedIn" };

const platformStyle: Record<string, { box: string; icon: LucideIcon }> = {
  instagram: { box: "bg-primary-bg text-primary", icon: Camera },
  facebook: { box: "bg-info-bg text-info", icon: ThumbsUp },
  twitter: { box: "bg-neutral-surface2 text-ink", icon: MessageCircle },
  linkedin: { box: "bg-info-bg text-info", icon: Briefcase },
};
const styleFor = (p: string | null) => platformStyle[(p ?? "").toLowerCase()] ?? { box: "bg-neutral-surface2 text-ink", icon: MessageCircle };

const iso = (d: Date) => d.toISOString().slice(0, 10);
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function monthGrid(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: Date; muted: boolean }[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ date: new Date(year, month, 1 - (firstWeekday - i)), muted: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d), muted: false });
  while (cells.length % 7 !== 0 || cells.length < 42) cells.push({ date: new Date(year, month, daysInMonth + (cells.length - firstWeekday - daysInMonth + 1)), muted: true });
  return cells.slice(0, 42);
}

export default function SocialCalendarPage() {
  const toast = useToast();
  const today = new Date();
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState("All");
  const [postOpen, setPostOpen] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);

  const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const cells = monthGrid(year, month);
  const monthLabel = base.toLocaleString("en-US", { month: "long", year: "numeric" });

  const { data, loading, error, refetch } = useApiQuery(
    () => marketingApi.posts(`from=${iso(cells[0].date)}&to=${iso(cells[cells.length - 1].date)}`),
    [year, month],
  );
  const posts = (data ?? []).filter((p) => filter === "All" || p.platforms.some((pl) => pl.toLowerCase() === filter));

  const postsOn = (d: Date) =>
    posts.filter((p) => {
      if (!p.scheduledAt) return false;
      const pd = new Date(p.scheduledAt);
      return !isNaN(pd.getTime()) && sameDay(pd, d);
    });

  async function publish(p: MarketingPost) {
    if (p.status?.toLowerCase() === "published") return;
    setPublishing(p.id);
    try {
      await marketingApi.publishPost(p.id);
      toast.success("Post published", p.title ?? undefined);
      refetch();
    } catch (err) {
      toast.error("Couldn't publish", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setPublishing(null);
    }
  }

  return (
    <AppShell
      title="Marketing"
      actions={
        <Button variant="primary" size="md" onClick={() => setPostOpen(true)}>
          <Plus size={17} />
          <span className="hidden sm:inline">New Post</span>
        </Button>
      }
    >
      <MarketingTabs active="Social" />

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-medium tracking-[-0.01em] text-ink">{monthLabel}</h2>
          <div className="flex items-center overflow-hidden rounded-lg border border-neutral-border">
            <button onClick={() => setOffset((o) => o - 1)} className="p-1.5 hover:bg-neutral-surface2"><ChevronLeft size={18} /></button>
            <button onClick={() => setOffset((o) => o + 1)} className="border-l border-neutral-border p-1.5 hover:bg-neutral-surface2"><ChevronRight size={18} /></button>
          </div>
          <button onClick={() => setOffset(0)} className="rounded-lg border border-neutral-border bg-neutral-surface px-3.5 py-1.5 text-[13px] font-medium hover:bg-neutral-surface2">Today</button>
        </div>
      </div>

      {/* Platform filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-[13px] transition-colors ${
              f === filter ? "bg-ink text-white" : "border border-neutral-border bg-neutral-surface text-content-secondary hover:border-primary-light"
            }`}
          >
            {FILTER_LABEL[f]}
          </button>
        ))}
      </div>

      <QueryBoundary loading={loading} error={error} onRetry={refetch} isEmpty={false} empty={null} loadingLabel="Loading your calendar…" gatedFeatureTitle="Social scheduler">
        <div className="overflow-x-auto rounded-xl border border-neutral-border bg-neutral-surface">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-7 border-b border-neutral-border bg-neutral-surface2">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-2 text-center text-[11px] uppercase tracking-[0.05em] text-content-secondary">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((cell, i) => {
                const dayPosts = cell.muted ? [] : postsOn(cell.date);
                const isToday = sameDay(cell.date, today);
                return (
                  <div key={i} className={`min-h-[100px] border-b border-r border-neutral-border p-2 [&:nth-child(7n)]:border-r-0 ${cell.muted ? "bg-neutral-surface2/40" : ""}`}>
                    <span className={`flex items-center gap-1 font-mono text-[13px] ${cell.muted ? "text-content-muted" : isToday ? "font-bold text-primary" : "text-ink"}`}>
                      {cell.date.getDate()}
                      {isToday && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </span>
                    {dayPosts.length > 0 && (
                      <div className="mt-1.5 space-y-1">
                        {dayPosts.map((p) => {
                          const s = styleFor(p.platform);
                          const published = p.status?.toLowerCase() === "published";
                          return (
                            <button
                              key={p.id}
                              onClick={() => publish(p)}
                              disabled={published || publishing === p.id}
                              title={published ? "Published" : "Click to publish now"}
                              className={`group flex w-full items-center gap-1 rounded px-1.5 py-0.5 text-left ${s.box} ${published ? "opacity-70" : "hover:ring-1 hover:ring-primary/40"}`}
                            >
                              <s.icon size={12} className="shrink-0" />
                              <span className="truncate text-[10px] font-medium">{p.title || p.content || "Post"}</span>
                              {!published && <Send size={10} className="ml-auto shrink-0 opacity-0 group-hover:opacity-100" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </QueryBoundary>

      <SchedulePostModal open={postOpen} onClose={() => setPostOpen(false)} defaultDate={iso(today)} onCreated={refetch} />
    </AppShell>
  );
}
