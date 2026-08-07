---
"benday": minor
---

Split the package into a framework-agnostic core and a React entry.

`benday` now exports `bake()` and `createRenderer()` with no React dependency; the component moved to `benday/react`. The renderer owns the animation clock, the settle spring, theme resolution, reduced-motion and visibility gating, so prop changes flow through `renderer.update()` instead of tearing down and recreating the loop.

The package is ESM only.
