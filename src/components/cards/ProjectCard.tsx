import Link from "next/link";
import { HoverCard } from "./HoverCard";
import { Badge } from "@/components/ui/Badge";
import type { ProjectMeta } from "@/lib/projects";

/** Project card with tech chips and demo/repo links. */
export function ProjectCard({ project }: { project: ProjectMeta }) {
  return (
    <HoverCard className="flex h-full flex-col">
      <div className="flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-mono text-lg font-semibold text-foreground group-hover:text-accent-bright">
            {project.title}
          </h3>
          {project.featured ? (
            <span className="rounded border border-accent-dim/50 bg-accent-soft/40 px-2 py-0.5 font-mono text-[10px] tracking-wider text-accent-bright uppercase">
              featured
            </span>
          ) : null}
        </div>

        <p className="mt-2 font-sans text-sm leading-relaxed text-muted">
          {project.summary}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap gap-4 pt-5 font-mono text-xs">
          <Link
            href={`/projects/${project.slug}`}
            className="text-accent transition-colors hover:text-accent-bright"
          >
            details →
          </Link>
          {project.demoUrl ? (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-accent-bright"
            >
              demo ↗
            </a>
          ) : null}
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-accent-bright"
            >
              source ↗
            </a>
          ) : null}
        </div>
      </div>
    </HoverCard>
  );
}
