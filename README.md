# benday

Turn any logo into an animated Ben-Day dot field for AI and agent interfaces.

benday is distributed as open code through a shadcn registry. There is no benday npm package: the CLI copies the primitive into your project, and you own the result.

```bash
bunx shadcn@latest add https://benday.kacemmathlouthi.dev/r/benday.json
# or
npx shadcn@latest add https://benday.kacemmathlouthi.dev/r/benday.json
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

The URL above needs no setup. Namespaces in shadcn are decentralized — nobody has to approve one — so registering `@benday` in your own project is a one-time command and the short address works immediately:

```bash
bunx shadcn@latest registry add '@benday=https://benday.kacemmathlouthi.dev/r/{name}.json'
bunx shadcn@latest add @benday/benday
```

That writes a `registries` entry into your `components.json`; you can also add it by hand:

```json
{
  "registries": {
    "@benday": "https://benday.kacemmathlouthi.dev/r/{name}.json"
  }
}
```

shadcn also resolves the GitHub address without any namespace setup:

```bash
bunx shadcn@latest add KacemMathlouthi/benday/benday
```

Listing `@benday` in [shadcn's public registry directory](https://ui.shadcn.com/r/registries.json) is a separate, optional step. It only affects discovery through `shadcn search` — installing never depends on it.

The source catalog is [`registry.json`](./registry.json). `bun run registry:build` validates it and writes the installable payloads to `apps/web/public/r`.

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
registry/ui/benday.tsx    the primitive, and the public exports
registry/ui/benday/       bake, renderer, presets, React binding
registry.json             shadcn registry source catalog
apps/web/                 docs site and playground
apps/web/public/r/        generated registry payloads
```

`registry/` mirrors the tree the CLI installs, so the relative imports between those files are the same ones a consumer ends up with. The docs app imports them through the `@registry/*` alias rather than keeping a copy, so every example on the site exercises exactly what ships.

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
