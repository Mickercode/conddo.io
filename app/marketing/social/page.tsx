import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Camera,
  ThumbsUp,
  MessageCircle,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { MarketingTabs } from "@/components/app/MarketingTabs";

type Platform = "instagram" | "facebook" | "twitter" | "linkedin";
type Post = { title: string; platform: Platform; highlight?: boolean };
type Cell = { day: number; muted?: boolean; dot?: boolean; posts?: Post[] };

const platformStyle: Record<Platform, { box: string; icon: LucideIcon }> = {
  instagram: { box: "bg-primary-bg text-primary", icon: Camera },
  facebook: { box: "bg-info-bg text-info", icon: ThumbsUp },
  twitter: { box: "bg-neutral-surface2 text-ink", icon: MessageCircle },
  linkedin: { box: "bg-info-bg text-info", icon: Briefcase },
};

const FILTERS: { label: string; active?: boolean }[] = [
  { label: "All", active: true },
  { label: "Instagram" },
  { label: "Facebook" },
  { label: "Twitter" },
  { label: "LinkedIn" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CELLS: Cell[] = [
  // Row 1 (prev month + May 1–2)
  { day: 26, muted: true }, { day: 27, muted: true }, { day: 28, muted: true }, { day: 29, muted: true }, { day: 30, muted: true }, { day: 1 }, { day: 2 },
  // Row 2
  { day: 3 },
  { day: 4, posts: [{ title: "New product teaser…", platform: "instagram" }] },
  { day: 5, posts: [{ title: "Hiring update for Q3", platform: "linkedin" }] },
  { day: 6, dot: true, posts: [{ title: "Spring Campaign V1", platform: "instagram", highlight: true }] },
  { day: 7 }, { day: 8 }, { day: 9 },
  // Row 3
  { day: 10 },
  { day: 11, posts: [{ title: "Twitter Poll: Best…", platform: "twitter" }] },
  { day: 12 }, { day: 13 }, { day: 14 },
  { day: 15, posts: [{ title: "Client testimonial…", platform: "facebook" }] },
  { day: 16 },
  // Row 4
  { day: 17 }, { day: 18 },
  { day: 19, posts: [{ title: "Behind the scenes…", platform: "instagram" }] },
  { day: 20 },
  { day: 21, posts: [{ title: "Industry news share", platform: "twitter" }] },
  { day: 22 }, { day: 23 },
  // Row 5
  { day: 24 }, { day: 25 },
  { day: 26, posts: [{ title: "Company milestone", platform: "linkedin" }] },
  { day: 27 }, { day: 28 }, { day: 29 }, { day: 30 },
];

export default function SocialCalendarPage() {
  return (
    <AppShell
      title="Marketing"
      actions={
        <Button variant="primary" size="md">
          <Plus size={17} />
          <span className="hidden sm:inline">New Post</span>
        </Button>
      }
    >
      <MarketingTabs active="Social" />

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-medium tracking-[-0.01em] text-ink">May 2026</h2>
          <div className="flex items-center overflow-hidden rounded-lg border border-neutral-border">
            <button className="p-1.5 hover:bg-neutral-surface2"><ChevronLeft size={18} /></button>
            <button className="border-l border-neutral-border p-1.5 hover:bg-neutral-surface2"><ChevronRight size={18} /></button>
          </div>
          <button className="rounded-lg border border-neutral-border bg-neutral-surface px-3.5 py-1.5 text-[13px] font-medium hover:bg-neutral-surface2">Today</button>
        </div>
        <div className="inline-flex rounded-lg border border-neutral-border bg-neutral-surface2 p-1">
          <button className="rounded-md px-4 py-1 text-[13px] text-content-secondary hover:text-ink">Week</button>
          <button className="rounded-md bg-neutral-surface px-4 py-1 text-[13px] font-medium text-primary">Month</button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            className={`rounded-full px-4 py-1.5 text-[13px] transition-colors ${
              f.active
                ? "bg-ink text-white"
                : "border border-neutral-border bg-neutral-surface text-content-secondary hover:border-primary-light"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Month grid */}
      <div className="overflow-x-auto rounded-xl border border-neutral-border bg-neutral-surface">
        <div className="min-w-[760px]">
          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-neutral-border bg-neutral-surface2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 text-center text-[11px] uppercase tracking-[0.05em] text-content-secondary">
                {d}
              </div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7">
            {CELLS.map((cell, i) => (
              <div
                key={i}
                className={`min-h-[100px] border-b border-r border-neutral-border p-2 [&:nth-child(7n)]:border-r-0 ${
                  cell.muted ? "bg-neutral-surface2/40" : ""
                }`}
              >
                <span className={`flex items-center gap-1 font-mono text-[13px] ${cell.muted ? "text-content-muted" : "text-ink"}`}>
                  {cell.day}
                  {cell.dot && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </span>
                {cell.posts && (
                  <div className="mt-1.5 space-y-1">
                    {cell.posts.map((p) => {
                      const s = platformStyle[p.platform];
                      return (
                        <div
                          key={p.title}
                          className={`flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 ${s.box} ${
                            p.highlight ? "ring-1 ring-primary/30" : ""
                          }`}
                        >
                          <s.icon size={12} className="shrink-0" />
                          <span className="truncate text-[10px] font-medium">{p.title}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
