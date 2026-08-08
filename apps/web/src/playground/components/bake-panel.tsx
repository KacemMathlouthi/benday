import type { MaskMode } from "@registry/ui/benday";

import {
  Panel,
  Segmented,
  Slider,
  Toggle,
} from "@/playground/components/controls";
import { round } from "@/playground/lib/snippet";
import type { BakeState, Patch } from "@/playground/lib/state";

const MASK_MODES: { value: MaskMode; label: string }[] = [
  { label: "Auto", value: "auto" },
  { label: "Alpha", value: "alpha" },
  { label: "Luma", value: "luma" },
];

export function BakePanel({
  bake,
  patch,
}: {
  bake: BakeState;
  patch: Patch<BakeState>;
}) {
  return (
    <Panel title="Bake">
      <Slider
        format={(v) => `${v} dots`}
        hint="Dots across the longest side."
        label="Grid"
        max={64}
        min={6}
        onChange={(grid) => patch({ grid })}
        step={1}
        value={bake.grid}
      />
      <Slider
        format={round}
        hint="Ink coverage a cell needs to become a dot."
        label="Threshold"
        max={0.8}
        min={0.02}
        onChange={(threshold) => patch({ threshold })}
        step={0.01}
        value={bake.threshold}
      />
      <Slider
        format={round}
        hint="Below 1 boosts faint ink."
        label="Gamma"
        max={2.5}
        min={0.3}
        onChange={(gamma) => patch({ gamma })}
        step={0.05}
        value={bake.gamma}
      />
      <Slider
        format={(v) => `${v}px`}
        hint="Grows the mask. The fix for hairline strokes."
        label="Dilate"
        max={8}
        min={0}
        onChange={(dilate) => patch({ dilate })}
        step={1}
        value={bake.dilate}
      />
      <Segmented
        label="Mask mode"
        onChange={(maskMode) => patch({ maskMode })}
        options={MASK_MODES}
        value={bake.maskMode}
      />
      <Toggle
        hint="Light ink on a dark background, in luma mode."
        label="Invert"
        onChange={(invert) => patch({ invert })}
        value={bake.invert}
      />
      <Toggle
        hint="Crop the empty margin before sampling."
        label="Trim to content"
        onChange={(trim) => patch({ trim })}
        value={bake.trim}
      />
    </Panel>
  );
}
