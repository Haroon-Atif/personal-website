import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Filesystem-backed projects loader. Each project is one .mdx file in
 * content/projects/ whose frontmatter drives the card and whose body becomes
 * the detail page. See docs/content-authoring.md.
 */

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

export type ProjectMeta = {
  slug: string;
  title: string;
  summary: string;
  tech: string[];
  demoUrl?: string;
  repoUrl?: string;
  featured: boolean;
  order: number;
};

function projectFiles(): string[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getProjects(): ProjectMeta[] {
  return projectFiles()
    .map((slug) => getProject(slug).meta)
    .sort((a, b) => a.order - b.order);
}

export function getProject(slug: string): {
  meta: ProjectMeta;
  content: string;
} {
  const file = path.join(PROJECTS_DIR, `${slug}.mdx`);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    meta: {
      slug,
      title: data.title ?? slug,
      summary: data.summary ?? "",
      tech: data.tech ?? [],
      demoUrl: data.demoUrl,
      repoUrl: data.repoUrl,
      featured: data.featured ?? false,
      order: data.order ?? 0,
    },
    content,
  };
}

export function getProjectParams(): { slug: string }[] {
  return projectFiles().map((slug) => ({ slug }));
}
