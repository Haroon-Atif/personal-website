import Link from "next/link";
import { HoverCard } from "./HoverCard";
import type { Topic } from "@/lib/blog";

const accentText: Record<Topic["accent"], string> = {
  green: "text-accent-bright",
  cyan: "text-cyan",
  amber: "text-amber",
};

/** Blog topic card linking to a topic's article list. */
export function TopicCard({ topic }: { topic: Topic }) {
  return (
    <HoverCard>
      <Link
        href={`/blog/${topic.slug}`}
        className="block p-5 sm:p-6"
        aria-label={`Open ${topic.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={`font-mono text-2xl ${accentText[topic.accent]}`}
            aria-hidden
          >
            {topic.icon}
          </span>
          <span className="font-mono text-xs text-faint">
            {topic.articleCount}{" "}
            {topic.articleCount === 1 ? "article" : "articles"}
          </span>
        </div>

        <h3 className="mt-4 font-mono text-lg font-semibold text-foreground group-hover:text-accent-bright">
          <span className="text-faint">~/blog/</span>
          {topic.slug}
        </h3>

        <p className="mt-2 font-sans text-sm leading-relaxed text-muted">
          {topic.description}
        </p>

        <p className="mt-4 font-mono text-xs text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          cd {topic.slug} →
        </p>
      </Link>
    </HoverCard>
  );
}
