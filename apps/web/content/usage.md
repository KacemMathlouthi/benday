# Usage: install and API reference

benday is distributed through the shadcn registry, not npm. The CLI copies the component into your project; there is no runtime dependency and no package to upgrade behind your back.

## Install

```bash
bunx shadcn@latest add @benday/benday
```

`@benday` is a namespace in shadcn's registry directory, so nothing has to be added to `components.json`. Seven files land under your UI directory: `benday.tsx` plus `benday/{bake,renderer,presets,dom,types,use-dot-map}.ts`. Only React is imported by any of them.

## Basic use

```tsx
import { Benday } from "@/components/ui/benday";

export function ThinkingIndicator({ busy }: { busy: boolean }) {
  return (
    <Benday src="/logo.svg" state={busy ? "thinking" : "done"} size={24} />
  );
}
```

`state` is the whole control surface: `thinking` runs the preset, while `idle` and `done` settle the dots back into the crisp mark through a spring. Changing props never restarts the animation, because the renderer is imperative and outlives React's render cycle.

## Bake at build time

Baking goes through a canvas, so it is browser-only and costs a few milliseconds on first paint. To skip it, run the bake once at build time and ship the result:

```ts
import { bake } from "@/components/ui/benday";

const dotMap = await bake("/logo.svg", { grid: 28 });
// write dotMap to JSON, import it, and pass it as `dotMap`
```

```tsx
<Benday dotMap={dotMap} state="thinking" />
```

`dotMap` takes precedence over `src`, and is plain JSON.

## Bake options

Passed as the `bake` prop, or as the second argument to `bake()`.

- `grid` (default `24`): dots across the longest side of the trimmed logo.
- `threshold` (default `0.18`): cell coverage required to emit a dot at all.
- `gamma` (default `1`): gamma on coverage before thresholding; below 1 boosts faint ink.
- `dilate` (default `0`): grow the mask by N working pixels. The rescue knob for hairline strokes.
- `maskMode` (default `'auto'`): `alpha`, `luma`, or `auto`, which picks alpha when the source has soft pixels.
- `invert` (default `false`): treat the luminance mask as inverted, for light ink on a dark background. Luma mode only.
- `trim` (default `true`): trim to the mask's bounding box before gridding.

## Props

{{props}}

## Presets

{{presets}}

Pass a name, or your own function, to `preset`:

```tsx
const pulse: Preset = (dot, t, out) => {
  const g = (Math.sin(t * 2 - dot.r * 5) + 1) / 2;
  out.a = 0.2 + 0.8 * g;
  out.s = 0.8 + 0.4 * g;
  out.dx = 0;
  out.dy = 0;
};

<Benday src="/logo.svg" preset={pulse} />;
```

A preset receives one dot's context (normalized position, radius, angle, ink coverage, tone, depth inside the shape, a stable random value) plus the clock, and writes a scale, an alpha and an offset in cell units into `out`. It runs once per dot per frame, so it writes into the reused object rather than allocating.

## Small sizes

A 16 to 20px indicator is the case the pipeline is tuned around. Below 32px the renderer adds optical weight, damps motion, snaps the lattice onto the device pixel grid, and consolidates cells that would fall under two CSS pixels. Check changes at the size you ship, not at 128px.

## Accessibility and cost

The canvas carries `role="img"` and an `aria-label` reflecting the state, which you can override. `prefers-reduced-motion` is followed by default: the mark shows, the motion does not. Painting stops when the element scrolls off-screen or the tab is hidden, so an idle indicator costs nothing.

## Where to go next

- [Playground](/playground.md): tune the bake and the motion on your own logo
- [Home](/index.md): what benday is and how the pipeline works
- Registry payload: <https://benday.kacemmathlouthi.dev/r/registry.json>
