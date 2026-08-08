# Contributing

Thanks for taking a look. benday is a small codebase with one rule that matters more than the rest: **the thing people install lives in `registry/`, and nothing else does.**

## Setup

```bash
bun install
bun run dev
```

`dev` builds the registry and starts the docs site and playground at `localhost:5173`.

## Layout

```text
registry/ui/benday.tsx    the primitive, and the public exports
registry/ui/benday/       bake, renderer, presets, React binding
registry.json             the registry source catalog
apps/web/                 docs site and playground
apps/web/public/r/        generated payloads — never edit by hand
```

`registry/` mirrors the tree the shadcn CLI writes into a consumer's project. That is why the imports inside it are relative (`./benday/renderer`) rather than aliased: an alias would be meaningless once the files land somewhere else. The docs app reaches them through `@registry/*`, so the site renders the same source it distributes.

## Changing the component

1. Edit under `registry/`.
2. Run `bun run registry:build`. This regenerates `apps/web/public/r/*.json`.
3. **Commit the regenerated payloads.** They are what consumers download. CI fails if they drift from the source.

Two things to keep in mind:

- Any file using a React hook needs `"use client"` at the top. Without it the component throws the moment a Next.js server component imports it.
- Only React may be imported. A new dependency has to be declared in `registry.json` under `dependencies`, and that is a cost to every consumer — prefer writing the twenty lines.

## Before opening a PR

```bash
bun run check      # lint and format
bun run typecheck
bun run knip       # unused files, exports, dependencies
bun run build
```

CI runs all of these plus the registry drift check.

`knip` treats `registry/ui/benday.tsx` as an entry point, so its exports are exempt — everything behind it is not. If you add an export that nothing uses, knip will say so, and it is usually right.

## Adding a preset

Presets live in `registry/ui/benday/presets.ts`. One is a pure function of a dot and the clock that writes into a reused `out` object — allocating there runs 500 times a frame, so don't. Register it in `PRESETS` with a `label` and a one-line `description`; the docs table and the playground picker both read from that map, so there is nothing else to update.

## Commits

Short, conventional titles: `feat:`, `fix:`, `refactor:`, `docs:`. The body is for the reasoning the diff cannot show.
