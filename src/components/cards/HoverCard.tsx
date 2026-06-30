"use client";

import { type ReactNode } from "react";

/**
 * Card shell with two hover effects: a subtle lift and a green radial spotlight
 * that follows the cursor across the surface. Implemented with plain CSS
 * variables (no animation library) so it stays cheap to mount on card-heavy
 * pages; the spotlight is decorative and the lift is disabled under
 * prefers-reduced-motion via the global rule in globals.css.
 */
export function HoverCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
      }}
      className={`group relative overflow-hidden rounded-[var(--radius-base)] border border-border bg-panel transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent-dim ${className}`}
    >
      {/* Cursor-tracking spotlight (positioned via --mx/--my set on hover). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(57,211,83,0.12), transparent 70%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
