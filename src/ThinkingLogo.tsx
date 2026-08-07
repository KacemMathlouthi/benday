import { useEffect, useRef } from 'react';
import type { CSSProperties, CanvasHTMLAttributes } from 'react';
import type { BakeSource } from './bake';
import { usePrefersReducedMotion, useDotMap, useThemeTick } from './hooks';
import { PRESETS, dotRandom, makeFrame } from './presets';
import type {
  BakeOptions,
  DotMap,
  DotShape,
  Preset,
  PresetName,
  ThinkingState,
} from './types';

export interface ThinkingLogoProps
  extends Omit<CanvasHTMLAttributes<HTMLCanvasElement>, 'style' | 'color' | 'width' | 'height'> {
  /** Image to bake at runtime — URL, data URI, File/Blob, or an already-loaded image. */
  src?: BakeSource;
  /** A pre-baked dot map. Takes precedence over `src`; this is the build-time path. */
  dotMap?: DotMap;
  /** Options for the runtime bake. Ignored when `dotMap` is supplied. */
  bake?: BakeOptions;
  /** Rendered size in CSS pixels. @default 64 */
  size?: number;
  /**
   * `square` keeps a size×size box and fits the mark inside (predictable for
   * inline use). `natural` sizes the canvas to the mark's aspect ratio, which
   * wide wordmarks need to stay legible. @default 'square'
   */
  fit?: 'square' | 'natural';
  /** @default 'thinking' */
  state?: ThinkingState;
  /** Preset name, or your own per-dot function. @default 'contour' */
  preset?: PresetName | Preset;
  /** Animation speed multiplier. @default 1 */
  speed?: number;
  /** Dot color. Defaults to the inherited text color. @default 'currentColor' */
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
  style?: CSSProperties;
}

const STIFFNESS = 140;
const DAMPING = 20;

const STATE_LABEL: Record<ThinkingState, string> = {
  idle: 'Idle',
  thinking: 'Thinking…',
  done: 'Done',
};

export function ThinkingLogo({
  src,
  dotMap: dotMapProp,
  bake: bakeOptions,
  size = 64,
  fit = 'square',
  state = 'thinking',
  preset = 'contour',
  speed = 1,
  color = 'currentColor',
  dotScale = 0.62,
  shape = 'circle',
  glow = 0,
  padding = 0.06,
  weight = 0.5,
  paused = false,
  style,
  'aria-label': ariaLabel,
  ...rest
}: ThinkingLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const themeTick = useThemeTick();

  // Only bake internally when no map was handed in.
  const baked = useDotMap(dotMapProp ? null : src, bakeOptions);
  const dotMap = dotMapProp ?? baked.dotMap;

  // Persisted across effect re-runs so prop changes never restart the motion.
  const clockRef = useRef(0);
  const settleRef = useRef(1);
  const velocityRef = useRef(0);

  const presetFn: Preset = typeof preset === 'function' ? preset : PRESETS[preset].fn;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dotMap || dotMap.dots.length === 0) return;

    const { cols, rows, dots } = dotMap;
    const boxW = size;
    const boxH = fit === 'natural' ? Math.round((size * rows) / Math.max(1, cols)) : size;

    const dpr = Math.min(2, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1);
    canvas.width = Math.round(boxW * dpr);
    canvas.height = Math.round(boxH * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // A canvas cannot inherit `currentColor`, so resolve it off the element.
    const ink = color === 'currentColor' ? getComputedStyle(canvas).color || '#000' : color;

    const availW = boxW * (1 - padding * 2);
    const availH = boxH * (1 - padding * 2);
    const cell = Math.min(availW / cols, availH / rows);
    const originX = (boxW - cell * cols) / 2;
    const originY = (boxH - cell * rows) / 2;
    const baseRadius = (cell * dotScale) / 2;

    // Per-dot constants hoisted out of the frame loop.
    const ctxs = dots.map((dot, i) => {
      const nx = dot.x * 2 - 1;
      const ny = dot.y * 2 - 1;
      return {
        i,
        n: dots.length,
        x: dot.x,
        y: dot.y,
        nx,
        ny,
        r: Math.min(1, Math.hypot(nx, ny) / Math.SQRT2),
        angle: Math.atan2(ny, nx),
        v: dot.v,
        d: dot.d,
        rand: dotRandom(i),
        cols,
        rows,
      };
    });
    const weights = dots.map((dot) => 1 - weight + weight * dot.v);

    const frame = makeFrame();

    const paint = (t: number, settle: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, boxW, boxH);
      ctx.fillStyle = ink;
      if (glow > 0) {
        ctx.shadowColor = ink;
        ctx.shadowBlur = baseRadius * 2 * glow * 2;
      } else {
        ctx.shadowBlur = 0;
      }

      const motion = 1 - settle;
      for (let i = 0; i < ctxs.length; i++) {
        const c = ctxs[i];
        frame.s = 1;
        frame.a = 1;
        frame.dx = 0;
        frame.dy = 0;
        presetFn(c, t, frame);

        // settle = 1 is the crisp logo; blend every channel toward it.
        const s = frame.s + (1 - frame.s) * settle;
        const a = frame.a + (1 - frame.a) * settle;
        const cx = originX + (c.x * cols + frame.dx * motion) * cell;
        const cy = originY + (c.y * rows + frame.dy * motion) * cell;
        const radius = baseRadius * s * weights[i];
        if (radius <= 0.05 || a <= 0.004) continue;

        ctx.globalAlpha = Math.min(1, a * weights[i]);
        drawDot(ctx, shape, cx, cy, radius);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    if (reducedMotion) {
      settleRef.current = 1;
      velocityRef.current = 0;
      paint(clockRef.current, 1);
      return;
    }

    if (paused) {
      paint(clockRef.current, settleRef.current);
      return;
    }

    const target = state === 'thinking' ? 0 : 1;
    let raf = 0;
    let running = false;
    let last = 0;

    const step = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      clockRef.current += dt * speed;

      let settle = settleRef.current;
      let vel = velocityRef.current;
      vel += ((target - settle) * STIFFNESS - vel * DAMPING) * dt;
      settle += vel * dt;
      if (Math.abs(target - settle) < 0.001 && Math.abs(vel) < 0.01) {
        settle = target;
        vel = 0;
      }
      settleRef.current = settle;
      velocityRef.current = vel;

      paint(clockRef.current, settle);

      // A settled, non-thinking mark is a still image — stop burning frames.
      const done = state !== 'thinking' && settle === target && vel === 0;
      if (running && !done) raf = requestAnimationFrame(step);
      else running = false;
    };

    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    paint(clockRef.current, settleRef.current);

    let visible = true;
    const sync = () => {
      if (visible && document.visibilityState !== 'hidden') start();
      else stop();
    };
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            sync();
          })
        : null;
    io?.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    if (!io) start();

    return () => {
      stop();
      io?.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [
    dotMap,
    presetFn,
    size,
    fit,
    state,
    speed,
    color,
    dotScale,
    shape,
    glow,
    padding,
    weight,
    paused,
    reducedMotion,
    themeTick,
  ]);

  const boxH = fit === 'natural' && dotMap ? (size * dotMap.rows) / Math.max(1, dotMap.cols) : size;

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel ?? STATE_LABEL[state]}
      style={{ width: size, height: boxH, display: 'block', ...style }}
      {...rest}
    />
  );
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  shape: DotShape,
  x: number,
  y: number,
  r: number
): void {
  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (shape === 'square') {
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    return;
  }
  // diamond
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
  ctx.fill();
}
