import { Benday, PRESETS } from "@/components/ui/benday";
import type { PresetName } from "@/components/ui/benday/types";
import type { ShowcaseSettings } from "@/lib/showcase";

/**
 * One grid cell: the mark running a single preset, named underneath. Every card
 * is the same size, so the grid reads as a comparison, not a hierarchy.
 */
export function PresetCard({
  preset,
  settings,
}: {
  preset: PresetName;
  settings: ShowcaseSettings;
}) {
  const { label, description } = PRESETS[preset];

  return (
    <div className="flex flex-col border border-border p-4">
      <div className="flex flex-1 items-center justify-center py-6">
        <Benday
          color={settings.color}
          dotScale={settings.dotScale}
          preset={preset}
          shape={settings.shape}
          size={settings.size}
          speed={settings.speed}
          src={settings.logo}
          state="thinking"
        />
      </div>
      <h3 className="mt-4 font-medium text-sm">{label}</h3>
      <span className="text-muted-foreground text-sm leading-tight">
        {description}
      </span>
    </div>
  );
}
