import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { MdxContent } from "@/components/mdx/MdxContent";
import { getProject, getProjectParams } from "@/lib/projects";

export function generateStaticParams() {
  return getProjectParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { meta } = getProject(slug);
    return { title: meta.title, description: meta.summary };
  } catch {
    return { title: "Project" };
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let project;
  try {
    project = getProject(slug);
  } catch {
    notFound();
  }
  const { meta, content } = project;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href="/projects"
        className="mb-6 inline-block font-mono text-xs text-muted hover:text-accent-bright"
      >
        ← cd ../projects
      </Link>

      <header className="mb-8 border-b border-border pb-6">
        <h1 className="font-mono text-2xl font-bold text-foreground sm:text-4xl">
          {meta.title}
        </h1>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-muted">
          {meta.summary}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {meta.tech.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>

        {meta.demoUrl || meta.repoUrl ? (
          <div className="mt-5 flex flex-wrap gap-3">
            {meta.demoUrl ? (
              <ButtonLink href={meta.demoUrl} variant="primary">
                live demo ↗
              </ButtonLink>
            ) : null}
            {meta.repoUrl ? (
              <ButtonLink href={meta.repoUrl} variant="ghost">
                source ↗
              </ButtonLink>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="prose-terminal">
        <MdxContent source={content} />
      </div>
    </article>
  );
}
