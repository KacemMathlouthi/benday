import type { PageMeta } from "@/lib/seo";
import { OG_IMAGE, OG_IMAGE_ALT, SITE_NAME, canonicalFor } from "@/lib/seo";

/**
 * The per-page head, described once. The prerender serializes these into the
 * HTML each URL serves; the client applies the same set on SPA navigation, in
 * place, so there is never a second title or a stale canonical.
 */
export type HeadTag =
  | { kind: "title"; content: string }
  | { kind: "meta"; attr: "name" | "property"; key: string; content: string }
  | { kind: "link"; rel: string; href: string };

export function headTags(page: PageMeta): HeadTag[] {
  const url = canonicalFor(page);
  const tags: HeadTag[] = [
    { content: page.title, kind: "title" },
    {
      attr: "name",
      content: page.description,
      key: "description",
      kind: "meta",
    },
    { href: url, kind: "link", rel: "canonical" },

    { attr: "property", content: "website", key: "og:type", kind: "meta" },
    {
      attr: "property",
      content: SITE_NAME,
      key: "og:site_name",
      kind: "meta",
    },
    { attr: "property", content: url, key: "og:url", kind: "meta" },
    { attr: "property", content: page.title, key: "og:title", kind: "meta" },
    {
      attr: "property",
      content: page.description,
      key: "og:description",
      kind: "meta",
    },
    { attr: "property", content: OG_IMAGE, key: "og:image", kind: "meta" },
    {
      attr: "property",
      content: "1200",
      key: "og:image:width",
      kind: "meta",
    },
    { attr: "property", content: "630", key: "og:image:height", kind: "meta" },
    {
      attr: "property",
      content: "image/png",
      key: "og:image:type",
      kind: "meta",
    },
    {
      attr: "property",
      content: OG_IMAGE_ALT,
      key: "og:image:alt",
      kind: "meta",
    },

    {
      attr: "name",
      content: "summary_large_image",
      key: "twitter:card",
      kind: "meta",
    },
    { attr: "name", content: page.title, key: "twitter:title", kind: "meta" },
    {
      attr: "name",
      content: page.description,
      key: "twitter:description",
      kind: "meta",
    },
    { attr: "name", content: OG_IMAGE, key: "twitter:image", kind: "meta" },
    {
      attr: "name",
      content: OG_IMAGE_ALT,
      key: "twitter:image:alt",
      kind: "meta",
    },

    // The 404 body is served on every unknown URL; none may be indexed.
    {
      attr: "name",
      content: page.indexable ? "index, follow" : "noindex, follow",
      key: "robots",
      kind: "meta",
    },
  ];

  return tags;
}

/** CSS selector identifying the one element a tag owns, so updates replace. */
function selectorFor(tag: HeadTag): string {
  if (tag.kind === "title") {
    return "title";
  }
  if (tag.kind === "link") {
    return `link[rel="${tag.rel}"]`;
  }
  return `meta[${tag.attr}="${tag.key}"]`;
}

/**
 * Rewrite the head for a client-side navigation. Tags are mutated where they
 * already exist — the prerendered HTML shipped a full set — so no duplicates
 * accumulate and nothing has to be torn down between routes.
 */
export function applyHead(page: PageMeta): void {
  for (const tag of headTags(page)) {
    const selector = selectorFor(tag);
    let element = document.head.querySelector(selector);

    if (!element) {
      element = document.createElement(
        tag.kind === "title" ? "title" : tag.kind
      );
      if (tag.kind === "meta") {
        element.setAttribute(tag.attr, tag.key);
      }
      if (tag.kind === "link") {
        element.setAttribute("rel", tag.rel);
      }
      document.head.append(element);
    }

    if (tag.kind === "title") {
      element.textContent = tag.content;
    } else if (tag.kind === "link") {
      element.setAttribute("href", tag.href);
    } else {
      element.setAttribute("content", tag.content);
    }
  }
}
