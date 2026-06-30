"use client";

import { useEffect, useState } from "react";

/**
 * Types out each phrase, pauses, deletes, and advances to the next — a classic
 * terminal effect. Honors prefers-reduced-motion by showing the first phrase
 * statically. Always renders a trailing block cursor.
 */
export function Typewriter({
  phrases,
  className = "",
}: {
  phrases: string[];
  className?: string;
}) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (phrases.length === 0) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Reduced motion: skip the animation, just show the first phrase.
    if (reduced) {
      const t = setTimeout(() => setText(phrases[0]), 0);
      return () => clearTimeout(t);
    }

    let phrase = 0;
    let char = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = phrases[phrase];
      char += deleting ? -1 : 1;
      setText(current.slice(0, char));

      let delay = deleting ? 35 : 70;
      if (!deleting && char === current.length) {
        delay = 1600; // hold the full phrase
        deleting = true;
      } else if (deleting && char === 0) {
        deleting = false;
        phrase = (phrase + 1) % phrases.length;
        delay = 350;
      }
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [phrases]);

  return (
    <span className={className}>
      <span className="text-accent-bright">{text}</span>
      <span className="cursor" aria-hidden />
    </span>
  );
}
