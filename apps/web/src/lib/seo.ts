/**
 * One description of every page, read by three consumers: the prerender writes
 * it into the static HTML each URL serves, the client rewrites it on SPA
 * navigation, and the sitemap lists what is indexable.
 */

export const SITE_URL = "https://benday.kacemmathlouthi.dev";
export const SITE_NAME = "benday";
export const OG_IMAGE = `${SITE_URL}/og.png`;
export const OG_IMAGE_ALT =
  "The benday monogram above a stippled figure standing in a field of dots";

export interface PageMeta {
  /** Route path, exactly as react-router matches it. */
  path: string;
  /** File written under dist, without the extension. */
  file: string;
  title: string;
  description: string;
  /** Off for the 404: it is served on every unknown URL. */
  indexable: boolean;
}

export const PAGES: PageMeta[] = [
  {
    description:
      "Turn any logo into an animated dot-field thinking indicator for AI and agent UIs. An open-code shadcn primitive with 21 presets — no package to depend on.",
    file: "index",
    indexable: true,
    path: "/",
    title: "benday — your logo, halftoned into a thinking indicator",
  },
  {
    description:
      "Install benday from the shadcn registry, tune the bake, pre-bake a dot map at build time, and read every prop. Only React is required.",
    file: "usage",
    indexable: true,
    path: "/usage",
    title: "Usage — install and API reference | benday",
  },
  {
    description:
      "Drop your own logo in and watch it become a dot field. Tune the grid, threshold and motion preset live, then copy the JSX.",
    file: "playground",
    indexable: true,
    path: "/playground",
    title: "Playground — drop your logo in | benday",
  },
  {
    description: "That page does not exist.",
    file: "404",
    indexable: false,
    path: "*",
    title: "Not found — benday",
  },
];

const NOT_FOUND = PAGES.at(-1) as PageMeta;

/** The metadata for a pathname; the 404 entry when nothing matches. */
export function metaForPath(pathname: string): PageMeta {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  return PAGES.find((page) => page.path === normalized) ?? NOT_FOUND;
}

/** Absolute URL for a page — crawlers do not resolve relative ones. */
export function canonicalFor(page: PageMeta): string {
  return page.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${page.path}`;
}
