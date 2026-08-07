/** A single dot sampled out of the source image. */
export interface Dot {
  /** Grid column. */
  col: number;
  /** Grid row. */
  row: number;
  /** Cell-center x, normalized 0..1 across the trimmed content box. */
  x: number;
  /** Cell-center y, normalized 0..1 across the trimmed content box. */
  y: number;
  /** Ink coverage of the cell, 0..1 (post-gamma). Drives dot size/alpha weighting. */
  v: number;
  /** Depth inside the shape, 0 at the outline → 1 at the thickest point (from the EDT). */
  d: number;
}

/**
 * The baked representation of a logo: a grid of dots plus the geometry needed
 * to lay them out. This is the only thing the renderer needs — it is small,
 * JSON-serializable, and can be produced at build time.
 */
export interface DotMap {
  /** Grid columns across the trimmed content box. */
  cols: number;
  /** Grid rows across the trimmed content box. */
  rows: number;
  /** width / height of the trimmed content box. */
  aspect: number;
  /** The dots that cleared the coverage threshold. */
  dots: Dot[];
  /** How many grid cells were tested (cols * rows) — useful for tuning feedback. */
  cells: number;
  /** Which masking strategy actually ran. */
  maskMode: "alpha" | "luma";
}

export type MaskMode = "auto" | "alpha" | "luma";

export interface BakeOptions {
  /** Dots across the longest side of the trimmed logo. @default 24 */
  grid?: number;
  /** Cell coverage required to emit a dot, 0..1. @default 0.18 */
  threshold?: number;
  /** Gamma applied to coverage before thresholding. <1 boosts faint ink. @default 1 */
  gamma?: number;
  /**
   * How to separate ink from background.
   * `auto` uses alpha when the image has any transparency, luminance otherwise.
   * @default 'auto'
   */
  maskMode?: MaskMode;
  /** Treat the luminance mask as inverted (light ink on dark). Only used in luma mode. */
  invert?: boolean;
  /**
   * Grow the mask by this many working-resolution pixels before sampling.
   * The rescue knob for hairline strokes and thin wordmarks. @default 0
   */
  dilate?: number;
  /** Trim to the mask's bounding box before gridding. @default true */
  trim?: boolean;
  /** Resolution the mask is computed at, longest side. @default auto from grid */
  workingSize?: number;
}

export type ResolvedBakeOptions = Required<Omit<BakeOptions, "workingSize">> & {
  workingSize: number;
};

/** Per-dot input handed to an animation preset each frame. */
export interface DotContext {
  /** Index in the dot list. */
  i: number;
  /** Total dot count. */
  n: number;
  /** Normalized position, 0..1. */
  x: number;
  y: number;
  /** Normalized position relative to the mark's center, roughly -1..1. */
  nx: number;
  ny: number;
  /** Radial distance from center, normalized so the corner is ~1. */
  r: number;
  /** Angle from center, -PI..PI. */
  angle: number;
  /** Ink coverage, 0..1. */
  v: number;
  /** Depth inside the shape, 0 at the outline → 1 at the core. */
  d: number;
  /** Stable pseudo-random value for this dot, 0..1. */
  rand: number;
  /** Grid dimensions, so offsets can be reasoned about in cell units. */
  cols: number;
  rows: number;
}

/** What a preset produces for one dot on one frame. */
export interface DotFrame {
  /** Radius multiplier. */
  s: number;
  /** Alpha, 0..1. */
  a: number;
  /** Offset in cell units (1 = one grid cell). */
  dx: number;
  dy: number;
}

export type Preset = (c: DotContext, t: number, out: DotFrame) => void;

export type PresetName =
  | "shimmer"
  | "ripple"
  | "contour"
  | "scatter"
  | "flicker"
  | "breathe"
  | "swirl";

export type ThinkingState = "idle" | "thinking" | "done";

export type DotShape = "circle" | "square" | "diamond";

export type Fit = "square" | "natural";

/** Everything the renderer needs to paint a frame. */
export interface RendererOptions {
  /** The baked map to draw. `null` paints nothing. */
  dotMap?: DotMap | null;
  /** Preset name, or your own per-dot function. @default 'contour' */
  preset?: PresetName | Preset;
  /** @default 'thinking' */
  state?: ThinkingState;
  /** Rendered size in CSS pixels. @default 64 */
  size?: number;
  /**
   * `square` keeps a size×size box and fits the mark inside. `natural` sizes
   * the canvas to the mark's aspect ratio, which wide wordmarks need.
   * @default 'square'
   */
  fit?: Fit;
  /** Animation speed multiplier. @default 1 */
  speed?: number;
  /** Dot color. `currentColor` resolves against the canvas. @default 'currentColor' */
  color?: string;
  /** Dot diameter as a fraction of the grid cell. @default 0.62 */
  dotScale?: number;
  /** @default 'circle' */
  shape?: DotShape;
  /** Glow radius as a fraction of the dot size, 0 disables. @default 0 */
  glow?: number;
  /** Inset around the mark as a fraction of the box. @default 0.06 */
  padding?: number;
  /** How strongly ink coverage drives per-dot size and alpha, 0..1. @default 0.5 */
  weight?: number;
  /** Freeze on the current frame. @default false */
  paused?: boolean;
  /**
   * `auto` follows the `prefers-reduced-motion` media query and re-checks it
   * live. `true`/`false` pin the behavior. @default 'auto'
   */
  reducedMotion?: boolean | "auto";
}

export type ResolvedRendererOptions = Required<
  Omit<RendererOptions, "dotMap">
> & {
  dotMap: DotMap | null;
};

/**
 * A live canvas painter. Created once per canvas; feed it new options with
 * {@link Renderer.update} rather than recreating it, so the animation clock and
 * settle spring survive prop changes.
 */
export interface Renderer {
  /** Merge new options in and repaint. Unspecified keys keep their value. */
  update: (next: RendererOptions) => void;
  /** The currently applied options. */
  readonly options: Readonly<ResolvedRendererOptions>;
  /** Canvas CSS height for the current options. */
  readonly height: number;
  /** Tear down observers and cancel any pending frame. */
  destroy: () => void;
}
