import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAllArticleParams, getTopics } from "@/lib/blog";
import { getProjectParams } from "@/lib/projects";

// Emit sitemap.xml as a static file (required under output: "export").
export const dynamic = "force-static";

/** Generates sitemap.xml at build time (static export). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const staticRoutes = ["", "/blog", "/projects", "/about"];

  const topicRoutes = getTopics().map((t) => `/blog/${t.slug}`);
  const articleRoutes = getAllArticleParams().map(
    (a) => `/blog/${a.topic}/${a.slug}`,
  );
  const projectRoutes = getProjectParams().map((p) => `/projects/${p.slug}`);

  return [
    ...staticRoutes,
    ...topicRoutes,
    ...articleRoutes,
    ...projectRoutes,
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
