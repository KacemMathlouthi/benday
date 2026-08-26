import { createContext, useContext, useEffect, useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { PRESETS, useDotMap } from "../../../../registry/ui/benday";
import type {
  DotContext,
  DotFrame,
  DotMap,
  DotShape,
  PresetName,
} from "../../../../registry/ui/benday";
import { clamp01 } from "./math";

/** Dot diameter, in cells, whose area fills the cell. */
const FULL_COVERAGE_DIAMETER = 2 / Math.sqrt(Math.PI);
const DotMapContext = createContext<DotMap | null>(null);

export function BendayAssets({ children }: { children: React.ReactNode }) {
  const src = staticFile("benday-mark.svg");
  const { dotMap, error } = useDotMap(src, { grid: 28 });
  // Remotion recommends a lazy state initializer so delayRender runs once.
  // oxlint-disable-next-line react/hook-use-state
  const [handle] = useState(() => delayRender("Bake Benday launch mark"));
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let live = true;
    const loadFonts = async () => {
      try {
        await Promise.all([
          document.fonts.load('400 96px "Geist Variable"'),
          document.fonts.load('400 96px "Geist Mono Variable"'),
          document.fonts.load('400 96px "Geist Pixel Circle"'),
        ]);
        if (live) {
          setFontsReady(true);
        }
      } catch (fontError) {
        cancelRender(fontError);
      }
    };
    loadFonts();
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (error) {
      cancelRender(error);
      return;
    }
    if (dotMap && fontsReady) {
      continueRender(handle);
    }
  }, [dotMap, error, fontsReady, handle]);

  if (!dotMap || !fontsReady) {
    return null;
  }

  return (
    <DotMapContext.Provider value={dotMap}>{children}</DotMapContext.Provider>
  );
}

interface FrameBendayProps {
  className?: string;
  color?: string;
  dotScale?: number;
  frameOffset?: number;
  opacity?: number;
  preset?: PresetName;
  shape?: DotShape;
  size: number;
  speed?: number;
  /** 0 runs the preset; 1 resolves every channel into the crisp mark. */
  settle?: number;
  style?: React.CSSProperties;
  weight?: number;
}

/**
 * Remotion counterpart of the canvas painter. It consumes Benday's real baked
 * DotMap and presets, but derives the clock from the composition frame so a
 * preview frame and an exported frame are identical.
 */
export function FrameBenday({
  className,
  color = "#ededed",
  dotScale = 1,
  frameOffset = 0,
  opacity = 1,
  preset = "contour",
  shape = "circle",
  size,
  speed = 1,
  settle = 0,
  style,
  weight = 1,
}: FrameBendayProps) {
  const dotMap = useContext(DotMapContext);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!dotMap) {
    throw new Error("launch-video: BendayAssets must wrap FrameBenday");
  }

  const padding = opticalPadding(0.06, size);
  const available = size * (1 - padding * 2);
  const cell = Math.min(available / dotMap.cols, available / dotMap.rows);
  const originX = (size - cell * dotMap.cols) / 2;
  const originY = (size - cell * dotMap.rows) / 2;
  const optical = opticalFactor(size);
  const baseRadius = (cell * FULL_COVERAGE_DIAMETER * dotScale) / 2;
  const clock = ((frame + frameOffset) / fps) * speed;
  const run = PRESETS[preset].fn;
  const resolvedSettle = clamp01(settle);

  return (
    <svg
      aria-hidden
      className={className}
      height={size}
      style={{ display: "block", opacity, overflow: "visible", ...style }}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
    >
      {dotMap.dots.map((dot, index) => {
        const context = makeContext(dotMap, index);
        const animated: DotFrame = { a: 1, dx: 0, dy: 0, s: 1 };
        run(context, clock, animated);

        const scale =
          animated.s +
          (1 - animated.s) * resolvedSettle +
          (1 - (animated.s + (1 - animated.s) * resolvedSettle)) *
            optical *
            0.55;
        const alpha =
          animated.a +
          (1 - animated.a) * resolvedSettle +
          (1 - (animated.a + (1 - animated.a) * resolvedSettle)) *
            optical *
            0.8;
        const motion = (1 - resolvedSettle) * (1 - optical * 0.65);
        const radius =
          baseRadius *
          scale *
          toneScale(dot.v, dot.t, weight) *
          shapeScale(shape);
        const x = originX + (dot.x * dotMap.cols + animated.dx * motion) * cell;
        const y = originY + (dot.y * dotMap.rows + animated.dy * motion) * cell;

        if (radius <= 0.05 || alpha <= 0.004) {
          return null;
        }

        if (shape === "circle") {
          return (
            <circle
              cx={x}
              cy={y}
              fill={color}
              key={`${dot.col}-${dot.row}`}
              opacity={clamp01(alpha)}
              r={radius}
            />
          );
        }

        if (shape === "square") {
          return (
            <rect
              fill={color}
              height={radius * 2}
              key={`${dot.col}-${dot.row}`}
              opacity={clamp01(alpha)}
              width={radius * 2}
              x={x - radius}
              y={y - radius}
            />
          );
        }

        return (
          <path
            d={`M ${x} ${y - radius} L ${x + radius} ${y} L ${x} ${
              y + radius
            } L ${x - radius} ${y} Z`}
            fill={color}
            key={`${dot.col}-${dot.row}`}
            opacity={clamp01(alpha)}
          />
        );
      })}
    </svg>
  );
}

function makeContext(map: DotMap, index: number): DotContext {
  const dot = map.dots[index];
  if (!dot) {
    throw new Error(`launch-video: dot ${index} is missing`);
  }
  const nx = dot.x * 2 - 1;
  const ny = dot.y * 2 - 1;
  return {
    angle: Math.atan2(ny, nx),
    cols: map.cols,
    d: dot.d,
    i: index,
    n: map.dots.length,
    nx,
    ny,
    r: Math.min(1, Math.hypot(nx, ny) / Math.SQRT2),
    rand: dotRandom(index),
    rows: map.rows,
    t: dot.t,
    v: dot.v,
    x: dot.x,
    y: dot.y,
  };
}

function dotRandom(index: number) {
  const x = index * 0.371;
  const y = index * 0.917 + 3.14;
  const value = Math.sin(x * 127.1 + y * 311.7) * 43_758.5453;
  return value - Math.floor(value);
}

/** Mirrors the registry renderer: painted area is the cell's own tone. */
function toneScale(coverage: number, sourceTone: number, weight: number) {
  const w = clamp01(weight);
  const weighted = 1 - w + w * clamp01(coverage);
  return Math.sqrt(clamp01(weighted * clamp01(sourceTone)));
}

function opticalFactor(size: number) {
  return clamp01((32 - size) / 16);
}

function opticalPadding(padding: number, size: number) {
  return (
    Math.min(0.49, Math.max(0, padding)) * (1 - opticalFactor(size) * 0.65)
  );
}

function shapeScale(shape: DotShape) {
  if (shape === "square") {
    return Math.sqrt(Math.PI / 4);
  }
  if (shape === "diamond") {
    return Math.sqrt(Math.PI / 2);
  }
  return 1;
}
