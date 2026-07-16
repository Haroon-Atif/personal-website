/**
 * Central site configuration: identity, navigation, and social links.
 * Edit this one file to update the name, tagline, and contact links
 * surfaced across the nav, hero, and footer.
 */
export const site = {
  name: "Haroon Atif",
  handle: "haroon",
  role: "Software Engineer",
  tagline:
    "Software engineer in Los Angeles building cross-platform apps, AI agents, and security-minded systems — and writing about the engineering behind them.",
  email: "atif.haroon02@gmail.com",
  url: "https://haroonatif.com",
  socials: {
    github: "https://github.com/Haroon-Atif/",
    linkedin: "https://www.linkedin.com/in/haroon-atif/",
  },
  // Real CV lives in /public (see public/Haroon_Atif_CV.pdf).
  cv: "/Haroon_Atif_CV.pdf",
} as const;

export type NavItem = { label: string; href: string };

export const nav: NavItem[] = [
  { label: "home", href: "/" },
  { label: "blog", href: "/blog" },
  { label: "projects", href: "/projects" },
  { label: "about", href: "/about" },
];
