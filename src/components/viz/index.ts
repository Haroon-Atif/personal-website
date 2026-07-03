import type { MDXComponents } from "mdx/types";
import { AlSalahPanel } from "./AlSalahPanel";
import { CrescentGlobe } from "./CrescentGlobe";

/**
 * Registry of interactive project visualizations usable from MDX.
 *
 * Any component listed here can be dropped into a project's `.mdx` body by name
 * — e.g. `<AlSalahPanel />` — and it renders (client-side) on that project's
 * detail page. This is how a project card leads to "a different page with a
 * visualization of the project": add a component here, reference it in the
 * project's MDX, done. See docs/visualizations.md.
 */
export const vizComponents = {
  AlSalahPanel,
  CrescentGlobe,
} satisfies MDXComponents;
