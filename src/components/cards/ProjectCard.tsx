import Link from "next/link";
import { HoverCard } from "./HoverCard";
import { Badge } from "@/components/ui/Badge";
import type { ProjectMeta } from "@/lib/projects";

/**
 * Project card. The whole body is a link to the project's detail page (where any
 * interactive visualization lives); the demo/source links sit in a separate
 * footer so they don't nest inside the card link.
 */
export function ProjectCard({ project }: { project: ProjectMeta }) {
  return (
    <HoverCard className="flex h-full flex-col">
      <div className="flex h-full flex-col p-5 sm:p-6">
        {/* Clickable body → project detail page. */}
        <Link
          href={`/projects/${project.slug}`}
          className="flex flex-1 flex-col outline-none"
        >
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

          <span className="mt-4 inline-block font-mono text-xs text-accent transition-colors group-hover:text-accent-bright">
            open →
          </span>
        </Link>

        {(project.demoUrl || project.repoUrl) && (
          <div className="mt-auto flex flex-wrap gap-4 pt-5 font-mono text-xs">
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
        )}
      </div>
    </HoverCard>
  );
}
