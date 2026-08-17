/**
 * Turn the built SPA shell into one real HTML file per route.
 *
 * A single index.html served at every URL is what made this site invisible:
 * every page carried the homepage's title, description and canonical, and the
 * body was an empty div. Each page now ships its own head and its own rendered
 * markup, so a crawler that never runs JavaScript still sees the page.
 *
 * Run after `vite build` and `vite build --ssr`.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { HeadTag } from "../src/lib/head";
import type { PageMeta } from "../src/lib/seo";

const webRoot = path.join(import.meta.dirname, "..");
const dist = path.join(webRoot, "dist");

interface ServerEntry {
  render: (url: string) => string;
  headTags: (page: PageMeta) => HeadTag[];
  canonicalFor: (page: PageMeta) => string;
  PAGES: PageMeta[];
  SITE_URL: string;
}

const entry: ServerEntry = await import(
  path.join(webRoot, "dist-ssr", "entry-server.js")
);
const { PAGES, SITE_URL, canonicalFor, headTags, render } = entry;

const escape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function serializeTag(tag: HeadTag): string {
  if (tag.kind === "title") {
    return `<title>${escape(tag.content)}</title>`;
  }
  if (tag.kind === "link") {
    return `<link rel="${tag.rel}" href="${escape(tag.href)}" />`;
  }
  return `<meta ${tag.attr}="${tag.key}" content="${escape(tag.content)}" />`;
}

/**
 * Structured data, on the homepage only — it describes the site and the
 * project, not the individual page, and repeating it per URL says nothing new.
 */
function structuredData(): string {
  const graph = [
    {
      "@type": "WebSite",
      description:
        "Turn any logo into an animated dot-field thinking indicator for AI and agent UIs.",
      name: "benday",
      url: `${SITE_URL}/`,
    },
    {
      "@type": "SoftwareSourceCode",
      author: { "@type": "Person", name: "Kacem Mathlouthi" },
      codeRepository: "https://github.com/KacemMathlouthi/benday",
      description:
        "An open-code React component that rasterizes a logo into a Ben-Day dot field and animates it as a thinking indicator.",
      license: "https://opensource.org/licenses/MIT",
      name: "benday",
      programmingLanguage: "TypeScript",
      url: `${SITE_URL}/`,
    },
  ];
  const json = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  });
  return `<script type="application/ld+json">${json}</script>`;
}

function buildPage(template: string, page: PageMeta, appHtml: string): string {
  const head = headTags(page).map(serializeTag).join("\n    ");
  const extras = page.path === "/" ? `\n    ${structuredData()}` : "";

  return (
    template
      // The shell's own title is a dev-server placeholder; the page brings its own.
      .replace(/\s*<title>[\s\S]*?<\/title>/u, "")
      .replace("<!--seo-->", `${head}${extras}`)
      .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
  );
}

function sitemap(pages: PageMeta[]): string {
  const urls = pages
    .filter((page) => page.indexable)
    .map((page) => `  <url>\n    <loc>${canonicalFor(page)}</loc>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

const template = await readFile(path.join(dist, "index.html"), "utf-8");

await Promise.all(
  PAGES.map(async (page) => {
    // The 404 is rendered through a path nothing else can match.
    const url = page.path === "*" ? "/__not-found__" : page.path;
    const html = buildPage(template, page, render(url));
    await writeFile(path.join(dist, `${page.file}.html`), html);
    process.stdout.write(`prerendered ${page.file}.html\n`);
  })
);

await writeFile(path.join(dist, "sitemap.xml"), sitemap(PAGES));
process.stdout.write("wrote sitemap.xml\n");
