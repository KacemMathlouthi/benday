import { devicePixelRatioCapped } from "@registry/ui/benday/dom";

import type { RenderState } from "@/playground/lib/state";

/** The renderer's own lattice floor, in device pixels. Baking finer only to consolidate wastes it. */
const MIN_CELL_DEVICE_PX = 2;

/** Coarsest grid worth baking — below this a logo stops being recognisable. */
const MIN_GRID = 3;

/**
 * The largest grid `size` can resolve. Dot count comes from the bake, not the
 * canvas, so small sizes need their own coarser map. The limit is the cell
 * pitch the backing store can hold, not the dot drawn inside it.
 */
export function gridForSize(
  size: number,
  render: RenderState,
  maxGrid: number
): number {
  const usable = size * (1 - render.padding * 2) * devicePixelRatioCapped();
  const fits = Math.floor(usable / MIN_CELL_DEVICE_PX);
  return Math.max(MIN_GRID, Math.min(maxGrid, fits));
}
