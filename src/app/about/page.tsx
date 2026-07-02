import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Window } from "@/components/ui/Window";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { EmailLink } from "@/components/ui/EmailLink";
import { Badge } from "@/components/ui/Badge";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name}.`,
};

const stack = [
  "Kotlin",
  "Kotlin Multiplatform",
  "Compose",
  "Python",
  "C / C++",
  "TypeScript",
  "Ktor / FastAPI",
  "Docker",
  "Kubernetes",
  "AWS",
  "Linux",
];

const education = [
  {
    school: "Western Governor's University",
    degree: "B.S. Computer Science",
    detail: "Oct 2025",
  },
  {
    school: "University of California, Irvine",
    degree: "B.S. Computer Science",
    detail: "2023 – 2024",
  },
  {
    school: "Los Angeles Harbor College",
    degree: "A.S. Physics & Mathematics",
    detail: "Summa Cum Laude · GPA 3.95 · Jun 2023",
  },
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <SectionHeading path="about" command="cat README.md">
        About
      </SectionHeading>

      <Window title="about/README.md">
        <div className="space-y-4 font-sans text-[15px] leading-7 text-foreground/90">
          <p>
            Hi — I&apos;m {site.name}, a software engineer based in Los Angeles.
            I build cross-platform apps and the rigorous systems that sit behind
            them, and I like problems where correctness actually matters.
          </p>
          <p>
            Right now I&apos;m at Sileria building <strong>AlSalah</strong>, a
            Kotlin Multiplatform prayer-times app that ships to Android, iOS,
            and Desktop from one shared codebase. Its heart is a from-scratch
            astronomy engine that computes lunar-crescent visibility using the
            peer-reviewed Odeh (2004) criterion — validated against NASA and JPL
            HORIZONS data across 22 years of published records.
          </p>
          <p>
            Before that I automated pricing and reporting pipelines in Python
            and spent a year debugging contact-center systems at the City of Los
            Angeles. I also enjoy lower-level, security-minded work — hardening
            embedded firmware for the MITRE eCTF is a recent favorite.
          </p>
        </div>
      </Window>

      <div className="mt-8">
        <p className="mb-3 font-mono text-sm text-muted">
          <span className="text-accent">$</span> cat stack.txt
        </p>
        <div className="flex flex-wrap gap-2">
          {stack.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 font-mono text-sm text-muted">
          <span className="text-accent">$</span> cat education.log
        </p>
        <ul className="space-y-3">
          {education.map((e) => (
            <li
              key={e.school}
              className="rounded-[var(--radius-base)] border border-border bg-panel p-4"
            >
              <p className="font-mono text-sm font-semibold text-foreground">
                {e.school}
              </p>
              <p className="mt-1 font-sans text-sm text-muted">
                {e.degree}
                <span className="text-faint"> · {e.detail}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <EmailLink email={site.email} className={buttonClasses("primary")}>
          get in touch
        </EmailLink>
        <ButtonLink href={site.cv} variant="ghost">
          download cv
        </ButtonLink>
      </div>
    </section>
  );
}
