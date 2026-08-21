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

interface PresetDefinition {
  label: string;
  description: string;
  family: string;
}

interface PropRow {
  name: string;
  type: string;
  def: string;
  note: string;
}

interface ServerEntry {
  render: (url: string) => string;
  headTags: (page: PageMeta) => HeadTag[];
  canonicalFor: (page: PageMeta) => string;
  PAGES: PageMeta[];
  SITE_URL: string;
  PRESETS: Record<string, PresetDefinition>;
  PRESET_NAMES: string[];
  PROPS: PropRow[];
}

const entry: ServerEntry = await import(
  path.join(webRoot, "dist-ssr", "entry-server.js")
);
const {
  PAGES,
  PRESETS,
  PRESET_NAMES,
  PROPS,
  SITE_URL,
  canonicalFor,
  headTags,
  render,
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

/** The preset catalogue, straight from the map the renderer reads. */
function presetList(): string {
  return PRESET_NAMES.map((name) => {
    const preset = PRESETS[name];
    if (!preset) {
      return `- \`${name}\``;
    }
    return `- \`${name}\`, **${preset.label}** (${preset.family}): ${preset.description}`;
  }).join("\n");
}

/** A union type carries a pipe, which would otherwise end the table cell early. */
const cell = (value: string) => value.replaceAll("|", "\\|");

/** The prop table, straight from the rows the usage page renders. */
function propTable(): string {
  const rows = PROPS.map((prop) => {
    const def = prop.def === "None" ? "none" : `\`${cell(prop.def)}\``;
    return `| \`${prop.name}\` | \`${cell(prop.type)}\` | ${def} | ${cell(prop.note)} |`;
  });
  return [
    "| Prop | Type | Default | Notes |",
    "| --- | --- | --- | --- |",
    ...rows,
  ].join("\n");
}

/**
 * The markdown twin of a page. Agents that ask for `text/markdown` are served
 * this at the page's own URL. The generated blocks come from the same source
 * the HTML renders, so only the prose is written twice.
 */
async function markdownFor(page: PageMeta): Promise<string> {
  const body = await readFile(path.join(content, `${page.file}.md`), "utf-8");
  const canonical = canonicalFor(page);
  const resolved = body
    .replace("{{presets}}", presetList())
    .replace("{{props}}", propTable())
    .trimEnd();

  return `${resolved}\n\n---\n\nCanonical HTML: <${canonical}>\nAgent index: <${SITE_URL}/llms.txt>\n`;
}

/**
 * The agent index. The "when to use" section is the point of the file: an agent
 * deciding whether to reach for benday should be able to answer that without
 * reading the site, and product copy does not read as guidance.
 */
function llmsTxt(pages: PageMeta[]): string {
  const listed = pages
    .filter((page) => page.indexable)
    .map(
      (page) =>
        `- [${page.title}](${SITE_URL}/${page.file}.md): ${page.description}`
    )
    .join("\n");

  return `# benday

> Turn any logo into an animated Ben-Day dot field and use it as the thinking
> indicator in an AI or agent interface. Distributed as an open-code shadcn
> registry component: the CLI copies seven TypeScript files into the project,
> React is the only import, and there is no package to depend on.

Every page is available as markdown at the same URL with an
\`Accept: text/markdown\` request header, or by appending \`.md\`.

## When to use benday

- A loading or thinking indicator for an AI chat or agent run that should be
  branded rather than generic: the product's own logo, animated.
- A halftone or dot-matrix rendering of an image, driven by real ink coverage
  and by depth inside the shape rather than by a fixed pattern.
- An indicator that must stay legible at 16 to 24px, where a shrunken logo turns
  to mush.
- A canvas animation that must respect \`prefers-reduced-motion\`, stop painting
  off-screen, and follow the current text colour through a theme change.
- Open-code UI: files copied into the repository and owned there, not a package
  upgraded behind your back.

Not for general-purpose charting, image editing, or server-side image
processing: the bake runs through a browser canvas, and the component draws one
logo, not arbitrary graphics.

## How an agent should use it

1. Install with \`bunx shadcn@latest add @benday/benday\` (or \`npx\`/\`pnpm dlx\`).
   Nothing needs to be added to \`components.json\`.
2. Render \`<Benday src="/logo.svg" state={busy ? "thinking" : "done"} />\`.
3. For zero client-side cost, call \`bake()\` at build time and pass the
   resulting \`dotMap\` instead of \`src\`.

## Pages

${listed}

## Reference

- Registry payload: <${SITE_URL}/r/registry.json>
- Repository: <https://github.com/KacemMathlouthi/benday>
- License: MIT. Maintainer: Kacem Mathlouthi (<https://kacemmathlouthi.dev>).
`;
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
    await writeFile(
      path.join(dist, `${page.file}.md`),
      await markdownFor(page)
    );
    process.stdout.write(`prerendered ${page.file}.html + .md\n`);
  })
);

await writeFile(path.join(dist, "sitemap.xml"), sitemap(PAGES));
process.stdout.write("wrote sitemap.xml\n");

await writeFile(path.join(dist, "llms.txt"), llmsTxt(PAGES));
process.stdout.write("wrote llms.txt\n");
