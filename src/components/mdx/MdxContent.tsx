import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode, {
  type Options as PrettyCodeOptions,
} from "rehype-pretty-code";
import { mdxComponents } from "./mdx-components";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: "github-dark-dimmed",
  keepBackground: false,
};

/**
 * Server component that compiles and renders an MDX article string with GFM
 * support and Shiki-powered syntax highlighting. Runs at build time under
 * static export.
 */
export function MdxContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
        },
      }}
    />
  );
}
