"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, site } from "@/lib/site";
import { NavPrompt } from "./NavPrompt";

/**
 * Sticky terminal-styled top navigation. The left side is an interactive
 * `cd` prompt (NavPrompt) on desktop; route tabs highlight the active page and
 * collapse into a menu on small screens. `directories` is the set of navigable
 * paths the prompt can `cd` into (computed server-side in the layout).
 */
export function Nav({ directories }: { directories: string[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Interactive prompt on desktop. */}
        <div className="hidden sm:block">
          <NavPrompt directories={directories} pathname={pathname} />
        </div>

        {/* Simple brand on mobile (no typing). */}
        <Link
          href="/"
          className="group flex items-center font-mono text-sm sm:hidden"
          onClick={() => setOpen(false)}
        >
          <span className="text-accent">{site.handle}@dev</span>
          <span className="text-faint">:</span>
          <span className="text-cyan">~</span>
          <span className="text-faint">$</span>
          <span className="cursor align-middle" />
        </Link>

        {/* Desktop links. */}
        <ul className="hidden items-center gap-1 sm:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`rounded px-3 py-1.5 font-mono text-sm transition-colors ${
                  isActive(item.href)
                    ? "text-accent-bright glow"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <span className="text-faint">/</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile toggle. */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="font-mono text-sm text-muted hover:text-accent-bright sm:hidden"
        >
          {open ? "[ x ]" : "[ ≡ ]"}
        </button>
      </nav>

      {/* Mobile menu. */}
      {open ? (
        <ul className="flex flex-col gap-1 border-t border-border px-4 py-3 sm:hidden">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded px-3 py-2 font-mono text-sm ${
                  isActive(item.href)
                    ? "text-accent-bright"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <span className="text-faint">/</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
