import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { getArticles, getTopic, getTopics } from "@/lib/blog";

export function generateStaticParams() {
  return getTopics().map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  const t = getTopic(topic);
  return t
    ? { title: t.title, description: t.description }
    : { title: "Topic" };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const meta = getTopic(topic);
  if (!meta) notFound();

  const articles = getArticles(topic);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href="/blog"
        className="mb-6 inline-block font-mono text-xs text-muted hover:text-accent-bright"
      >
        ← cd ../blog
      </Link>

      <SectionHeading path={`blog/${topic}`} command="ls -la">
        {meta.title}
      </SectionHeading>

      <p className="mb-8 max-w-2xl font-sans text-sm leading-relaxed text-muted">
        {meta.description}
      </p>

      {articles.length === 0 ? (
        <p className="font-mono text-sm text-faint">
          $ ls: no articles in this topic yet.
        </p>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
