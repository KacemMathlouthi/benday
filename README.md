# benday

Turn any logo into an animated dot-field thinking indicator.

Shimmering text, then dot matrices, then dot orbs. Same UI slot, all generic.
This one animates *your* mark: drop in an SVG, PNG, JPG or WebP and it comes
back as a grid of dots that breathes, ripples, scatters and settles.

> **Ben-Day dots** — the 1879 printing process that reproduced images as fields
> of small coloured dots, later lifted into fine art by Roy Lichtenstein. That is
> literally what the bake step does here.

```tsx
import { ThinkingLogo } from 'benday';

<ThinkingLogo src="/logo.svg" state="thinking" size={64} />;
```

## How it works

The image is never drawn. It is **baked** once into a small dot map, and only
that reaches the renderer:

1. **Rasterize** the source at a working resolution (SVGs rasterize cleanly at
   any scale, so there's no intermediate high-res pass).
2. **Mask** ink from background. Alpha when the image has transparency,
   luminance-vs-sampled-background otherwise — which is why flattened PNGs and
   JPEGs work here rather than becoming a solid rectangle.
3. **Dilate** (optional) to rescue hairline strokes.
4. **Distance transform** — an exact Euclidean DT (Felzenszwalb & Huttenlocher,
   O(n)) giving every pixel its true distance to the outline. This is what lets
   an animation travel *along the shape's own thickness* rather than just across
   its bounding box.
5. **Grid sample** into cells, keeping coverage `v` and depth `d` per dot.

The result is `{cols, rows, aspect, dots: [{x, y, v, d}]}` — a few KB of JSON,
serializable, and cheap enough to ship at build time.

## Two paths

**Runtime** — drop-in-any-logo, client-side, cached per (url, options):

```tsx
<ThinkingLogo src="/logo.svg" bake={{ grid: 24, dilate: 1 }} />
```

**Build time** — bake once, ship the JSON, zero canvas work at mount:

```tsx
import dots from './logo.dots.json';

<ThinkingLogo dotMap={dots} />;
```

Use the playground's `dots.json` button to produce that file today. (A proper
`npx benday logo.svg` CLI needs a headless rasterizer and is not built
yet.)

## Presets

| Preset    | What it does                                                    |
| --------- | --------------------------------------------------------------- |
| `shimmer` | A lit band sweeps the mark on the diagonal.                      |
| `ripple`  | Concentric rings pulse outward from the center.                  |
| `contour` | The wave follows the shape's own thickness — outline, then core. |
| `scatter` | Dots drift off the lattice, then reconverge into the mark.       |
| `flicker` | A random subset blinks at any moment.                            |
| `breathe` | The whole mark swells and settles.                               |
| `swirl`   | The mark twists around its center, outer dots lagging.           |

A preset is just a function, so you can pass your own:

```tsx
<ThinkingLogo
  src="/logo.svg"
  preset={(dot, t, out) => {
    out.a = 0.2 + 0.8 * ((Math.sin(t * 3 - dot.d * 6) + 1) / 2);
    out.s = 1;
  }}
/>
```

## States

`idle` → `thinking` → `done`. `thinking` runs the preset; the other two are the
crisp mark. Transitions run through a light spring, so `done` gives you the
dots snapping back into the logo.

## Props

| Prop        | Default          | Notes                                             |
| ----------- | ---------------- | ------------------------------------------------- |
| `src`       | —                | URL, data URI, `File`/`Blob`, or `HTMLImageElement`|
| `dotMap`    | —                | Pre-baked map; takes precedence over `src`         |
| `bake`      | —                | `{grid, threshold, gamma, dilate, maskMode, invert, trim}` |
| `size`      | `64`             | CSS pixels                                        |
| `fit`       | `'square'`       | `'natural'` sizes to the mark — wordmarks need it |
| `state`     | `'thinking'`     | `idle` \| `thinking` \| `done`                    |
| `preset`    | `'contour'`      | Name or your own function                         |
| `speed`     | `1`              | Multiplier                                        |
| `color`     | `'currentColor'` | Resolved off the canvas, re-resolved on theme flip|
| `dotScale`  | `0.62`           | Dot diameter as a fraction of the cell            |
| `shape`     | `'circle'`       | `circle` \| `square` \| `diamond`                 |
| `glow`      | `0`              | Halo radius                                       |
| `padding`   | `0.06`           | Inset as a fraction of the box                    |
| `weight`    | `0.5`            | How much ink coverage drives dot size             |
| `paused`    | `false`          | Freeze on the current frame                       |

## Runtime behavior

- Canvas 2D, DPR capped at 2.
- RAF gated by `IntersectionObserver` + `visibilitychange` — off-screen or
  backgrounded indicators cost nothing.
- Settled non-`thinking` marks stop requesting frames entirely.
- `prefers-reduced-motion` renders one static frame.
- `role="img"` with a per-state label.

## Tuning notes

- **Thin strokes vanish.** That is what `dilate` is for; 1–3px usually restores
  a hairline mark. Lower `threshold` alongside it.
- **Small sizes need their own bake.** At 20px a 24-dot grid produces sub-pixel
  dots. Bake a ~10-dot map for inline use — the playground shows the effective
  dot diameter and warns.
- **Wide wordmarks** want `fit="natural"`, otherwise they get letterboxed into a
  square and lose half their size.

## Playground

```bash
npm install
npm run dev
```

Drop a logo anywhere on the page. Every bake and render option is a live
control, and the sample set is deliberately nasty: a hairline burst, a wide
wordmark, an opaque no-alpha tile, and a soft-gradient blob.

## Links

- Playground & docs — https://benday.kacemmathlouthi.dev
- Repository — https://github.com/KacemMathlouthi/benday
- Issues — https://github.com/KacemMathlouthi/benday/issues

## Scripts

| Script          | Does                                     |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Playground on :5173                      |
| `npm run build` | Library → `dist/` (ESM + CJS + types)    |
| `npm run build:demo` | Playground → `dist-demo/`            |
| `npm run typecheck` | `tsc --noEmit`                       |

MIT.
