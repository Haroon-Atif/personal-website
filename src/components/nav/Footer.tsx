import { site } from "@/lib/site";

/** Terminal-styled footer with contact links. */
export function Footer() {
  const year = new Date().getFullYear();
  const links = [
    { label: "github", href: site.socials.github },
    { label: "linkedin", href: site.socials.linkedin },
    { label: "email", href: `mailto:${site.email}` },
    { label: "cv", href: site.cv },
  ];

  return (
    <footer className="mt-24 border-t border-border bg-bg-subtle">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-mono text-xs text-faint">
          <span className="text-accent">$</span> echo &quot;© {year} {site.name}
          &quot;
        </p>
        <ul className="flex flex-wrap gap-4">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="font-mono text-xs text-muted transition-colors hover:text-accent-bright"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
