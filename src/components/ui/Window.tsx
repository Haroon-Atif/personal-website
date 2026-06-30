import { type ReactNode } from "react";

/**
 * Terminal / editor "window" chrome: a titlebar with traffic-light dots and a
 * filename label, wrapping arbitrary content. The core visual motif of the site.
 */
export function Window({
  title = "bash",
  children,
  className = "",
  bodyClassName = "",
  glow = false,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[var(--radius-base)] border border-border bg-panel ${
        glow ? "glow-box" : ""
      } ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-border bg-bg-subtle px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-3 rounded-full bg-red/80" />
          <span className="size-3 rounded-full bg-amber/80" />
          <span className="size-3 rounded-full bg-accent/80" />
        </span>
        <span className="ml-2 truncate font-mono text-xs text-muted">
          {title}
        </span>
      </div>
      <div className={`p-5 sm:p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
