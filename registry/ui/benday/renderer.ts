import {
  devicePixelRatioCapped,
  prefersReducedMotion,
  resolveInk,
  watchPaintability,
  watchReducedMotion,
  watchTheme,
} from "./dom";
import { PRESETS, dotRandom } from "./presets";
import type {
  DotContext,
  DotFrame,
  DotMap,
  DotShape,
  Preset,
  Renderer,
  RendererOptions,
  ResolvedRendererOptions,
} from "./types";

export const DEFAULT_RENDERER_OPTIONS: ResolvedRendererOptions = {
  color: "currentColor",
  dotMap: null,
  dotScale: 0.62,
  fit: "square",
  glow: 0,
  padding: 0.06,
  paused: false,
  preset: "contour",
  reducedMotion: "auto",
  shape: "circle",
  size: 64,
  speed: 1,
  state: "thinking",
  weight: 0.5,
};

/** Light spring for the thinking ↔ crisp transition. Slightly under-damped. */
const STIFFNESS = 140;
const DAMPING = 20;
const MAX_TIMESTEP = 0.05;
/** Below this the lattice is subpixel haze. In device pixels: that is where dots resolve. */
const MIN_AUTO_CELL_DEVICE_PX = 2;

/** Dot diameter, in cells, whose area fills the cell — what full ink must reach to paint solid. */
const FULL_COVERAGE_DIAMETER = 2 / Math.sqrt(Math.PI);

/** Options whose change invalidates the cached per-dot contexts. */
const DERIVED_KEYS = ["dotMap", "fit", "padding", "size", "weight"] as const;
/** Options whose change invalidates the cached canvas geometry. */
const LAYOUT_KEYS = ["dotMap", "size", "fit", "padding", "dotScale"] as const;

/**
 * Paint a {@link DotMap} onto a canvas and animate it. One per canvas, updated
 * through {@link Renderer.update}: the clock lives here, so props never restart it.
 */
export function createRenderer(
  canvas: HTMLCanvasElement,
  initial: RendererOptions = {}
): Renderer {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("benday: could not acquire a 2D context");
  }
  const ctx = context;

  let opts: ResolvedRendererOptions = {
    ...DEFAULT_RENDERER_OPTIONS,
    ...strip(initial),
  };

  // Caches, rebuilt only when their inputs change.
  let dots: DotContext[] = [];
  let toneScales: number[] = [];
  let displayCols = 1;
  let displayRows = 1;
  let ink = "#000";
  let cssWidth = 0;
  let cssHeight = 0;
  let cell = 0;
  let originX = 0;
  let originY = 0;
  let baseRadius = 0;

  // Animation state, deliberately outliving update().
  let clock = 0;
  let settle = 1;
  let velocity = 0;
  let frameId = 0;
  let running = false;
  let lastFrame = 0;
  let paintable = true;
  let systemReducedMotion = prefersReducedMotion();

  const frame: DotFrame = { a: 1, dx: 0, dy: 0, s: 1 };

  function isReduced(): boolean {
    return opts.reducedMotion === "auto"
      ? systemReducedMotion
      : opts.reducedMotion;
  }

  function presetFn(): Preset {
    return typeof opts.preset === "function"
      ? opts.preset
      : PRESETS[opts.preset].fn;
  }

  function buildDerived(): void {
    const map = opts.dotMap;
    if (!map) {
      dots = [];
      toneScales = [];
      displayCols = 1;
      displayRows = 1;
      return;
    }

    const display = buildDisplayMap(map, opts);
    displayCols = display.cols;
    displayRows = display.rows;
    dots = display.dots.map((dot, i) => {
      const nx = dot.x * 2 - 1;
      const ny = dot.y * 2 - 1;
      return {
        angle: Math.atan2(ny, nx),
        cols: displayCols,
        d: dot.d,
        i,
        n: display.dots.length,
        nx,
        ny,
        r: Math.min(1, Math.hypot(nx, ny) / Math.SQRT2),
        rand: dotRandom(i),
        rows: displayRows,
        t: dot.t,
        v: dot.v,
        x: dot.x,
        y: dot.y,
      };
    });
    toneScales = display.dots.map((dot) =>
      toneScale(dot.v, dot.t, opts.weight)
    );
  }

  function buildLayout(): void {
    const map = opts.dotMap;
    const cols = map ? displayCols : 1;
    const rows = map ? displayRows : 1;

    cssWidth = opts.size;
    cssHeight =
      opts.fit === "natural" ? opts.size / safeAspect(map) : opts.size;

    const dpr = devicePixelRatioCapped();
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const padding = opticalPadding(opts.padding, Math.min(cssWidth, cssHeight));
    const availableWidth = cssWidth * (1 - padding * 2);
    const availableHeight = cssHeight * (1 - padding * 2);
    cell = Math.min(availableWidth / cols, availableHeight / rows);
    // A fine lattice lands every dot on a different fraction of a device pixel,
    // so each antialiases differently and the grid dissolves. Only small marks
    // need it, and only if the snapped lattice still fits the canvas.
    if (opticalFactor(Math.min(cssWidth, cssHeight)) > 0) {
      const devicePixel = 1 / dpr;
      const snapped = Math.max(
        devicePixel,
        Math.round(cell / devicePixel) * devicePixel
      );
      if (snapped * cols <= cssWidth && snapped * rows <= cssHeight) {
        cell = snapped;
      }
    }
    originX = snapTo((cssWidth - cell * cols) / 2, dpr);
    originY = snapTo((cssHeight - cell * rows) / 2, dpr);
    baseRadius = (cell * FULL_COVERAGE_DIAMETER * opts.dotScale) / 2;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function buildInk(): void {
    ink = resolveInk(canvas, opts.color);
  }

  function paint(): void {
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    if (dots.length === 0) {
      return;
    }

    ctx.fillStyle = ink;
    const optical = opticalFactor(Math.min(cssWidth, cssHeight));
    // Only `glow` blurs. Small marks used to get a halo here for optical
    // weight, but at 16px it came out wider than the cell and the lattice bled
    // into haze; `optical` buys that weight through radius and alpha instead.
    if (opts.glow > 0) {
      ctx.shadowColor = ink;
      ctx.shadowBlur = baseRadius * 4 * opts.glow;
    } else {
      ctx.shadowBlur = 0;
    }

    const run = presetFn();
    const cols = displayCols;
    const rows = displayRows;
    const motion = (1 - settle) * (1 - optical * 0.65);

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i] as DotContext;
      frame.s = 1;
      frame.a = 1;
      frame.dx = 0;
      frame.dy = 0;
      run(dot, clock, frame);

      // settle = 1 is the crisp logo; blend every channel toward it.
      const settledScale = frame.s + (1 - frame.s) * settle;
      const settledAlpha = frame.a + (1 - frame.a) * settle;
      const scale = settledScale + (1 - settledScale) * optical * 0.55;
      const alpha = settledAlpha + (1 - settledAlpha) * optical * 0.8;
      const radius =
        baseRadius * scale * (toneScales[i] as number) * shapeScale(opts.shape);
      if (radius <= 0.05) {
        continue;
      }
      const opacity = Math.min(1, Math.max(0, alpha));
      if (opacity <= 0.004) {
        continue;
      }

      ctx.globalAlpha = opacity;
      drawDot(
        ctx,
        opts.shape,
        originX + (dot.x * cols + frame.dx * motion) * cell,
        originY + (dot.y * rows + frame.dy * motion) * cell,
        radius
      );
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function settleTarget(): number {
    return opts.state === "thinking" ? 0 : 1;
  }

  function isSettled(): boolean {
    return settle === settleTarget() && velocity === 0;
  }

  function shouldAnimate(): boolean {
    if (isReduced() || opts.paused || !paintable) {
      return false;
    }
    return opts.state === "thinking" || !isSettled();
  }

  function step(now: number): void {
    const dt = lastFrame
      ? Math.min(MAX_TIMESTEP, (now - lastFrame) / 1000)
      : 1 / 60;
    lastFrame = now;
    clock += dt * opts.speed;

    const target = settleTarget();
    velocity += ((target - settle) * STIFFNESS - velocity * DAMPING) * dt;
    settle += velocity * dt;
    if (Math.abs(target - settle) < 0.001 && Math.abs(velocity) < 0.01) {
      settle = target;
      velocity = 0;
    }

    paint();

    if (running && shouldAnimate()) {
      frameId = requestAnimationFrame(step);
    } else {
      running = false;
    }
  }

  function start(): void {
    if (running) {
      return;
    }
    running = true;
    lastFrame = 0;
    frameId = requestAnimationFrame(step);
  }

  function stop(): void {
    running = false;
    cancelAnimationFrame(frameId);
  }

  function sync(): void {
    if (shouldAnimate()) {
      start();
    } else {
      stop();
    }
  }

  // Reduced motion means "show me the mark, not the animation".
  function applyReducedMotion(): void {
    if (isReduced()) {
      settle = 1;
      velocity = 0;
    }
  }

  const stopTheme = watchTheme(() => {
    buildInk();
    if (!running) {
      paint();
    }
  });

  const stopReducedMotion = watchReducedMotion((reduced) => {
    systemReducedMotion = reduced;
    applyReducedMotion();
    paint();
    sync();
  });

  const stopPaintability = watchPaintability(canvas, (next) => {
    paintable = next;
    sync();
  });

  buildDerived();
  buildLayout();
  buildInk();
  applyReducedMotion();
  paint();
  sync();

  return {
    destroy(): void {
      stop();
      stopTheme();
      stopReducedMotion();
      stopPaintability();
    },

    get height(): number {
      return cssHeight;
    },

    get options(): Readonly<ResolvedRendererOptions> {
      return opts;
    },

    update(next: RendererOptions): void {
      const previous = opts;
      opts = { ...opts, ...strip(next) };

      if (DERIVED_KEYS.some((key) => previous[key] !== opts[key])) {
        buildDerived();
      }
      if (LAYOUT_KEYS.some((key) => previous[key] !== opts[key])) {
        buildLayout();
      }
      if (previous.color !== opts.color) {
        buildInk();
      }
      applyReducedMotion();

      paint();
      sync();
    },
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Round a CSS-pixel position onto the backing store's pixel grid. */
function snapTo(value: number, dpr: number): number {
  return Math.round(value * dpr) / dpr;
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

interface DisplayDot {
  d: number;
  t: number;
  v: number;
  x: number;
  y: number;
}

interface DisplayMap {
  cols: number;
  dots: DisplayDot[];
  rows: number;
}

/**
 * Downsample an over-dense map into a coarser regular lattice. Missing source
 * dots count as empty cells, so the aggregate retains the source's ink mass
 * instead of merely making every surviving dot larger.
 */
function buildDisplayMap(
  map: DotMap,
  opts: ResolvedRendererOptions
): DisplayMap {
  const sourceCols = Math.max(1, Math.round(map.cols));
  const sourceRows = Math.max(1, Math.round(map.rows));
  const source = { cols: sourceCols, dots: map.dots, rows: sourceRows };
  if (map.dots.length === 0) {
    return source;
  }

  const width = Math.max(1, opts.size);
  const height = opts.fit === "natural" ? width / safeAspect(map) : width;
  const padding = opticalPadding(opts.padding, Math.min(width, height));
  const cell = Math.min(
    (width * (1 - padding * 2)) / sourceCols,
    (height * (1 - padding * 2)) / sourceRows
  );
  const minCell = MIN_AUTO_CELL_DEVICE_PX / devicePixelRatioCapped();
  if (!Number.isFinite(cell) || cell >= minCell) {
    return source;
  }

  const scale = cell / minCell;
  const cols = Math.max(1, Math.floor(sourceCols * scale));
  const rows = Math.max(1, Math.floor(sourceRows * scale));
  if (cols === sourceCols && rows === sourceRows) {
    return source;
  }

  const bins = Array.from({ length: cols * rows }, () => ({
    depth: 0,
    ink: 0,
    tone: 0,
  }));
  // Split each source cell across the target cells it overlaps, by area. Giving
  // it whole to one bin doubles the ink in every nth bin, which is worst at the
  // near-1 ratios small marks land on — the lattice grew a beat of its own.
  for (const dot of map.dots) {
    const coverage = clamp01(dot.v);
    if (coverage <= 0) {
      continue;
    }
    const left = (clamp(dot.col, 0, sourceCols) * cols) / sourceCols;
    const right = (clamp(dot.col + 1, 0, sourceCols) * cols) / sourceCols;
    const top = (clamp(dot.row, 0, sourceRows) * rows) / sourceRows;
    const bottom = (clamp(dot.row + 1, 0, sourceRows) * rows) / sourceRows;

    for (
      let row = Math.floor(top);
      row < Math.min(rows, Math.ceil(bottom));
      row++
    ) {
      const overlapY = Math.min(bottom, row + 1) - Math.max(top, row);
      if (overlapY <= 0) {
        continue;
      }
      for (
        let col = Math.floor(left);
        col < Math.min(cols, Math.ceil(right));
        col++
      ) {
        const overlapX = Math.min(right, col + 1) - Math.max(left, col);
        if (overlapX <= 0) {
          continue;
        }
        const bin = bins[row * cols + col];
        if (!bin) {
          continue;
        }
        // Weights over a full target cell sum to 1, so ink is already its mean.
        const ink = coverage * overlapX * overlapY;
        bin.ink += ink;
        bin.depth += clamp01(dot.d) * ink;
        bin.tone += clamp01(dot.t) * ink;
      }
    }
  }

  const dots: DisplayDot[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const bin = bins[row * cols + col];
      if (!bin || bin.ink <= 0.004) {
        continue;
      }
      dots.push({
        d: bin.depth / bin.ink,
        t: bin.tone / bin.ink,
        v: clamp01(bin.ink),
        x: (col + 0.5) / cols,
        y: (row + 0.5) / rows,
      });
    }
  }

  return { cols, dots, rows };
}

/**
 * A halftone represents coverage through area: radius therefore follows the
 * square root of tone. Opacity remains available to the animation instead of
 * applying coverage twice (radius, then alpha), which used to erase fine ink.
 *
 * Tone is what the cell covers times how dark it is. The floors this used to
 * multiply in compounded: empty cells painted 0.169 and full ones 0.319, so
 * every logo arrived the same flat grey. Depth stays out — it is the animation
 * channel, and folding it in only pulls area off the artwork's own tones.
 */
function toneScale(
  coverage: number,
  sourceTone: number,
  weight: number
): number {
  const w = clamp01(weight);
  // Below 1, weight interpolates toward a uniform field rather than shifting a floor.
  const weighted = 1 - w + w * clamp01(coverage);
  return Math.sqrt(clamp01(weighted * clamp01(sourceTone)));
}

/** Small marks need optical weight and restrained motion to remain identifiable. */
function opticalFactor(size: number): number {
  return clamp01((32 - size) / 16);
}

function opticalPadding(padding: number, size: number): number {
  return clamp(padding, 0, 0.49) * (1 - opticalFactor(size) * 0.65);
}

/** Keep circle, square and diamond at equal painted area for the same tone. */
function shapeScale(shape: DotShape): number {
  if (shape === "square") {
    return Math.sqrt(Math.PI / 4);
  }
  if (shape === "diamond") {
    return Math.sqrt(Math.PI / 2);
  }
  return 1;
}

function safeAspect(map: DotMap | null): number {
  if (map && Number.isFinite(map.aspect) && map.aspect > 0) {
    return map.aspect;
  }
  return map ? map.cols / Math.max(1, map.rows) : 1;
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  shape: DotShape,
  x: number,
  y: number,
  r: number
): void {
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (shape === "square") {
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
  ctx.fill();
}

/** Drop explicit `undefined` so spreading options never clobbers a default. */
function strip(options: RendererOptions): RendererOptions {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined) {
      out[key] = value;
    }
  }
  return out as RendererOptions;
}
