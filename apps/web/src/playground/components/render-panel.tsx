import type { DotMap, DotShape } from "@/components/ui/benday";
import { cn } from "@/lib/utils";
import {
  Panel,
  Segmented,
  Slider,
  Toggle,
} from "@/playground/components/controls";
import { PresetPicker } from "@/playground/components/preset-picker";
import { round } from "@/playground/lib/snippet";
import type { Patch, RenderState } from "@/playground/lib/state";
import { COLORS } from "@/playground/lib/state";

const SHAPES: { value: DotShape; label: string }[] = [
  { label: "Circle", value: "circle" },
  { label: "Square", value: "square" },
  { label: "Diamond", value: "diamond" },
];

export function RenderPanel({
  dotMap,
  render,
  patch,
}: {
  dotMap: DotMap | null;
  render: RenderState;
  patch: Patch<RenderState>;
}) {
  return (
    <Panel title="Render">
      <PresetPicker dotMap={dotMap} patch={patch} render={render} />
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

      <div className="flex flex-col gap-2">
        <span className="text-sm">Colour</span>
        <div className="flex items-center gap-2">
          {COLORS.map((color) => (
            <button
              aria-label={color.label}
              aria-pressed={render.color === color.value}
              className={cn(
                "size-6 border border-border transition-opacity",
                render.color === color.value
                  ? "ring-1 ring-ring ring-offset-2 ring-offset-background"
                  : "opacity-70 hover:opacity-100"
              )}
              key={color.value}
              onClick={() => patch({ color: color.value })}
              style={{
                backgroundColor:
                  color.value === "currentColor" ? undefined : color.value,
              }}
              type="button"
            >
              {color.value === "currentColor" && (
                <span className="block size-full bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      <Toggle
        hint="Size the canvas to the mark instead of a square box."
        label="Natural aspect"
        onChange={(fitNatural) => patch({ fitNatural })}
        value={render.fitNatural}
      />
    </Panel>
  );
}
