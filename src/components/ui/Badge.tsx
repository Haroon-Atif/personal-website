import { type ReactNode } from "react";

/** Small monospace chip used for tags, skills, and tech labels. */
export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded border border-border bg-bg-subtle px-2 py-0.5 font-mono text-xs text-muted ${className}`}
    >
      {children}
    </span>
  );
}
