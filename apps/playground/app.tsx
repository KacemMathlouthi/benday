import type { BakeOptions } from "benday";
import { useDotMap } from "benday/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BakePanel } from "./components/bake-panel";
import { PresetPicker } from "./components/preset-picker";
import { RenderPanel } from "./components/render-panel";
import { SiteHeader } from "./components/site-header";
import { SourcePicker } from "./components/source-picker";
import { Stage } from "./components/stage";
import { UsagePanel } from "./components/usage-panel";
import { useFileDrop } from "./hooks/use-file-drop";
import { buildSnippet } from "./lib/snippet";
import type { BakeState, RenderState } from "./lib/state";
import { DEFAULT_BAKE_STATE, DEFAULT_RENDER_STATE } from "./lib/state";
import type { Sample } from "./samples";
import { SAMPLES } from "./samples";

export function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

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
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm">
          <div className="rounded-xl border-2 border-zinc-500 border-dashed px-10 py-8 font-mono text-sm text-zinc-200">
            drop a logo — svg, png, jpg, webp
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1240px] px-5 py-6">
        <SiteHeader
          dotMap={dotMap}
          onFile={ingest}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
          preset={render.preset}
          speed={render.speed}
          theme={theme}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-4">
            <BakePanel bake={bake} patch={patchBake} />
            <RenderPanel patch={patchRender} render={render} />
          </div>
        </div>

        <footer className="mt-8 pb-6 text-center text-[11px] text-zinc-400 dark:text-zinc-600">
          Mask → EDT → grid sample → canvas. Respects{" "}
          <code className="font-mono">prefers-reduced-motion</code>; pauses
          off-screen.
        </footer>
      </div>
    </div>
  );
}
