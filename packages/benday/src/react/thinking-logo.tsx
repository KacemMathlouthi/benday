import type { CSSProperties, CanvasHTMLAttributes } from "react";
import { useEffect, useRef } from "react";

import type { BakeSource } from "../bake";
import { createRenderer } from "../renderer";
import type {
  BakeOptions,
  DotMap,
  Renderer,
  RendererOptions,
  ThinkingState,
} from "../types";
import { useDotMap } from "./use-dot-map";

export interface ThinkingLogoProps
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

const STATE_LABEL: Record<ThinkingState, string> = {
  done: "Done",
  idle: "Idle",
  thinking: "Thinking…",
};

/**
 * A canvas indicator built from your logo.
 *
 * All the moving parts live in the framework-agnostic renderer; this component
 * only owns the element, the bake, and the flow of props. Prop changes go in
 * through `renderer.update()` rather than by recreating anything, so the
 * animation never restarts mid-flight.
 */
export function ThinkingLogo({
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
}: ThinkingLogoProps) {
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
  const height =
    fit === "natural" && dotMap
      ? Math.round((size * dotMap.rows) / Math.max(1, dotMap.cols))
      : size;

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
