/**
 * Resume / experience data consumed by the interactive timeline on the home
 * page (src/components/resume/ExperienceTimeline.tsx).
 *
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
    id: "sileria",
    company: "Sileria",
    role: "Software Engineer",
    period: "Aug 2025 — Present",
    location: "Harbor City, CA",
    metrics: [
      "3 platforms · 1 codebase",
      "150+ test suite",
      "22 yrs validated",
    ],
    bullets: [
      "Built AlSalah, a Kotlin Multiplatform prayer-times app shipping to Android, iOS, and Desktop from one shared codebase — Compose Multiplatform UI, Room persistence, Koin DI.",
      "Engineered a Hijri calendar that computes month boundaries from per-location lunar crescent visibility, implementing the peer-reviewed Odeh (2004) astronomical criterion on top of custom sun and moon ephemeris code.",
      "Wrote a 150+ test validation suite checking the astronomy engine against NASA, JPL HORIZONS, and textbook reference values, plus end-to-end checks against 22 years of published records.",
      "Built the backing Ktor server (Netty, Exposed ORM, SQLite, HikariCP) serving prayer-time and scheduling endpoints, packaged as a WAR and deployed to Tomcat 11, plus Python observability tooling for real-time application health.",
    ],
    skills: [
      "Kotlin Multiplatform",
      "Compose",
      "Ktor",
      "Room",
      "Koin",
      "Python",
    ],
  },
  {
    id: "glazey-glass",
    company: "Glazey Glass Company",
    role: "IT Systems & Operations Manager",
    period: "Jan 2025 — Aug 2025",
    location: "Los Angeles, CA",
    metrics: [
      "2x cost-recovery floor",
      "Automated bidding",
      "Faster forecasts",
    ],
    bullets: [
      "Built an automated bid-pricing system in Python that calculated job costs and flagged bids below a 2x cost-recovery threshold, giving estimators a reliable floor on every project.",
      "Wrote custom QuickBooks reporting automation that pulled weekly cash-flow summaries, improving forecast accuracy and cutting manual accounting time by several hours per month.",
    ],
    skills: ["Python", "Automation", "QuickBooks API"],
  },
  {
    id: "city-of-la",
    company: "City of Los Angeles ITA",
    role: "Information Technology Analyst",
    period: "Apr 2023 — Apr 2024",
    location: "Remote",
    metrics: ["1000s calls/day", "100+ tickets/day", "95% CSAT"],
    bullets: [
      "Rebuilt Amazon Connect and Lex bot call flows suffering latency and routing failures, reducing dropped calls for a contact center handling thousands of requests per day.",
      "Traced recurring system failures to root cause alongside engineering teams and shipped scripted fixes that kept the same incidents from reopening.",
      "Resolved 100+ support tickets daily across multiple departments while maintaining a 95% customer satisfaction rating.",
    ],
    skills: ["Amazon Connect", "Amazon Lex", "Scripting", "Troubleshooting"],
  },
];
