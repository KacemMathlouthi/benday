import type { DotMap } from "@/components/ui/benday";
import type { RenderState } from "@/playground/lib/state";

/**
 * The props every preview shares, so one settings change moves all of them at
 * once. `size`, `state` and `dotMap` are deliberately left to the caller: each
 * preview renders at its own size, and small sizes bake their own map.
 */
export function logoProps(render: RenderState, dotMap: DotMap | null) {
  return {
    color: render.color,
    dotMap: dotMap ?? undefined,
    dotScale: render.dotScale,
    fit: render.fitNatural ? ("natural" as const) : ("square" as const),
    glow: render.glow,
    padding: render.padding,
    preset: render.preset,
    shape: render.shape,
    speed: render.speed,
    weight: render.weight,
  };
}

export type LogoProps = ReturnType<typeof logoProps>;
