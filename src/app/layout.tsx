import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/nav/Footer";
import { site } from "@/lib/site";
import { getTopics } from "@/lib/blog";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s · ${site.name}`,
  },
  description: site.tagline,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
    url: site.url,
    siteName: site.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Directories the nav prompt can `cd` into: top-level routes + blog topics.
  const directories = [
    "/",
    "/blog",
    "/projects",
    "/about",
    ...getTopics().map((t) => `/blog/${t.slug}`),
  ];

  return (
    <html
      lang="en"
      className={`${jetbrains.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Nav directories={directories} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
