import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TopicCard } from "@/components/cards/TopicCard";
import { getTopicGroups } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Writing grouped by topic — security, systems, translation, and more.",
};

// Friendly headings for known categories; unknown ones fall back to the slug.
const CATEGORY_LABELS: Record<string, string> = {
  security: "Security",
  engineering: "Engineering",
  novels: "Novel Translations",
  writing: "Writing",
};

export default function BlogIndexPage() {
  const groups = getTopicGroups();

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <SectionHeading path="blog" command="ls topics/">
        Blog
      </SectionHeading>

      <p className="mb-10 max-w-2xl font-sans text-sm leading-relaxed text-muted">
        Each card is a topic — a collection of articles on a single subject.
        Every novel I translate gets its own topic; pick one to browse its
        chapters or articles.
      </p>

      {groups.length === 0 ? (
        <p className="font-mono text-sm text-faint">
          $ ls: no topics yet — add one under content/blog/
        </p>
      ) : (
        <div className="space-y-12">
          {groups.map(({ category, topics }) => (
            <div key={category}>
              <h2 className="mb-5 font-mono text-sm text-muted">
                <span className="text-faint">~/blog/</span>
                <span className="text-accent">
                  {CATEGORY_LABELS[category] ?? category}
                </span>
                <span className="text-faint"> ({topics.length})</span>
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {topics.map((topic) => (
                  <TopicCard key={topic.slug} topic={topic} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
