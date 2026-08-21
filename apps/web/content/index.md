# benday: your logo, halftoned into a thinking indicator

benday turns any logo into an animated field of Ben-Day dots and uses it as the "thinking" indicator in an AI or agent interface. Instead of a generic spinner, the wait is your own mark, breathing and rippling and settling back into itself when the work is done.

It ships as an open-code [shadcn registry](https://ui.shadcn.com/docs/cli) component: the CLI copies seven TypeScript files into your project and they belong to you from that point on. React is the only import, there is no package to depend on, and nothing has to be added to `components.json`.

## Install

```bash
bunx shadcn@latest add @benday/benday
```

```tsx
import { Benday } from "@/components/ui/benday";

<Benday src="/logo.svg" state={isThinking ? "thinking" : "done"} />;
```

`thinking` runs the animation. `idle` and `done` show the crisp mark, and the dots spring back into it.

## How it works

The image is rasterized once and its ink separated from its background: by alpha when the source has soft edges, otherwise by a luminance mask read off the corners. A second pass preserves the artwork's own tonal layers. A Euclidean distance transform gives every pixel its depth inside the shape, and the result is grid-sampled into a **dot map**: a few hundred dots carrying position, ink coverage, tone and depth.

That dot map is all the renderer animates. It is small and JSON-serializable on purpose: bake it at build time, pass `dotMap` instead of `src`, and the client does none of the above.

The renderer resolves `currentColor` against the canvas and re-resolves it on a theme change, stops painting off-screen or in a hidden tab, honours `prefers-reduced-motion`, and trades motion for optical weight below 32 pixels so a favicon-sized mark stays legible.

## Presets

{{presets}}

A preset is a pure function of one dot and the clock, so writing your own is a dozen lines: pass a function to `preset` instead of a name.

## Where to go next

- [Usage and API reference](/usage.md): install, bake options, every prop
- [Playground](/playground.md): drop a logo in and tune it live
- [About the project](/about.md): what it is, who maintains it, the license
