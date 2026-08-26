import type { DotShape, MaskMode, PresetName } from "@registry/ui/benday";

/** Everything that feeds the bake step. */
export interface BakeState {
  grid: number;
  threshold: number;
  gamma: number;
  dilate: number;
  maskMode: MaskMode;
  invert: boolean;
  trim: boolean;
}

/**
 * Everything that feeds the renderer. No `state` or `paused`: thinking is the
 * only state worth tuning against, so the playground always previews it.
 */
export interface RenderState {
  preset: PresetName;
  size: number;
  fitNatural: boolean;
  speed: number;
  dotScale: number;
  shape: DotShape;
  glow: number;
  weight: number;
  padding: number;
  color: string;
}

export const DEFAULT_BAKE_STATE: BakeState = {
  dilate: 0,
  gamma: 1,
  grid: 24,
  invert: false,
  maskMode: "auto",
  threshold: 0.18,
  trim: true,
};

export const DEFAULT_RENDER_STATE: RenderState = {
  color: "currentColor",
  dotScale: 1,
  fitNatural: false,
  glow: 0,
  padding: 0.06,
  preset: "shimmer",
  shape: "circle",
  size: 256,
  speed: 1,
  weight: 1,
};

/** Merge a partial update into a state slice. */
export type Patch<T> = (patch: Partial<T>) => void;
