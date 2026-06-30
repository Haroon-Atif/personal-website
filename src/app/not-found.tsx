import { ButtonLink } from "@/components/ui/Button";
import { Window } from "@/components/ui/Window";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col px-4 py-24 sm:px-6">
      <Window title="error">
        <div className="space-y-4 font-mono">
          <p className="text-sm text-muted">
            <span className="text-accent">$</span> cat $REQUESTED_PATH
          </p>
          <p className="text-2xl font-bold text-foreground">
            <span className="text-red">404</span> — not found
          </p>
          <p className="font-sans text-sm text-muted">
            That path doesn&apos;t exist. It may have been moved, or never
            existed at all.
          </p>
          <div className="pt-2">
            <ButtonLink href="/" variant="primary">
              cd ~
            </ButtonLink>
          </div>
        </div>
      </Window>
    </section>
  );
}
