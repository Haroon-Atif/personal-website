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
    role: "Engineering Volunteer",
    period: "Aug 2025 — Present",
    location: "Harbor City, CA",
    metrics: [
      "Segmented UniFi network",
      "First AlSalah iOS build",
      "Live test install",
    ],
    bullets: [
      "Planned the facility's physical security architecture — siting cameras, access points, and keycard entries around high-risk zones, with coverage modeled in UniFi Design Center.",
      "Designed and tested a secure Ubiquiti network with a segmented architecture, proving the design in a live test environment before the permanent install.",
      "Led work through a funding pause by supervising ethernet jack and keystone installation, as well as designing the library arches and the wooden prayer dome.",
      "Shipped the first iOS build of AlSalah, a Compose Multiplatform prayer app — configuring the iOS target and simulator toolchain and delivering the home screen.",
    ],
    skills: [
      "Ubiquiti UniFi",
      "Network Security",
      "Physical Security",
      "Kotlin Multiplatform",
      "Compose",
      "iOS",
    ],
  },
  {
    id: "glazey-glass",
    company: "Glazey Glass Company",
    role: "IT Systems & Operations Manager (Part-Time)",
    period: "Jan 2025 — Aug 2025",
    location: "Los Angeles, CA",
    metrics: [
      "2x cost-recovery floor",
      "SpaceX bid protected",
      "Owner self-sufficient",
    ],
    bullets: [
      "Blocked a SpaceX job from being bid below cost by analyzing past bids to derive a 2x cost-recovery floor, enforcing the rule in an Excel VBA macro built with Claude.",
      "Consolidated scattered accounting and vendor accounts onto QuickBooks and Excel, ensuring accurate management of the business's records.",
      "Trained a non-technical owner on QuickBooks, Excel, and AI tooling until he ran reporting and quoting unassisted.",
    ],
    skills: ["Excel VBA", "QuickBooks", "AI Tooling"],
  },
  {
    id: "city-of-la",
    company: "City of Los Angeles ITA",
    role: "Information Technology Analyst (Intern)",
    period: "Apr 2023 — Apr 2024",
    location: "Remote",
    metrics: ["100+ tickets/day", "95% CSAT", "$10k+/yr recovered"],
    bullets: [
      "Resolved 100+ ServiceNow tickets daily across citywide departments at a 95% customer satisfaction rating.",
      "Led fellow interns through assigned projects, modernizing the ServiceNow knowledge base by auditing and retiring stale articles.",
      "Exposed a hidden backlog by building ServiceNow reports on improperly tagged and configured tickets.",
      "Recovered $10k+ per year by auditing telecom billing and surfacing active charges for retired services.",
    ],
    skills: ["ServiceNow", "Reporting", "Auditing", "Leadership"],
  },
];
