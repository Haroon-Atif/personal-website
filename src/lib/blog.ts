import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Filesystem-backed blog loader. Content lives in content/blog/<topic>/ where
 * each topic folder has a topic.json (card metadata) and one .mdx file per
 * article. All functions run at build time (static export). See
 * docs/content-authoring.md for the authoring guide.
 */

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type Topic = {
  slug: string;
  title: string;
  description: string;
  /** One of the design-system accent keys used to tint the card. */
  accent: "green" | "cyan" | "amber";
  /** Short emoji/glyph shown on the card. */
  icon: string;
  /** Groups topics on the blog index (e.g. "novels", "security"). */
  category: string;
  order: number;
  articleCount: number;
};

export type ArticleMeta = {
  topic: string;
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
};

function topicDirs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function readArticleFiles(topic: string): string[] {
  const dir = path.join(BLOG_DIR, topic);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getTopics(): Topic[] {
  return topicDirs()
    .map((slug) => {
      const metaPath = path.join(BLOG_DIR, slug, "topic.json");
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
      return {
        slug,
        title: meta.title,
        description: meta.description,
        accent: meta.accent ?? "green",
        icon: meta.icon ?? "›",
        category: meta.category ?? "writing",
        order: meta.order ?? 0,
        articleCount: readArticleFiles(slug).length,
      } satisfies Topic;
    })
    .sort((a, b) => a.order - b.order);
}

/**
 * Topics grouped by category for the blog index. Categories are ordered by the
 * first (lowest-`order`) topic in each, so `order` controls both topic and
 * category sequence.
 */
export function getTopicGroups(): { category: string; topics: Topic[] }[] {
  const groups = new Map<string, Topic[]>();
  for (const topic of getTopics()) {
    const list = groups.get(topic.category) ?? [];
    list.push(topic);
    groups.set(topic.category, list);
  }
  return [...groups.entries()].map(([category, topics]) => ({
    category,
    topics,
  }));
}

export function getTopic(slug: string): Topic | undefined {
  return getTopics().find((t) => t.slug === slug);
}

export function getArticles(topic: string): ArticleMeta[] {
  return readArticleFiles(topic)
    .map((slug) => getArticle(topic, slug).meta)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getArticle(
  topic: string,
  slug: string,
): { meta: ArticleMeta; content: string } {
  const file = path.join(BLOG_DIR, topic, `${slug}.mdx`);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    meta: {
      topic,
      slug,
      title: data.title ?? slug,
      date: data.date ?? "",
      description: data.description ?? "",
      tags: data.tags ?? [],
    },
    content,
  };
}

/** All { topic, slug } pairs for generateStaticParams on article pages. */
export function getAllArticleParams(): { topic: string; slug: string }[] {
  return topicDirs().flatMap((topic) =>
    readArticleFiles(topic).map((slug) => ({ topic, slug })),
  );
}
