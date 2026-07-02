import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import { vizComponents } from "@/components/viz";

/**
 * Element overrides applied to rendered MDX articles. Body copy uses the sans
 * font for readability; headings and code keep the terminal/mono aesthetic.
 * Fenced code blocks are highlighted by rehype-pretty-code (see lib/mdx.ts) —
 * we only style the wrapping <pre>/<code> shells here.
 *
 * `vizComponents` are interactive project visualizations (e.g. <MoonSighting />)
 * that MDX bodies can reference by name; see docs/visualizations.md.
 */
export const mdxComponents: MDXComponents = {
  ...vizComponents,
  h1: (p: ComponentPropsWithoutRef<"h1">) => (
    <h1
      className="mt-10 mb-4 font-mono text-2xl font-bold text-foreground sm:text-3xl"
      {...p}
    />
  ),
  h2: (p: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-10 mb-3 border-b border-border pb-1 font-mono text-xl font-semibold text-foreground"
      {...p}
    />
  ),
  h3: (p: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className="mt-8 mb-2 font-mono text-lg font-semibold text-foreground"
      {...p}
    />
  ),
  p: (p: ComponentPropsWithoutRef<"p">) => (
    <p
      className="my-4 font-sans text-[15px] leading-7 text-foreground/90"
      {...p}
    />
  ),
  a: ({ href = "#", ...rest }: ComponentPropsWithoutRef<"a">) => {
    const external = /^https?:/.test(href);
    return external ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent-bright underline decoration-accent-dim underline-offset-2 hover:glow"
        {...rest}
      />
    ) : (
      <Link
        href={href}
        className="text-accent-bright underline decoration-accent-dim underline-offset-2 hover:glow"
        {...rest}
      />
    );
  },
  ul: (p: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="my-4 ml-5 list-disc space-y-1.5 font-sans text-[15px] leading-7 text-foreground/90 marker:text-accent"
      {...p}
    />
  ),
  ol: (p: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="my-4 ml-5 list-decimal space-y-1.5 font-sans text-[15px] leading-7 text-foreground/90 marker:text-accent"
      {...p}
    />
  ),
  blockquote: (p: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-5 border-l-2 border-accent-dim bg-bg-subtle py-2 pl-4 font-sans text-muted italic"
      {...p}
    />
  ),
  // Inline code (block code is handled by the highlighter's own <code>).
  code: (p: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded border border-border bg-bg-subtle px-1.5 py-0.5 font-mono text-[0.85em] text-accent-bright"
      {...p}
    />
  ),
  pre: (p: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="my-5 overflow-x-auto rounded-[var(--radius-base)] border border-border bg-[#0d1117] p-4 font-mono text-sm leading-relaxed [&>code]:border-0 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit"
      {...p}
    />
  ),
  hr: () => <hr className="my-8 border-border" />,
};
