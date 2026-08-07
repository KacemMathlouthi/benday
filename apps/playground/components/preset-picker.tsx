import type { DotMap } from "benday";
import { PRESET_NAMES, PRESETS } from "benday";
import { ThinkingLogo } from "benday/react";

import type { Patch, RenderState } from "../lib/state";
import { Card, SectionTitle } from "./controls";

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
    <Card>
      <SectionTitle>Preset</SectionTitle>
      <div className="grid grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-4">
        {PRESET_NAMES.map((p) => (
          <button
            className={`flex flex-col items-center gap-2 rounded-lg border px-2 py-3 transition-colors ${
              render.preset === p
                ? "border-zinc-900 bg-zinc-900/5 dark:border-zinc-100 dark:bg-zinc-100/5"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
            }`}
            key={p}
            onClick={() => patch({ preset: p })}
            title={PRESETS[p].description}
            type="button"
          >
            <ThinkingLogo
              dotMap={dotMap ?? undefined}
              dotScale={render.dotScale}
              preset={p}
              shape={render.shape}
              size={46}
              speed={render.speed}
              state="thinking"
              weight={render.weight}
            />
            <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
              {PRESETS[p].label}
            </span>
          </button>
        ))}
      </div>
      <p className="px-4 pb-4 text-[12px] text-zinc-500 dark:text-zinc-400">
        {PRESETS[render.preset].description}
      </p>
    </Card>
  );
}
