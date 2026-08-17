<div align="center">

<img src="apps/web/public/favicon.svg" width="72" alt="benday" />

# benday

**Your logo, halftoned into a thinking indicator.**

[Docs](https://benday.kacemmathlouthi.dev/usage) · [Playground](https://benday.kacemmathlouthi.dev/playground) · [Registry](https://benday.kacemmathlouthi.dev/r/registry.json)

<img src="apps/web/public/og.png" alt="The benday monogram above a stippled figure standing in a field of dots" width="820" />

</div>

## Install

```bash
bunx shadcn@latest add @benday/benday
```

```tsx
import { Benday } from "@/components/ui/benday";

<Benday src="/logo.svg" state={isThinking ? "thinking" : "done"} />;
```

Seven files land in your project and belong to you. Only React is required — there is no package to depend on. `@benday` is a namespace in [shadcn's registry directory](https://github.com/shadcn-ui/ui/pull/11447), so there is nothing to add to `components.json`.

## Presets

Twenty-one presets span signature, sweep, orbit, field and transform motion: contour waves, serpentine cascades, radar beams, orbiting comets, equalizers, magnetic pulls, staged resolves and more.

`thinking` runs the preset; `idle` and `done` show the crisp mark, and the dots spring back into it. A preset is a function of one dot and the clock, so write your own.

## How it works

The image is rasterized once, ink separated from background by alpha or luminance, then a Euclidean distance transform gives every dot its depth inside the mark. That dot map is all the renderer animates — cached by source, paused off-screen, honouring reduced motion, resolving `currentColor` against the canvas.

Bake at build time and pass `dotMap` instead of `src` to skip the work entirely.

## Repository

```text
registry/ui/          the primitive — mirrors the tree the CLI installs
registry.json         the source catalog
apps/web/             docs site and playground
apps/web/public/r/    generated payloads, committed
```

The docs app imports `registry/` through `@registry/*` rather than keeping a copy, so every example on the site is the code that ships.

The site is prerendered: `apps/web/src/lib/seo.ts` lists every page, and `bun run build` writes one HTML file per route with its own title, description, canonical and rendered markup. **A new route must be added to `PAGES` there** — there is no SPA fallback, so a route missing from that list is a 404 on a direct hit.

## Development

```bash
bun install
bun run dev
```

`registry:build` regenerates the payloads and must be committed with any change to `registry/`. `check`, `typecheck`, `knip` and `build` are what CI runs. See [CONTRIBUTING](./CONTRIBUTING.md).

MIT
