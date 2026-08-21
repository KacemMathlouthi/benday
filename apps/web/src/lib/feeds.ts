/**
 * The files an agent reads instead of the HTML: a markdown twin per page, the
 * llms.txt index, and the sitemap. The prerender writes them into `dist`, and
 * the dev server serves them from here too, so what you test locally is what
 * ships.
 */

import { PRESETS, PRESET_NAMES } from "@registry/ui/benday/presets";

import { PROPS } from "@/lib/api";
import type { PageMeta } from "@/lib/seo";
import { SITE_URL, canonicalFor } from "@/lib/seo";

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
 * The markdown twin of a page, from its `content/*.md` body. Agents that ask
 * for `text/markdown` are served this at the page's own URL. The generated
 * blocks come from the same source the HTML renders, so only the prose is
 * written twice.
 */
export function buildMarkdown(page: PageMeta, body: string): string {
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
export function llmsTxt(pages: PageMeta[]): string {
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

export function sitemap(pages: PageMeta[]): string {
  const urls = pages
    .filter((page) => page.indexable)
    .map((page) => `  <url>\n    <loc>${canonicalFor(page)}</loc>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
