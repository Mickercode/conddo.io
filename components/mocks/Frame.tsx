import type { ReactNode } from "react";

/**
 * A flat browser/app chrome frame. Depth via a hard 1px border, never a
 * shadow. Optional faux URL pill in the title bar.
 */
export function Frame({
  url,
  children,
  className = "",
}: {
  url?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-neutral-border bg-neutral-surface2 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-strong" />
        {url && (
          <div className="ml-3 flex-1">
            <span className="inline-block rounded-full bg-neutral-surface px-3 py-1 font-mono text-[11px] text-content-muted">
              {url}
            </span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
