import Link from "next/link";
import { HoverCard } from "./HoverCard";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { ArticleMeta } from "@/lib/blog";

/** List item card for a single article within a topic. */
export function ArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <HoverCard>
      <Link
        href={`/blog/${article.topic}/${article.slug}`}
        className="block p-5 sm:p-6"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-mono text-base font-semibold text-foreground group-hover:text-accent-bright sm:text-lg">
            {article.title}
          </h3>
          <time className="shrink-0 font-mono text-xs text-faint">
            {formatDate(article.date)}
          </time>
        </div>

        <p className="mt-2 font-sans text-sm leading-relaxed text-muted">
          {article.description}
        </p>

        {article.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <Badge key={t}>#{t}</Badge>
            ))}
          </div>
        ) : null}
      </Link>
    </HoverCard>
  );
}
