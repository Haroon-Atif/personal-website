/**
 * Resume / experience data consumed by the interactive timeline on the home
 * page (src/components/resume/ExperienceTimeline.tsx).
 *
 * This is placeholder content — replace each entry with your real roles.
 * Order newest-first; the timeline renders them top to bottom.
 */
export type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;
  location?: string;
  /** Headline metrics shown as chips (keep them punchy). */
  metrics: string[];
  /** Accomplishment bullets. */
  bullets: string[];
  /** Tech / skills used. */
  skills: string[];
};

export const experiences: Experience[] = [
  {
    id: "acme-security",
    company: "Acme Security",
    role: "Security Engineer",
    period: "2024 — Present",
    location: "Remote",
    metrics: ["30+ vulns triaged", "4 services hardened", "CI gates added"],
    bullets: [
      "Led threat-modeling and remediation across core authentication services.",
      "Built automated dependency and secrets scanning into the CI pipeline.",
      "Wrote internal playbooks adopted by the wider engineering org.",
    ],
    skills: ["Threat Modeling", "Python", "GitHub Actions", "Burp Suite"],
  },
  {
    id: "northwind-labs",
    company: "Northwind Labs",
    role: "Software Engineer",
    period: "2022 — 2024",
    location: "Hybrid",
    metrics: ["10k+ users", "40% latency cut", "0 → 1 product"],
    bullets: [
      "Shipped a customer-facing dashboard from prototype to production.",
      "Refactored the data layer, cutting p95 latency by 40%.",
      "Mentored two junior engineers on testing and code review.",
    ],
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
  },
  {
    id: "open-source",
    company: "Open Source & Writing",
    role: "Maintainer / Author",
    period: "2020 — Present",
    metrics: ["Novel translation", "Security write-ups", "OSS contributions"],
    bullets: [
      "Translating a serialized novel chapter-by-chapter (see the blog).",
      "Publishing long-form security and systems write-ups.",
      "Contributing fixes and docs to tools I use daily.",
    ],
    skills: ["Technical Writing", "Translation", "Git"],
  },
];
