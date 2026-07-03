import type { ReactNode } from "react";

/**
 * Terminal-window chrome shared by every project visualization: a titlebar with
 * traffic-light dots and a mono label, wrapping arbitrary children. Extracted
 * from the original inlined `MoonSighting` so all viz panels look consistent and
 * future projects reuse it. See docs/visualizations.md.
 */
export function VizFrame({
  label,
  children,
  className = "",
}: {
  /** Mono label shown in the titlebar (e.g. `crescent-visibility · odeh (2004)`). */
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[var(--radius-base)] border border-border bg-panel ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-border bg-bg-subtle px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-3 rounded-full bg-red/80" />
          <span className="size-3 rounded-full bg-amber/80" />
          <span className="size-3 rounded-full bg-accent/80" />
        </span>
        <span className="ml-2 font-mono text-xs text-muted">{label}</span>
      </div>
      {children}
    </div>
  );
}
