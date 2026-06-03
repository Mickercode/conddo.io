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
      <div className="flex items-center gap-2 border-b border-neutral-border bg-neutral-surface2 px-3 py-3 sm:px-4">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-neutral-strong" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-neutral-strong" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-neutral-strong" />
        {url && (
          <div className="ml-2 min-w-0 flex-1 sm:ml-3">
            {/* min-w-0 + truncate so a long URL never pushes the chrome dots
                off the right edge on narrow mobile widths. */}
            <span className="block truncate rounded-full bg-neutral-surface px-3 py-1 font-mono text-[11px] text-content-muted">
              {url}
            </span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
