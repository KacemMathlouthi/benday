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

/** Options whose change invalidates the cached per-dot contexts. */
const DERIVED_KEYS = ["dotMap", "weight"] as const;
/** Options whose change invalidates the cached canvas geometry. */
const LAYOUT_KEYS = ["dotMap", "size", "fit", "padding", "dotScale"] as const;

/**
 * Paint a {@link DotMap} onto a canvas and animate it.
 *
 * Create one per canvas and feed it new options through {@link Renderer.update}.
 * The animation clock and the settle spring live inside the renderer, so
 * changing props never restarts the motion — which is exactly what a React
 * effect re-run would otherwise do.
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

  // ----- caches, rebuilt only when their inputs change ----- //
  let dots: DotContext[] = [];
  let weights: number[] = [];
  let ink = "#000";
  let cssWidth = 0;
  let cssHeight = 0;
  let cell = 0;
  let originX = 0;
  let originY = 0;
  let baseRadius = 0;

  // ----- animation state, deliberately outliving update() ----- //
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
      weights = [];
      return;
    }
    const { cols, rows } = map;
    dots = map.dots.map((dot, i) => {
      const nx = dot.x * 2 - 1;
      const ny = dot.y * 2 - 1;
      return {
        angle: Math.atan2(ny, nx),
        cols,
        d: dot.d,
        i,
        n: map.dots.length,
        nx,
        ny,
        r: Math.min(1, Math.hypot(nx, ny) / Math.SQRT2),
        rand: dotRandom(i),
        rows,
        v: dot.v,
        x: dot.x,
        y: dot.y,
      };
    });
    weights = map.dots.map((dot) => 1 - opts.weight + opts.weight * dot.v);
  }

  function buildLayout(): void {
    const map = opts.dotMap;
    const cols = map?.cols ?? 1;
    const rows = map?.rows ?? 1;

    cssWidth = opts.size;
    cssHeight =
      opts.fit === "natural"
        ? Math.round((opts.size * rows) / Math.max(1, cols))
        : opts.size;

    const dpr = devicePixelRatioCapped();
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const availableWidth = cssWidth * (1 - opts.padding * 2);
    const availableHeight = cssHeight * (1 - opts.padding * 2);
    cell = Math.min(availableWidth / cols, availableHeight / rows);
    originX = (cssWidth - cell * cols) / 2;
    originY = (cssHeight - cell * rows) / 2;
    baseRadius = (cell * opts.dotScale) / 2;

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
    if (opts.glow > 0) {
      ctx.shadowColor = ink;
      ctx.shadowBlur = baseRadius * 4 * opts.glow;
    } else {
      ctx.shadowBlur = 0;
    }

    const run = presetFn();
    const cols = opts.dotMap?.cols ?? 1;
    const rows = opts.dotMap?.rows ?? 1;
    const motion = 1 - settle;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i] as DotContext;
      frame.s = 1;
      frame.a = 1;
      frame.dx = 0;
      frame.dy = 0;
      run(dot, clock, frame);

      // settle = 1 is the crisp logo; blend every channel toward it.
      const scale = frame.s + (1 - frame.s) * settle;
      const alpha = frame.a + (1 - frame.a) * settle;
      const weight = weights[i] as number;
      const radius = baseRadius * scale * weight;
      if (radius <= 0.05) {
        continue;
      }
      const opacity = Math.min(1, alpha * weight);
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
