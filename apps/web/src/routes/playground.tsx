import type { BakeOptions } from "benday";
import { useDotMap } from "benday/react";
import { useCallback, useMemo, useRef, useState } from "react";

import { Container } from "@/components/container";
import { PageHeader } from "@/components/section";
import { Button } from "@/components/ui/button";
import { BakePanel } from "@/playground/components/bake-panel";
import { PresetPicker } from "@/playground/components/preset-picker";
import { RenderPanel } from "@/playground/components/render-panel";
import { SourcePicker } from "@/playground/components/source-picker";
import { Stage } from "@/playground/components/stage";
import { UsagePanel } from "@/playground/components/usage-panel";
import { useFileDrop } from "@/playground/hooks/use-file-drop";
import { buildSnippet } from "@/playground/lib/snippet";
import type { BakeState, RenderState } from "@/playground/lib/state";
import {
  DEFAULT_BAKE_STATE,
  DEFAULT_RENDER_STATE,
} from "@/playground/lib/state";
import type { Sample } from "@/playground/samples";
import { SAMPLES } from "@/playground/samples";

export function Playground() {
  const [source, setSource] = useState<Sample>(SAMPLES[0]);
  const [bake, setBake] = useState<BakeState>(DEFAULT_BAKE_STATE);
  const [render, setRender] = useState<RenderState>(DEFAULT_RENDER_STATE);

  const patchBake = useCallback(
    (patch: Partial<BakeState>) => setBake((b) => ({ ...b, ...patch })),
    []
  );
  const patchRender = useCallback(
    (patch: Partial<RenderState>) => setRender((r) => ({ ...r, ...patch })),
    []
  );

  const { dragging, ingest } = useFileDrop(setSource);
  const fileInput = useRef<HTMLInputElement>(null);

  const bakeOptions: BakeOptions = useMemo(
    () => ({
      dilate: bake.dilate,
      gamma: bake.gamma,
      grid: bake.grid,
      invert: bake.invert,
      maskMode: bake.maskMode,
      threshold: bake.threshold,
      trim: bake.trim,
    }),
    [bake]
  );

  const { dotMap, loading, error, elapsed } = useDotMap(
    source.src,
    bakeOptions
  );
  const snippet = useMemo(() => buildSnippet(bake, render), [bake, render]);

  return (
    <Container className="pb-20" size="wide">
      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="border border-border border-dashed px-10 py-8 text-sm">
            Drop a logo: SVG, PNG, JPG or WebP
          </div>
        </div>
      )}

      <PageHeader
        lead="Drop a logo anywhere on the page, tune the bake until the mark still reads at 20px, then take the snippet or the baked JSON with you."
        title="Playground"
      >
        <Button onClick={() => fileInput.current?.click()} variant="outline">
          Upload a logo
        </Button>
        <input
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              ingest(file);
            }
            event.target.value = "";
          }}
          ref={fileInput}
          type="file"
        />
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 border-border border-t pt-8 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Stage
            dotMap={dotMap}
            error={error}
            loading={loading}
            patch={patchRender}
            render={render}
            source={source}
          />
          <PresetPicker dotMap={dotMap} patch={patchRender} render={render} />
          <SourcePicker onSelect={setSource} source={source} />
          <UsagePanel
            dotMap={dotMap}
            elapsed={elapsed}
            render={render}
            snippet={snippet}
            sourceId={source.id}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <BakePanel bake={bake} patch={patchBake} />
          <RenderPanel patch={patchRender} render={render} />
        </div>
      </div>
    </Container>
  );
}
