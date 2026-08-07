import type { RenderState } from "@/playground/lib/state";

/**
 * The smallest dot that still reads as a dot, in CSS pixels. Below roughly this
 * the canvas antialiases the disc into a grey smudge and the mark turns to fuzz.
 */
const MIN_DOT_PX = 0.5;

/** Coarsest grid worth baking — below this a logo stops being recognisable. */
const MIN_GRID = 3;

/**
 * The largest grid whose dots still clear {@link MIN_DOT_PX} at `size`.
 *
 * Dot count is fixed by the bake, not by the canvas, so a 24-dot map drawn at
 * 20px puts ~0.45px of ink in each cell no matter how many device pixels back
 * it. Rendering small sharply means baking a second, coarser map — this is the
 * grid to bake it at. It only ever coarsens: `maxGrid` is the ceiling.
 */
export function gridForSize(
  size: number,
  render: RenderState,
  maxGrid: number
): number {
  const usable = size * (1 - render.padding * 2) * render.dotScale;
  const fits = Math.floor(usable / MIN_DOT_PX);
  return Math.max(MIN_GRID, Math.min(maxGrid, fits));
}
