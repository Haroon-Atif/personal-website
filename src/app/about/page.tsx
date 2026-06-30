import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Window } from "@/components/ui/Window";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name}.`,
};

const stack = [
  "TypeScript",
  "Python",
  "React / Next.js",
  "Node.js",
  "Go",
  "Linux",
  "Burp Suite",
  "Docker",
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
            Hi — I&apos;m {site.name}. I work at the intersection of security
            and software: building things carefully, then trying to break them.
          </p>
          <p>
            This site is where I keep my writing and projects. The blog is
            grouped by topic — security notes, dev notes, and a long-running
            novel translation — and the projects section collects tools and
            visualizations I&apos;ve built.
          </p>
          <p>
            Outside of code, I read widely and translate fiction, which keeps me
            honest about clarity: whether it&apos;s a sentence or a system, the
            goal is the same — make the complex feel simple.
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

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={`mailto:${site.email}`} variant="primary">
          get in touch
        </ButtonLink>
        <ButtonLink href={site.cv} variant="ghost">
          download cv
        </ButtonLink>
      </div>
    </section>
  );
}
