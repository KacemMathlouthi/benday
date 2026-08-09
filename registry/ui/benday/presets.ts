import type { DotFrame, Preset, PresetName } from "./types";

const TAU = Math.PI * 2;
const fract = (v: number) => v - Math.floor(v);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Signed wrapped difference in a 0..1 cyclic space, -0.5..0.5. */
const cyclicDelta = (v: number) => {
  const d = fract(v);
  return d > 0.5 ? d - 1 : d;
};

const gauss = (d: number, sigma: number) =>
  Math.exp(-(d * d) / (2 * sigma * sigma));

function smoothstep(edge0: number, edge1: number, value: number): number {
  const x = clamp01((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43_758.5453;
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

/* Each preset writes into a reused `out` — it runs once per dot per frame, so
   allocating there would churn the heap at 60fps × 500 dots. */

/** A lit band sweeps the mark on the diagonal — the shimmer-text idiom, in dots. */
const shimmer: Preset = (c, t, out) => {
  const u = c.x * 0.72 + c.y * 0.28;
  const phase = cyclicDelta(u - t * 0.42);
  const g = gauss(phase, 0.11);
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

/** A wave travels along the shape's own thickness: outline first, core last. */
const contour: Preset = (c, t, out) => {
  const w = (Math.sin(t * 2.2 - c.d * 6.5) + 1) / 2;
  const g = w ** 1.6;
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

/** A random subset of dots blinks at any moment. */
const flicker: Preset = (c, t, out) => {
  const phase = fract(t * 0.7 + c.rand);
  const g = phase < 0.3 ? Math.sin((phase / 0.3) * Math.PI) : 0;
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
  const rotation = 0.45 * Math.sin(t * 1.3 - c.r * 2.4);
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const rx = c.nx * cos - c.ny * sin;
  const ry = c.nx * sin + c.ny * cos;
  out.dx = (rx - c.nx) * (c.cols / 2);
  out.dy = (ry - c.ny) * (c.rows / 2);
  const swing = Math.abs(rotation) / 0.45;
  out.a = 0.55 + 0.45 * (1 - swing);
  out.s = 0.9 + 0.15 * (1 - swing);
};

/** A narrow vertical beam traverses the complete silhouette. */
const scan: Preset = (c, t, out) => {
  const phase = cyclicDelta(c.x - t * 0.34);
  const g = gauss(phase, 0.075);
  out.a = 0.2 + 0.8 * g;
  out.s = 0.76 + 0.42 * g;
  out.dx = 0;
  out.dy = 0;
};

/** One long signal follows the baked lattice in row-wise serpentine order. */
const cascade: Preset = (c, t, out) => {
  const row = Math.min(c.rows - 1, Math.floor(c.y * c.rows));
  const across = row % 2 === 0 ? c.x : 1 - c.x;
  const path = (row + across) / c.rows;
  const phase = cyclicDelta(path - t * 0.24);
  const g = gauss(phase, 0.055);
  out.a = 0.16 + 0.84 * g;
  out.s = 0.72 + 0.5 * g;
  out.dx = 0;
  out.dy = 0;
};

/** A soft energy point circles the center without rotating the logo itself. */
const orbit: Preset = (c, t, out) => {
  const angle = t * 1.25;
  const ox = Math.cos(angle) * 0.62;
  const oy = Math.sin(angle) * 0.62;
  const distance = Math.hypot(c.nx - ox, c.ny - oy);
  const g = gauss(distance, 0.3);
  out.a = 0.2 + 0.8 * g;
  out.s = 0.76 + 0.44 * g;
  out.dx = 0;
  out.dy = 0;
};

/** A bright head and tapered tail chase clockwise around the mark. */
const comet: Preset = (c, t, out) => {
  const angle = fract(c.angle / TAU);
  const behind = fract(t * 0.2 - angle);
  const trail = Math.exp(-behind * 7);
  const ring = 0.35 + 0.65 * smoothstep(0.12, 0.72, c.r);
  const g = trail * ring;
  out.a = 0.18 + 0.82 * g;
  out.s = 0.75 + 0.48 * g;
  out.dx = -c.ny * g * 0.26;
  out.dy = c.nx * g * 0.26;
};

/** A rotating search beam crosses the full logo with a soft angular wake. */
const radar: Preset = (c, t, out) => {
  const angle = fract(c.angle / TAU);
  const head = fract(t * 0.16);
  const delta = cyclicDelta(angle - head);
  const beam = gauss(delta, 0.045);
  const wake = delta < 0 ? Math.exp(delta * 8) * 0.42 : 0;
  const g = Math.max(beam, wake) * (0.72 + c.r * 0.28);
  out.a = 0.18 + 0.82 * g;
  out.s = 0.76 + 0.42 * g;
  out.dx = 0;
  out.dy = 0;
};

/** Three curved blades rotate through the mark around a steady core. */
const pinwheel: Preset = (c, t, out) => {
  const wave = (Math.sin(c.angle * 3 - t * 2.1 - c.r * 3.4) + 1) / 2;
  const g = wave ** 2.2;
  const core = gauss(c.r, 0.18);
  out.a = 0.18 + 0.82 * Math.max(g, core);
  out.s = 0.76 + 0.4 * Math.max(g, core);
  out.dx = 0;
  out.dy = 0;
};

/** A soft traveling current bends the lattice without breaking the silhouette. */
const wave: Preset = (c, t, out) => {
  const phase = t * 1.7 - c.y * 6.2;
  const crest = (Math.sin(phase) + 1) / 2;
  const sway = Math.sin(phase) * (0.28 + c.r * 0.42);
  out.a = 0.46 + 0.54 * crest;
  out.s = 0.86 + 0.24 * crest;
  out.dx = sway;
  out.dy = Math.cos(phase - c.x * 1.4) * 0.08;
};

/** Independent column levels rise and fall like a restrained spectrum display. */
const equalizer: Preset = (c, t, out) => {
  const col = Math.min(c.cols - 1, Math.floor(c.x * c.cols));
  const phase = t * 1.85 + col * 0.73 + hash2(col, 4.2) * 1.4;
  const level = 0.2 + 0.75 * ((Math.sin(phase) + 1) / 2);
  const g = 1 - smoothstep(level - 0.08, level + 0.08, Math.abs(c.ny));
  out.a = 0.18 + 0.82 * g;
  out.s = 0.76 + 0.4 * g;
  out.dx = 0;
  out.dy = 0;
};

/** Counter-moving diagonal bands cross and briefly brighten where they meet. */
const weave: Preset = (c, t, out) => {
  const a = gauss(cyclicDelta(c.x * 0.62 + c.y * 0.38 - t * 0.3), 0.08);
  const b = gauss(cyclicDelta(c.x * 0.62 - c.y * 0.38 + t * 0.24), 0.08);
  const g = clamp01(Math.max(a, b, Math.min(a, b) * 1.25));
  out.a = 0.18 + 0.82 * g;
  out.s = 0.76 + 0.44 * g;
  out.dx = 0;
  out.dy = 0;
};

/** Emphasis hands off between north, east, south and west. */
const beacon: Preset = (c, t, out) => {
  let sector = 0;
  if (Math.abs(c.nx) > Math.abs(c.ny)) {
    sector = c.nx > 0 ? 0.25 : 0.75;
  } else if (c.ny > 0) {
    sector = 0.5;
  }
  const phase = cyclicDelta(sector - t * 0.28);
  const g = gauss(phase, 0.1) * (0.55 + c.r * 0.45);
  out.a = 0.2 + 0.8 * g;
  out.s = 0.78 + 0.4 * g;
  out.dx = 0;
  out.dy = 0;
};

/** Brief horizontal faults disturb a few rows, then snap cleanly home. */
const glitch: Preset = (c, t, out) => {
  const row = Math.min(c.rows - 1, Math.floor(c.y * c.rows));
  const cycle = Math.floor(t * 0.48 + 0.5);
  const burst = gauss(cyclicDelta(t * 0.48), 0.055);
  const slice = hash2(row, cycle);
  const active = slice > 0.58 ? burst : 0;
  out.a = 1 - active * 0.34;
  out.s = 1 - active * 0.12;
  out.dx = (slice - 0.5) * 3.2 * active;
  out.dy = 0;
};

/** Offset droplets descend each column with soft tails. */
const rain: Preset = (c, t, out) => {
  const col = Math.min(c.cols - 1, Math.floor(c.x * c.cols));
  const head = fract(t * 0.34 + hash2(col, 8.1));
  const delta = cyclicDelta(c.y - head);
  const trail = delta < 0 ? Math.exp(delta * 6) : Math.exp(-delta * 18);
  out.a = 0.16 + 0.84 * trail;
  out.s = 0.74 + 0.44 * trail;
  out.dx = 0;
  out.dy = trail * 0.18;
};

/** The field is pulled toward its center and released without losing its shape. */
const magnetic: Preset = (c, t, out) => {
  const pull = 0.5 - 0.5 * Math.cos(t * 1.15);
  const strength = pull * (0.35 + c.r * 0.65);
  out.dx = -c.nx * c.cols * 0.12 * strength;
  out.dy = -c.ny * c.rows * 0.12 * strength;
  out.a = 1 - pull * 0.28;
  out.s = 1 - pull * 0.2;
};

/** Dots assemble in a stable random order, hold, then dissolve to begin again. */
const resolve: Preset = (c, t, out) => {
  const progress = 0.5 - 0.5 * Math.cos(t * 1.08);
  const g = smoothstep(c.rand - 0.12, c.rand + 0.12, progress);
  out.a = 0.14 + 0.86 * g;
  out.s = 0.66 + 0.34 * g;
  out.dx = c.nx * (1 - g) * 0.38;
  out.dy = c.ny * (1 - g) * 0.38;
};

export type PresetFamily =
  | "Signature"
  | "Sweep"
  | "Orbit"
  | "Field"
  | "Transform";

export interface PresetDefinition {
  name: PresetName;
  label: string;
  description: string;
  family: PresetFamily;
  fn: Preset;
}

export const PRESET_FAMILIES: PresetFamily[] = [
  "Signature",
  "Sweep",
  "Orbit",
  "Field",
  "Transform",
];

export const PRESETS: Record<PresetName, PresetDefinition> = {
  beacon: {
    description: "Emphasis hands off between the four cardinal directions.",
    family: "Orbit",
    fn: beacon,
    label: "Beacon",
    name: "beacon",
  },
  breathe: {
    description: "The whole mark swells and settles with a soft edge delay.",
    family: "Signature",
    fn: breathe,
    label: "Breathe",
    name: "breathe",
  },
  cascade: {
    description: "One signal follows the lattice in serpentine order.",
    family: "Sweep",
    fn: cascade,
    label: "Cascade",
    name: "cascade",
  },
  comet: {
    description: "A bright head and tapered tail chase around the mark.",
    family: "Orbit",
    fn: comet,
    label: "Comet",
    name: "comet",
  },
  contour: {
    description: "A wave follows the mark’s thickness from outline to core.",
    family: "Signature",
    fn: contour,
    label: "Contour",
    name: "contour",
  },
  equalizer: {
    description: "Independent column levels rise and fall like a spectrum.",
    family: "Field",
    fn: equalizer,
    label: "Equalizer",
    name: "equalizer",
  },
  flicker: {
    description: "A stable random subset of dots blinks at any moment.",
    family: "Field",
    fn: flicker,
    label: "Flicker",
    name: "flicker",
  },
  glitch: {
    description: "Brief horizontal faults disturb a few rows, then clear.",
    family: "Transform",
    fn: glitch,
    label: "Glitch",
    name: "glitch",
  },
  magnetic: {
    description: "The field pulls toward its center and releases.",
    family: "Transform",
    fn: magnetic,
    label: "Magnetic",
    name: "magnetic",
  },
  orbit: {
    description: "A soft energy point circles the center of the mark.",
    family: "Orbit",
    fn: orbit,
    label: "Orbit",
    name: "orbit",
  },
  pinwheel: {
    description: "Three curved blades rotate around a steady core.",
    family: "Orbit",
    fn: pinwheel,
    label: "Pinwheel",
    name: "pinwheel",
  },
  radar: {
    description: "A rotating search beam crosses the logo with a soft wake.",
    family: "Orbit",
    fn: radar,
    label: "Radar",
    name: "radar",
  },
  rain: {
    description: "Offset droplets descend each column with soft tails.",
    family: "Sweep",
    fn: rain,
    label: "Rain",
    name: "rain",
  },
  resolve: {
    description: "Dots assemble in stable random order, then dissolve.",
    family: "Field",
    fn: resolve,
    label: "Resolve",
    name: "resolve",
  },
  ripple: {
    description: "Concentric rings pulse outward from the center.",
    family: "Signature",
    fn: ripple,
    label: "Ripple",
    name: "ripple",
  },
  scan: {
    description: "A narrow vertical beam traverses the silhouette.",
    family: "Sweep",
    fn: scan,
    label: "Scan",
    name: "scan",
  },
  scatter: {
    description: "Dots drift off the lattice, then reconverge into the mark.",
    family: "Transform",
    fn: scatter,
    label: "Scatter",
    name: "scatter",
  },
  shimmer: {
    description: "A lit band sweeps across the mark on the diagonal.",
    family: "Signature",
    fn: shimmer,
    label: "Shimmer",
    name: "shimmer",
  },
  swirl: {
    description: "The mark twists around its center, with outer dots lagging.",
    family: "Orbit",
    fn: swirl,
    label: "Swirl",
    name: "swirl",
  },
  wave: {
    description: "A soft traveling current bends the dot lattice.",
    family: "Field",
    fn: wave,
    label: "Wave",
    name: "wave",
  },
  weave: {
    description: "Counter-moving diagonal bands cross through the mark.",
    family: "Sweep",
    fn: weave,
    label: "Weave",
    name: "weave",
  },
};

/** Curated gallery order: approachable signatures before more expressive motion. */
export const PRESET_NAMES: PresetName[] = [
  "contour",
  "shimmer",
  "ripple",
  "breathe",
  "scan",
  "cascade",
  "weave",
  "rain",
  "swirl",
  "orbit",
  "comet",
  "radar",
  "pinwheel",
  "beacon",
  "flicker",
  "wave",
  "equalizer",
  "resolve",
  "scatter",
  "magnetic",
  "glitch",
];

/** Per-dot randomness that stays stable across frames. */
export function dotRandom(i: number): number {
  return hash2(i * 0.371, i * 0.917 + 3.14);
}

export function makeFrame(): DotFrame {
  return { a: 1, dx: 0, dy: 0, s: 1 };
}
