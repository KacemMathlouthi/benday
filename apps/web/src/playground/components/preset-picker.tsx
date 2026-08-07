import type { DotMap } from "benday";
import { PRESET_NAMES, PRESETS } from "benday";
import { ThinkingLogo } from "benday/react";

import { cn } from "@/lib/utils";
import type { Patch, RenderState } from "@/playground/lib/state";

export function PresetPicker({
  dotMap,
  render,
  patch,
}: {
  dotMap: DotMap | null;
  render: RenderState;
  patch: Patch<RenderState>;
}) {
  return (
    <section className="border border-border">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-border border-b bg-muted px-4 py-2">
        <h2 className="font-medium text-sm">Preset</h2>
        <p className="text-muted-foreground text-xs">
          {PRESETS[render.preset].description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
        {PRESET_NAMES.map((preset) => (
          <button
            aria-pressed={render.preset === preset}
            className={cn(
              "flex flex-col items-center gap-2 border px-2 py-4 transition-colors",
              render.preset === preset
                ? "border-foreground text-foreground"
                : "border-border text-muted-foreground hover:border-ring"
            )}
            key={preset}
            onClick={() => patch({ preset })}
            title={PRESETS[preset].description}
            type="button"
          >
            <ThinkingLogo
              dotMap={dotMap ?? undefined}
              dotScale={render.dotScale}
              preset={preset}
              shape={render.shape}
              size={46}
              speed={render.speed}
              state="thinking"
              weight={render.weight}
            />
            <span className="text-xs">{PRESETS[preset].label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
