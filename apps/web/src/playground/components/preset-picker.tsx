import { Benday, PRESET_NAMES, PRESETS } from "@registry/ui/benday";
import type { DotMap, PresetName } from "@registry/ui/benday/types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Patch, RenderState } from "@/playground/lib/state";

/** Each option animates the current bake, so the list is previews, not words. */
export function PresetPicker({
  dotMap,
  render,
  patch,
}: {
  dotMap: DotMap | null;
  render: RenderState;
  patch: Patch<RenderState>;
}) {
  const preview = (preset: PresetName, size: number) => (
    <Benday
      dotMap={dotMap ?? undefined}
      dotScale={render.dotScale}
      preset={preset}
      shape={render.shape}
      size={size}
      speed={render.speed}
      state="thinking"
      weight={render.weight}
    />
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm" htmlFor="preset">
        Preset
      </label>

      <Select
        items={PRESET_NAMES.map((preset) => ({
          label: PRESETS[preset].label,
          value: preset,
        }))}
        onValueChange={(preset) => patch({ preset: preset as PresetName })}
        value={render.preset}
      >
        <SelectTrigger className="h-11 w-full px-3 text-sm" id="preset">
          <SelectValue>
            {(value: PresetName) => (
              <span className="flex items-center gap-2.5">
                {preview(value, 28)}
                {PRESETS[value].label}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {PRESET_NAMES.map((preset) => (
            <SelectItem
              className="gap-2.5 py-2.5 text-sm"
              key={preset}
              value={preset}
            >
              {preview(preset, 28)}
              {PRESETS[preset].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <p className="text-muted-foreground text-xs leading-snug">
        {PRESETS[render.preset].description}
      </p>
    </div>
  );
}
