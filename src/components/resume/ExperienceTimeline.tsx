"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import type { Experience } from "@content/resume/experience";

/**
 * Interactive resume: a sticky side rail tracks progress while each role
 * activates (green border + glow, undimmed) as it reaches the centre of the
 * viewport on scroll. The role closest to centre is the active one.
 */
export function ExperienceTimeline({ items }: { items: Experience[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
      {/* Sticky progress rail (desktop). */}
      <aside className="hidden lg:block">
        <ul className="sticky top-24 space-y-3 font-mono text-sm">
          {items.map((exp, i) => (
            <li key={exp.id}>
              <button
                type="button"
                onClick={() =>
                  refs.current[i]?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  })
                }
                className={`flex items-center gap-2 text-left transition-colors ${
                  i === active
                    ? "text-accent-bright"
                    : "text-faint hover:text-muted"
                }`}
              >
                <span
                  className={`h-px w-6 transition-all ${
                    i === active ? "w-10 bg-accent-bright" : "bg-border-strong"
                  }`}
                />
                {exp.company}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Role cards. */}
      <ol className="space-y-6">
        {items.map((exp, i) => {
          const isActive = i === active;
          return (
            <li
              key={exp.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
            >
              <article
                className={`rounded-[var(--radius-base)] border bg-panel p-5 transition-all duration-300 sm:p-6 ${
                  isActive
                    ? "border-accent-dim glow-box opacity-100"
                    : "border-border opacity-60"
                }`}
              >
                <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-mono text-lg font-semibold text-foreground">
                    {exp.role}
                    <span className="text-accent"> @ </span>
                    {exp.company}
                  </h3>
                  <span className="font-mono text-xs text-muted">
                    {exp.period}
                  </span>
                </header>

                {exp.location ? (
                  <p className="mt-1 font-mono text-xs text-faint">
                    {exp.location}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  {exp.metrics.map((m) => (
                    <span
                      key={m}
                      className="rounded border border-accent-dim/40 bg-accent-soft/40 px-2 py-0.5 font-mono text-xs text-accent-bright"
                    >
                      {m}
                    </span>
                  ))}
                </div>

                <ul className="mt-4 space-y-1.5 font-sans text-sm leading-relaxed text-muted">
                  {exp.bullets.map((b, bi) => (
                    <li key={bi} className="flex gap-2">
                      <span className="text-accent">▹</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap gap-2">
                  {exp.skills.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
