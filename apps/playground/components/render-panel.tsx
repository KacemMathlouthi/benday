import type { DotShape } from "benday";

import { round } from "../lib/snippet";
import type { Patch, RenderState } from "../lib/state";
import { COLORS } from "../lib/state";
import { Card, SectionTitle, Segmented, Slider, Toggle } from "./controls";

const SHAPES: { value: DotShape; label: string }[] = [
  { label: "circle", value: "circle" },
  { label: "square", value: "square" },
  { label: "diamond", value: "diamond" },
];

export function RenderPanel({
  render,
  patch,
}: {
  render: RenderState;
  patch: Patch<RenderState>;
}) {
  return (
    <Card>
      <SectionTitle>Render</SectionTitle>
      <Slider
        format={(v) => `${v}px`}
        label="Size"
        max={320}
        min={16}
        onChange={(size) => patch({ size })}
        step={2}
        value={render.size}
      />
      <Slider
        format={(v) => `${round(v)}×`}
        label="Speed"
        max={3}
        min={0.1}
        onChange={(speed) => patch({ speed })}
        step={0.05}
        value={render.speed}
      />
      <Slider
        format={round}
        hint="Dot diameter as a fraction of the cell."
        label="Dot scale"
        max={1.3}
        min={0.15}
        onChange={(dotScale) => patch({ dotScale })}
        step={0.01}
        value={render.dotScale}
      />
      <Slider
        format={round}
        hint="How much ink coverage drives dot size."
        label="Coverage weight"
        max={1}
        min={0}
        onChange={(weight) => patch({ weight })}
        step={0.01}
        value={render.weight}
      />
      <Slider
        format={round}
        label="Glow"
        max={1}
        min={0}
        onChange={(glow) => patch({ glow })}
        step={0.02}
        value={render.glow}
      />
      <Slider
        format={round}
        label="Padding"
        max={0.3}
        min={0}
        onChange={(padding) => patch({ padding })}
        step={0.01}
        value={render.padding}
      />
      <Segmented
        label="Dot shape"
        onChange={(shape) => patch({ shape })}
        options={SHAPES}
        value={render.shape}
      />
      <Segmented
        label="Color"
        onChange={(color) => patch({ color })}
        options={COLORS}
        value={render.color}
      />
      <Toggle
        hint="Size the canvas to the mark instead of a square box."
        label="Natural aspect"
        onChange={(fitNatural) => patch({ fitNatural })}
        value={render.fitNatural}
      />
      <div className="h-2" />
    </Card>
  );
}
