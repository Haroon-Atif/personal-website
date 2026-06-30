import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { MdxContent } from "@/components/mdx/MdxContent";
import { formatDate } from "@/lib/format";
import { getAllArticleParams, getArticle, getTopic } from "@/lib/blog";

export function generateStaticParams() {
  return getAllArticleParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string; slug: string }>;
}): Promise<Metadata> {
  const { topic, slug } = await params;
  try {
    const { meta } = getArticle(topic, slug);
    return { title: meta.title, description: meta.description };
  } catch {
    return { title: "Article" };
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ topic: string; slug: string }>;
}) {
  const { topic, slug } = await params;
  const topicMeta = getTopic(topic);
  if (!topicMeta) notFound();

  let article;
  try {
    article = getArticle(topic, slug);
  } catch {
    notFound();
  }
  const { meta, content } = article;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href={`/blog/${topic}`}
        className="mb-6 inline-block font-mono text-xs text-muted hover:text-accent-bright"
      >
        ← cd ../{topic}
      </Link>

      <header className="mb-8 border-b border-border pb-6">
        <p className="font-mono text-xs text-accent">
          ~/blog/{topic}/{slug}.mdx
        </p>
        <h1 className="mt-3 font-mono text-2xl font-bold text-foreground sm:text-4xl">
          {meta.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <time className="font-mono text-xs text-muted">
            {formatDate(meta.date)}
          </time>
          {meta.tags.map((t) => (
            <Badge key={t}>#{t}</Badge>
          ))}
        </div>
      </header>

      <div className="prose-terminal">
        <MdxContent source={content} />
      </div>
    </article>
  );
}
