import type { DotMap, ThinkingState } from "benday";
import { ThinkingLogo } from "benday/react";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Patch, RenderState } from "@/playground/lib/state";
import type { Sample } from "@/playground/samples";

const STATES: ThinkingState[] = ["idle", "thinking", "done"];
const STATE_LABELS: Record<ThinkingState, string> = {
  done: "Done",
  idle: "Idle",
  thinking: "Thinking",
};
const SIZES = [64, 32, 20];

/** The props every preview on the stage shares. */
function logoProps(render: RenderState, dotMap: DotMap | null) {
  return {
    color: render.color,
    dotMap: dotMap ?? undefined,
    dotScale: render.dotScale,
    fit: render.fitNatural ? ("natural" as const) : ("square" as const),
    glow: render.glow,
    padding: render.padding,
    paused: render.paused,
    preset: render.preset,
    shape: render.shape,
    speed: render.speed,
    state: render.state,
    weight: render.weight,
  };
}

function Caption({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground text-xs">{children}</span>;
}

export function Stage({
  source,
  dotMap,
  loading,
  error,
  render,
  patch,
}: {
  source: Sample;
  dotMap: DotMap | null;
  loading: boolean;
  error: Error | null;
  render: RenderState;
  patch: Patch<RenderState>;
}) {
  const shared = logoProps(render, dotMap);

  return (
    <section className="border border-border">
      <div className="flex min-h-[320px] flex-wrap items-center justify-center gap-12 px-6 py-10">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-50 items-center justify-center bg-muted p-4">
            <img
              alt={`${source.label} source artwork`}
              className="max-h-full max-w-full object-contain dark:invert"
              src={source.src}
            />
          </div>
          <Caption>Source</Caption>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex size-50 items-center justify-center">
            {error ? (
              <p className="max-w-[220px] text-center text-destructive text-sm">
                {error.message}
              </p>
            ) : (
              <ThinkingLogo {...shared} size={render.size} />
            )}
          </div>
          <Caption>{loading ? "Baking…" : "Dots"}</Caption>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6 border-border border-t px-4 py-3">
        <div className="flex items-center gap-2">
          <ToggleGroup
            onValueChange={(next) => {
              const picked = next[0] as ThinkingState | undefined;
              if (picked) {
                patch({ state: picked });
              }
            }}
            size="sm"
            value={[render.state]}
            variant="outline"
          >
            {STATES.map((state) => (
              <ToggleGroupItem key={state} value={state}>
                {STATE_LABELS[state]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Button
            onClick={() => patch({ paused: !render.paused })}
            size="sm"
            variant={render.paused ? "secondary" : "ghost"}
          >
            {render.paused ? "Resume" : "Pause"}
          </Button>
        </div>

        <div className="flex items-end gap-6">
          {SIZES.map((size) => (
            <div className="flex flex-col items-center gap-2" key={size}>
              <ThinkingLogo {...shared} size={size} />
              <Caption>{size}px</Caption>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2.5 border-border border-t px-4 py-3 text-muted-foreground text-sm">
        <ThinkingLogo {...shared} size={18} />
        <span>Searching the codebase for the auth middleware…</span>
      </div>
    </section>
  );
}
