import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site for GitHub Pages (no SSR / API routes).
  output: "export",
  // Required because the static export has no Next.js image optimization server.
  images: { unoptimized: true },
  // Emit each route as a folder with index.html so nested paths resolve on
  // static hosts (e.g. /blog/cybersecurity/ -> /blog/cybersecurity/index.html).
  trailingSlash: true,
};

export default nextConfig;
