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

Seven files land in your project and belong to you. Only React is required — there is no package to depend on.

## Presets

|           |                                               |
| --------- | --------------------------------------------- |
| `contour` | a wave through the mark's own thickness       |
| `shimmer` | a lit band on the diagonal                    |
| `ripple`  | concentric rings from the centre              |
| `scatter` | dots leave the lattice, then reconverge       |
| `breathe` | the whole mark swells and settles             |
| `flicker` | a random subset blinks                        |
| `swirl`   | a twist around the centre, outer dots lagging |

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

## Development

```bash
bun install
bun run dev
```

`registry:build` regenerates the payloads and must be committed with any change to `registry/`. `check`, `typecheck`, `knip` and `build` are what CI runs. See [CONTRIBUTING](./CONTRIBUTING.md).

MIT
