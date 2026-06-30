import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built — demos, tools, and visualizations.",
};

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <SectionHeading path="projects" command="ls -la">
        Projects
      </SectionHeading>

      <p className="mb-8 max-w-2xl font-sans text-sm leading-relaxed text-muted">
        Selected work — tools, experiments, and visualizations. Open any card
        for a write-up, demo, or source.
      </p>

      {projects.length === 0 ? (
        <p className="font-mono text-sm text-faint">
          $ ls: no projects yet — add one under content/projects/
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
