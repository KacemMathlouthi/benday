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
const content = path.join(webRoot, "content");

interface ServerEntry {
  render: (url: string) => string;
  headTags: (page: PageMeta) => HeadTag[];
  PAGES: PageMeta[];
  SITE_URL: string;
  PRESETS: Record<string, { label: string }>;
  PRESET_NAMES: string[];
  buildMarkdown: (page: PageMeta, body: string) => string;
  llmsTxt: (pages: PageMeta[]) => string;
  sitemap: (pages: PageMeta[]) => string;
}

const entry: ServerEntry = await import(
  path.join(webRoot, "dist-ssr", "entry-server.js")
);
const {
  PAGES,
  PRESETS,
  PRESET_NAMES,
  SITE_URL,
  buildMarkdown,
  headTags,
  llmsTxt,
  render,
  sitemap,
} = entry;

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
    const type = tag.type ? ` type="${tag.type}"` : "";
    return `<link rel="${tag.rel}"${type} href="${escape(tag.href)}" />`;
  }
  return `<meta ${tag.attr}="${tag.key}" content="${escape(tag.content)}" />`;
}

/**
 * Structured data, on the homepage only. It describes the site and the project,
 * not the individual page, and repeating it per URL says nothing new.
 * SoftwareApplication is what a machine reads to answer "what is this, what
 * does it cost, who made it"; SoftwareSourceCode answers "where is the code".
 */
function structuredData(): string {
  const author = {
    "@id": `${SITE_URL}/#maintainer`,
    "@type": "Person",
    jobTitle: "Software engineer",
    name: "Kacem Mathlouthi",
    sameAs: [
      "https://github.com/KacemMathlouthi",
      "https://x.com/KacemMathlouthi",
    ],
    url: "https://kacemmathlouthi.dev",
  };

  const description =
    "An open-code React component that rasterizes a logo into a Ben-Day dot field and animates it as a thinking indicator for AI and agent interfaces.";

  const graph = [
    {
      "@id": `${SITE_URL}/#website`,
      "@type": "WebSite",
      description,
      inLanguage: "en",
      name: "benday",
      publisher: { "@id": author["@id"] },
      url: `${SITE_URL}/`,
    },
    author,
    {
      "@id": `${SITE_URL}/#software`,
      "@type": "SoftwareApplication",
      applicationCategory: "DeveloperApplication",
      author: { "@id": author["@id"] },
      description,
      featureList: PRESET_NAMES.map(
        (name) => `${PRESETS[name]?.label ?? name} animation preset`
      ),
      isAccessibleForFree: true,
      license: "https://opensource.org/licenses/MIT",
      name: "benday",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      operatingSystem: "Any",
      programmingLanguage: "TypeScript",
      softwareRequirements: "React 18 or later",
      url: `${SITE_URL}/`,
    },
    {
      "@id": `${SITE_URL}/#source`,
      "@type": "SoftwareSourceCode",
      author: { "@id": author["@id"] },
      codeRepository: "https://github.com/KacemMathlouthi/benday",
      description,
      license: "https://opensource.org/licenses/MIT",
      name: "benday",
      programmingLanguage: "TypeScript",
      targetProduct: { "@id": `${SITE_URL}/#software` },
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

const template = await readFile(path.join(dist, "index.html"), "utf-8");

await Promise.all(
  PAGES.map(async (page) => {
    // The 404 is rendered through a path nothing else can match.
    const url = page.path === "*" ? "/__not-found__" : page.path;
    const html = buildPage(template, page, render(url));
    await writeFile(path.join(dist, `${page.file}.html`), html);
    const body = await readFile(path.join(content, `${page.file}.md`), "utf-8");
    await writeFile(
      path.join(dist, `${page.file}.md`),
      buildMarkdown(page, body)
    );
    process.stdout.write(`prerendered ${page.file}.html + .md\n`);
  })
);

await writeFile(path.join(dist, "sitemap.xml"), sitemap(PAGES));
process.stdout.write("wrote sitemap.xml\n");

await writeFile(path.join(dist, "llms.txt"), llmsTxt(PAGES));
process.stdout.write("wrote llms.txt\n");
