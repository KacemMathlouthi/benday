import type { RenderState } from "@/playground/lib/state";

/** The smallest dot that still reads as one; below it the disc goes to smudge. */
const MIN_DOT_PX = 0.9;

/** Coarsest grid worth baking — below this a logo stops being recognisable. */
const MIN_GRID = 3;

/**
 * The largest grid still clearing {@link MIN_DOT_PX} at `size`. Dot count comes
 * from the bake, not the canvas, so small sizes need their own coarser map.
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
