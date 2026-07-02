import { Hero } from "@/components/hero/Hero";
import { ExperienceTimeline } from "@/components/resume/ExperienceTimeline";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { EmailLink } from "@/components/ui/EmailLink";
import { experiences } from "@content/resume/experience";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <SectionHeading path="resume" command="cat experience.log">
          Experience
        </SectionHeading>
        <ExperienceTimeline items={experiences} />
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <SectionHeading path="contact" command="./say-hello.sh">
          Get in touch
        </SectionHeading>
        <div className="rounded-[var(--radius-base)] border border-border bg-panel p-6 sm:p-8">
          <p className="max-w-2xl font-sans text-sm leading-relaxed text-muted sm:text-base">
            Have a project, a question, or just want to talk security, code, or
            books? My inbox is open.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <EmailLink email={site.email} className={buttonClasses("primary")}>
              {site.email}
            </EmailLink>
            <ButtonLink href={site.socials.github} variant="ghost">
              github
            </ButtonLink>
            <ButtonLink href={site.socials.linkedin} variant="ghost">
              linkedin
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
