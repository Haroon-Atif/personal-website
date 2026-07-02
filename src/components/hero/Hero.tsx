import { Window } from "@/components/ui/Window";
import { ButtonLink } from "@/components/ui/Button";
import { Typewriter } from "@/components/hero/Typewriter";
import { site } from "@/lib/site";

/** Landing hero: a terminal window introducing who you are, with CTAs. */
export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
      <Window title={`${site.handle}@dev: ~/whoami`} glow>
        <div className="space-y-5 font-mono">
          <p className="text-sm text-muted">
            <span className="text-accent">$</span> whoami
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {site.name}
          </h1>

          <p className="text-base text-cyan sm:text-lg">
            <span className="text-faint">&gt; </span>
            <Typewriter
              phrases={[
                "software engineer",
                "kotlin multiplatform dev",
                "astronomy-engine builder",
                "security tinkerer",
              ]}
            />
          </p>

          <p className="max-w-2xl font-sans text-sm leading-relaxed text-muted sm:text-base">
            {site.tagline}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href="/projects" variant="primary">
              ./projects
            </ButtonLink>
            <ButtonLink href="/blog" variant="ghost">
              ./blog
            </ButtonLink>
            <ButtonLink href={site.cv} variant="ghost">
              download cv
            </ButtonLink>
          </div>
        </div>
      </Window>
    </section>
  );
}
