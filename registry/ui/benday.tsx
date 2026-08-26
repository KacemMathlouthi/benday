"use client";

import type { CSSProperties, CanvasHTMLAttributes } from "react";
import { useEffect, useRef } from "react";

import type { BakeSource } from "./benday/bake";
import { createRenderer } from "./benday/renderer";
import type {
  BakeOptions,
  BendayState,
  DotMap,
  Renderer,
  RendererOptions,
} from "./benday/types";
import { useDotMap } from "./benday/use-dot-map";

export interface BendayProps
  extends
    Omit<
      CanvasHTMLAttributes<HTMLCanvasElement>,
      "color" | "height" | "style" | "width"
    >,
    Omit<RendererOptions, "dotMap"> {
  /** Image to bake at runtime — URL, data URI, File/Blob, or a loaded image. */
  src?: BakeSource;
  /** A pre-baked dot map. Takes precedence over `src`; this is the build-time path. */
  dotMap?: DotMap;
  /** Options for the runtime bake. Ignored when `dotMap` is supplied. */
  bake?: BakeOptions;
  style?: CSSProperties;
}

const STATE_LABEL: Record<BendayState, string> = {
  done: "Done",
  idle: "Idle",
  thinking: "Thinking…",
};

/**
 * A canvas indicator built from your logo. This owns only the element, the bake
 * and the props; `renderer.update()` takes changes without restarting anything.
 */
export function Benday({
  src,
  dotMap: dotMapProp,
  bake: bakeOptions,
  preset = "contour",
  state = "thinking",
  size = 64,
  fit = "square",
  speed = 1,
  color = "currentColor",
  dotScale = 0.62,
  shape = "circle",
  glow = 0,
  padding = 0.06,
  weight = 0.5,
  paused = false,
  reducedMotion = "auto",
  style,
  "aria-label": ariaLabel,
  ...rest
}: BendayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  // Only bake internally when no map was handed in.
  const baked = useDotMap(dotMapProp ? null : src, bakeOptions);
  const dotMap = dotMapProp ?? baked.dotMap;

  const options: RendererOptions = {
    color,
    dotMap,
    dotScale,
    fit,
    glow,
    padding,
    paused,
    preset,
    reducedMotion,
    shape,
    size,
    speed,
    state,
    weight,
  };

  // Declared before the mount effect so it has already run when the renderer is
  // created — writing a ref during render is what React Compiler rules out.
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const renderer = createRenderer(canvas, optionsRef.current);
    rendererRef.current = renderer;
    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    rendererRef.current?.update({
      color,
      dotMap,
      dotScale,
      fit,
      glow,
      padding,
      paused,
      preset,
      reducedMotion,
      shape,
      size,
      speed,
      state,
      weight,
    });
  }, [
    color,
    dotMap,
    dotScale,
    fit,
    glow,
    padding,
    paused,
    preset,
    reducedMotion,
    shape,
    size,
    speed,
    state,
    weight,
  ]);

  // Reserve the box before the renderer sizes the canvas, so nothing shifts.
  const height = fit === "natural" && dotMap ? size / safeAspect(dotMap) : size;

  return (
    <canvas
      aria-label={ariaLabel ?? STATE_LABEL[state]}
      ref={canvasRef}
      role="img"
      style={{ display: "block", height, width: size, ...style }}
      {...rest}
    />
  );
}

export {
  DEFAULT_BAKE,
  bake,
  bakeCached,
  bakeKey,
  clearBakeCache,
  resolveBakeOptions,
} from "./benday/bake";
export type { BakeSource } from "./benday/bake";
export { prefersReducedMotion } from "./benday/dom";
export {
  PRESET_FAMILIES,
  PRESET_NAMES,
  PRESETS,
  dotRandom,
  makeFrame,
} from "./benday/presets";
export type { PresetDefinition, PresetFamily } from "./benday/presets";
export { DEFAULT_RENDERER_OPTIONS, createRenderer } from "./benday/renderer";
export type {
  BakeOptions,
  BendayState,
  Dot,
  DotContext,
  DotFrame,
  DotMap,
  DotShape,
  Fit,
  MaskMode,
  Preset,
  PresetName,
  Renderer,
  RendererOptions,
  ResolvedBakeOptions,
  ResolvedRendererOptions,
} from "./benday/types";
export { useDotMap } from "./benday/use-dot-map";
export type { UseDotMapResult } from "./benday/use-dot-map";

function safeAspect(dotMap: DotMap): number {
  return Number.isFinite(dotMap.aspect) && dotMap.aspect > 0
    ? dotMap.aspect
    : dotMap.cols / Math.max(1, dotMap.rows);
}
