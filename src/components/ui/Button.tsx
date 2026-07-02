import Link from "next/link";
import { type ComponentProps, type ReactNode } from "react";

export type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center gap-2 rounded-[var(--radius-base)] px-4 py-2 font-mono text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const variants: Record<Variant, string> = {
  primary:
    "border border-accent-dim bg-accent-soft text-accent-bright hover:glow-box hover:border-accent hover:-translate-y-0.5",
  ghost:
    "border border-border text-foreground hover:border-accent-dim hover:text-accent-bright hover:-translate-y-0.5",
};

/** Shared terminal-button classes, reused by non-Link controls (e.g. EmailLink). */
export const buttonClasses = (variant: Variant = "primary") =>
  `${base} ${variants[variant]}`;

/** Internal link styled as a terminal button. */
export function ButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
  ...rest
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const isPdf = href.endsWith(".pdf");
  const external = /^(https?:|mailto:|tel:)/.test(href) || isPdf;
  if (external) {
    // PDFs (the CV) should download rather than navigate; open http links in a
    // new tab. Local downloads (same-origin PDF) don't need a new tab.
    const newTab = /^https?:/.test(href);
    return (
      <a
        href={href}
        download={isPdf ? "" : undefined}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        className={`${base} ${variants[variant]} ${className}`}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
