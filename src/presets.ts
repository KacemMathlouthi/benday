import type { DotContext, DotFrame, Preset, PresetName } from './types';

/* ------------------------------------------------------------------ *
 * Small math helpers
 * ------------------------------------------------------------------ */

const TAU = Math.PI * 2;
const fract = (v: number) => v - Math.floor(v);
/** Signed wrapped difference in a 0..1 cyclic space, -0.5..0.5. */
const cyclicDelta = (v: number) => {
  const d = fract(v);
  return d > 0.5 ? d - 1 : d;
};
const gauss = (d: number, sigma: number) => Math.exp(-(d * d) / (2 * sigma * sigma));

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Smoothed 2D value noise, 0..1. */
function noise2(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  let fx = x - xi;
  let fy = y - yi;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/* ------------------------------------------------------------------ *
 * Presets
 *
 * Each writes into a reused `out` object — a preset runs once per dot per
 * frame, so allocating there would churn the heap at 60fps × 500 dots.
 * ------------------------------------------------------------------ */

/** A lit band sweeps the mark on the diagonal — the shimmer-text idiom, in dots. */
const shimmer: Preset = (c, t, out) => {
  const u = c.x * 0.72 + c.y * 0.28;
  const g = gauss(cyclicDelta(u - t * 0.42), 0.11);
  out.a = 0.2 + 0.8 * g;
  out.s = 0.8 + 0.4 * g;
  out.dx = 0;
  out.dy = 0;
};

/** Concentric rings pulse outward from the mark's center. */
const ripple: Preset = (c, t, out) => {
  const w = (Math.sin(t * 2.4 - c.r * 7) + 1) / 2;
  const g = w * w;
  out.a = 0.18 + 0.82 * g;
  out.s = 0.76 + 0.42 * g;
  out.dx = 0;
  out.dy = 0;
};

/**
 * The wave travels along the shape's own thickness — outline first, core last.
 * This one is only possible because the bake ships a distance field.
 */
const contour: Preset = (c, t, out) => {
  const w = (Math.sin(t * 2.2 - c.d * 6.5) + 1) / 2;
  const g = Math.pow(w, 1.6);
  out.a = 0.16 + 0.84 * g;
  out.s = 0.7 + 0.55 * g;
  out.dx = 0;
  out.dy = 0;
};

/** Dots drift off the lattice on a noise field, then reconverge into the mark. */
const scatter: Preset = (c, t, out) => {
  const spread = 0.5 - 0.5 * Math.cos(t * 0.85);
  const amp = spread * 2.4;
  const nx = noise2(c.x * 3.1 + t * 0.22, c.y * 3.1) * 2 - 1;
  const ny = noise2(c.x * 3.1 + 17.3, c.y * 3.1 - t * 0.22) * 2 - 1;
  const jitter = (c.rand - 0.5) * 0.6 * spread;
  out.dx = nx * amp + jitter;
  out.dy = ny * amp - jitter;
  out.a = 1 - 0.5 * spread;
  out.s = 1 - 0.28 * spread;
};

/** A random subset of dots blinks at any moment — the dot-matrix idiom. */
const flicker: Preset = (c, t, out) => {
  const ph = fract(t * 0.7 + c.rand);
  const g = ph < 0.3 ? Math.sin((ph / 0.3) * Math.PI) : 0;
  out.a = 0.14 + 0.86 * g;
  out.s = 0.82 + 0.34 * g;
  out.dx = 0;
  out.dy = 0;
};

/** The whole mark swells and settles, with a slight delay toward the edges. */
const breathe: Preset = (c, t, out) => {
  const g = (Math.sin(t * 1.5 - c.r * 1.1) + 1) / 2;
  out.a = 0.42 + 0.58 * g;
  out.s = 0.86 + 0.24 * g;
  out.dx = 0;
  out.dy = 0;
};

/** The mark twists around its center, outer dots lagging the inner ones. */
const swirl: Preset = (c, t, out) => {
  const rot = 0.45 * Math.sin(t * 1.3 - c.r * 2.4);
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const rx = c.nx * cos - c.ny * sin;
  const ry = c.nx * sin + c.ny * cos;
  // nx/ny span -1..1 across the mark, so one unit is half the grid.
  out.dx = (rx - c.nx) * (c.cols / 2);
  out.dy = (ry - c.ny) * (c.rows / 2);
  const swing = Math.abs(rot) / 0.45;
  out.a = 0.55 + 0.45 * (1 - swing);
  out.s = 0.9 + 0.15 * (1 - swing);
};

export interface PresetDefinition {
  name: PresetName;
  label: string;
  description: string;
  fn: Preset;
}

export const PRESETS: Record<PresetName, PresetDefinition> = {
  shimmer: {
    name: 'shimmer',
    label: 'Shimmer',
    description: 'A lit band sweeps the mark on the diagonal.',
    fn: shimmer,
  },
  ripple: {
    name: 'ripple',
    label: 'Ripple',
    description: 'Concentric rings pulse outward from the center.',
    fn: ripple,
  },
  contour: {
    name: 'contour',
    label: 'Contour',
    description: 'The wave follows the shape’s own thickness — outline first, core last.',
    fn: contour,
  },
  scatter: {
    name: 'scatter',
    label: 'Scatter',
    description: 'Dots drift off the lattice, then reconverge into the mark.',
    fn: scatter,
  },
  flicker: {
    name: 'flicker',
    label: 'Flicker',
    description: 'A random subset blinks at any moment.',
    fn: flicker,
  },
  breathe: {
    name: 'breathe',
    label: 'Breathe',
    description: 'The whole mark swells and settles.',
    fn: breathe,
  },
  swirl: {
    name: 'swirl',
    label: 'Swirl',
    description: 'The mark twists around its center, outer dots lagging.',
    fn: swirl,
  },
};

export const PRESET_NAMES = Object.keys(PRESETS) as PresetName[];

/** Per-dot randomness that stays stable across frames. */
export function dotRandom(i: number): number {
  return hash2(i * 0.371, i * 0.917 + 3.14);
}

export function makeFrame(): DotFrame {
  return { s: 1, a: 1, dx: 0, dy: 0 };
}

export { TAU };
export type { DotContext };
