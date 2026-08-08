# benday

Turn any logo into an animated Ben-Day dot field for AI and agent interfaces.

benday is distributed as open code through a shadcn registry. There is no benday npm package: the CLI copies the primitive into your project, and you own the result.

```bash
bunx shadcn@latest add @benday/benday
# or
npx shadcn@latest add @benday/benday
```

```tsx
import { Benday } from "@/components/ui/benday";

export function Example() {
  return <Benday src="/logo.svg" />;
}
```

The install adds:

```text
components/ui/benday.tsx
components/ui/benday/bake.ts
components/ui/benday/dom.ts
components/ui/benday/presets.ts
components/ui/benday/renderer.ts
components/ui/benday/types.ts
components/ui/benday/use-dot-map.ts
```

Those files are ordinary application source. Edit the presets, change the canvas renderer, remove features, or fold the implementation into your own design system.

## Registry setup

The short `@benday/benday` address works automatically after the `@benday` namespace is accepted into shadcn's public registry directory. Until then, add the namespace once:

```bash
bunx shadcn@latest registry add '@benday=https://benday.kacemmathlouthi.dev/r/{name}.json'
bunx shadcn@latest add @benday/benday
```

Or install the hosted item directly:

```bash
bunx shadcn@latest add https://benday.kacemmathlouthi.dev/r/benday.json
```

Once this repository is pushed publicly, shadcn also supports its GitHub address without namespace setup:

```bash
bunx shadcn@latest add KacemMathlouthi/benday/benday
```

The source registry catalog is [`registry.json`](./registry.json). `bun run registry:build` validates it and generates the installable payloads under `apps/web/public/r`.

## How it works

The source image is baked once into a compact dot map:

1. Rasterize SVG, PNG, JPG or WebP in a browser canvas.
2. Separate ink from the background using alpha or luminance.
3. Optionally dilate the mask to rescue thin strokes.
4. Run an exact Euclidean distance transform so every dot knows its depth inside the mark.
5. Sample coverage and depth onto a grid.
6. Animate only that dot map with the canvas renderer.

String sources are cached by URL and bake options. The renderer keeps its clock and settle spring across prop changes, stops when off-screen, follows reduced-motion preferences, and resolves `currentColor` against the canvas.

## Presets

- `shimmer`: a lit diagonal band
- `ripple`: concentric rings
- `contour`: a wave through the mark's own thickness
- `scatter`: dots leave and return to the lattice
- `flicker`: stable randomized blinking
- `breathe`: coordinated scale and opacity
- `swirl`: rotational displacement around the center

Presets are plain functions and can be replaced or edited in the installed source.

## States

`idle` and `done` render the crisp mark. `thinking` runs the selected preset. Transitions blend through a light spring, so changing to `done` pulls displaced dots back into the logo.

## Repository

```text
apps/web/src/components/ui/benday.tsx   canonical public primitive
apps/web/src/components/ui/benday/      bake and renderer implementation
apps/web/public/r/                       generated registry payloads
apps/web/                                docs and playground
registry.json                            shadcn registry source catalog
```

The docs app consumes the same `@/components/ui/benday` source that the registry installs, so its examples exercise the consumer-owned version rather than a package build.

## Development

```bash
bun install
bun run registry:build
bun run dev
```

| Script                   | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `bun run registry:build` | Validate the registry and generate `/r/*.json`   |
| `bun run dev`            | Build the registry and start the Vite playground |
| `bun run build`          | Build the registry and production site           |
| `bun run typecheck`      | Type-check the web workspace                     |
| `bun run check`          | Run formatting and lint checks                   |
| `bun run knip`           | Find unused files, exports and dependencies      |

MIT.
