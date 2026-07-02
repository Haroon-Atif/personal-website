"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav } from "@/lib/site";
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
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Interactive terminal prompt — now on mobile as well as desktop so
            `cd` navigation works everywhere (the username still links home). */}
        <NavPrompt directories={directories} pathname={pathname} />

        {/* Desktop links. */}
        <ul className="hidden shrink-0 items-center gap-1 sm:flex">
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
          className="shrink-0 font-mono text-sm text-muted hover:text-accent-bright sm:hidden"
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
