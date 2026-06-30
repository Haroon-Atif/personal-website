/**
 * Central site configuration: identity, navigation, and social links.
 * Edit this one file to update the name, tagline, and contact links
 * surfaced across the nav, hero, and footer.
 */
export const site = {
  name: "Haroon Atif",
  handle: "haroon",
  role: "Security & Software",
  tagline:
    "I build clean, well-reasoned software and write about security, systems, and the occasional novel translation.",
  email: "atif.haroon02@gmail.com",
  // Replace with your real custom domain before deploying.
  url: "https://example.com",
  socials: {
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
  },
  // CV lives in /public; replace the placeholder file before deploying.
  cv: "/cv.pdf",
} as const;

export type NavItem = { label: string; href: string };

export const nav: NavItem[] = [
  { label: "home", href: "/" },
  { label: "blog", href: "/blog" },
  { label: "projects", href: "/projects" },
  { label: "about", href: "/about" },
];
