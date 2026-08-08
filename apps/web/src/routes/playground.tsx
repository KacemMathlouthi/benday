import { useCallback, useMemo, useRef, useState } from "react";

import { Container } from "@/components/container";
import { PageHeader } from "@/components/section";
import type { BakeOptions } from "@/components/ui/benday";
import { useDotMap } from "@/components/ui/benday";
import { Button } from "@/components/ui/button";
import { BakePanel } from "@/playground/components/bake-panel";
import { RenderPanel } from "@/playground/components/render-panel";
import { Stage } from "@/playground/components/stage";
import { UsageDialog } from "@/playground/components/usage-dialog";
import { Warnings } from "@/playground/components/warnings";
import { useFileDrop } from "@/playground/hooks/use-file-drop";
import { buildSnippet } from "@/playground/lib/snippet";
import type { Source } from "@/playground/lib/source";
import { DEFAULT_SOURCE } from "@/playground/lib/source";
import type { BakeState, RenderState } from "@/playground/lib/state";
import {
  DEFAULT_BAKE_STATE,
  DEFAULT_RENDER_STATE,
} from "@/playground/lib/state";

export function Playground() {
  const [source, setSource] = useState<Source>(DEFAULT_SOURCE);
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

  const { dotMap, loading, error } = useDotMap(source.src, bakeOptions);
  const snippet = useMemo(() => buildSnippet(bake, render), [bake, render]);

  return (
    <Container className="pb-20">
      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="border border-border border-dashed px-10 py-8 text-sm">
            Drop a logo: SVG, PNG, JPG or WebP
          </div>
        </div>
      )}

      <PageHeader
        aside={
          // The source as it went in, beside the title so the stage stays all
          // dots. Outlined, not filled — a plate reads as part of the logo.
          <figure className="flex flex-col items-center gap-2">
            <div className="flex size-28 items-center justify-center border border-border p-3">
              <img
                alt={`${source.label} source artwork`}
                className="max-h-full max-w-full object-contain dark:invert"
                src={source.src}
              />
            </div>
            <figcaption className="block max-w-28 truncate text-muted-foreground text-xs">
              {source.label}
            </figcaption>
          </figure>
        }
        lead="Drop a logo anywhere on the page, then tune the bake until the mark still reads at 20px."
        title="Playground"
      >
        <div className="flex items-center gap-2">
          <UsageDialog snippet={snippet} />
          <Button onClick={() => fileInput.current?.click()} variant="outline">
            Upload a logo
          </Button>
        </div>
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

      {/* Controls first in the DOM too, so reading order matches apply order. */}
      <div className="grid grid-cols-1 gap-4 border-border border-t pt-8 lg:grid-cols-[300px_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <BakePanel bake={bake} patch={patchBake} />
          <RenderPanel dotMap={dotMap} patch={patchRender} render={render} />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Stage
            bakeOptions={bakeOptions}
            dotMap={dotMap}
            error={error}
            loading={loading}
            render={render}
            src={source.src}
          />
          <Warnings dotMap={dotMap} render={render} />
        </div>
      </div>
    </Container>
  );
}
