import { type ReactNode } from "react";

/**
 * Section heading with a terminal-prompt prefix, e.g. `~/blog $ ls topics`.
 * `path` is the simulated working directory; `command` the typed command.
 */
export function SectionHeading({
  path,
  command,
  children,
}: {
  path: string;
  command: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8">
      <p className="font-mono text-sm text-muted">
        <span className="text-accent">~/{path}</span>
        <span className="text-faint"> $ </span>
        <span className="text-foreground">{command}</span>
      </p>
      {children ? (
        <h2 className="mt-2 font-mono text-2xl font-semibold text-foreground sm:text-3xl">
          {children}
        </h2>
      ) : null}
    </div>
  );
}
