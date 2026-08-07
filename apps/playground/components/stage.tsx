import type { DotMap, ThinkingState } from "benday";
import { ThinkingLogo } from "benday/react";

import type { Patch, RenderState } from "../lib/state";
import type { Sample } from "../samples";
import { Card } from "./controls";

const STATES: ThinkingState[] = ["idle", "thinking", "done"];
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
    <Card className="overflow-hidden">
      <div className="flex min-h-[300px] items-center justify-center gap-10 px-6 py-10">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-[200px] w-[200px] items-center justify-center rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800/60">
            <img
              alt="source"
              className="max-h-full max-w-full object-contain dark:invert"
              src={source.src}
            />
          </div>
          <span className="font-mono text-[10px] tracking-wider text-zinc-400 uppercase dark:text-zinc-600">
            source
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ minHeight: 200, minWidth: 200 }}
          >
            {error ? (
              <p className="max-w-[220px] text-center text-[12px] text-rose-500">
                {error.message}
              </p>
            ) : (
              <ThinkingLogo {...shared} size={render.size} />
            )}
          </div>
          <span className="font-mono text-[10px] tracking-wider text-zinc-400 uppercase dark:text-zinc-600">
            {loading ? "baking…" : "dots"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-zinc-200 border-t px-4 py-3 dark:border-zinc-800">
        <div className="flex gap-1">
          {STATES.map((s) => (
            <button
              className={`rounded-md px-2.5 py-1 text-[12px] ${
                render.state === s
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
              key={s}
              onClick={() => patch({ state: s })}
              type="button"
            >
              {s}
            </button>
          ))}
          <button
            className={`ml-2 rounded-md px-2.5 py-1 text-[12px] ${
              render.paused
                ? "bg-amber-500 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
            onClick={() => patch({ paused: !render.paused })}
            type="button"
          >
            {render.paused ? "paused" : "pause"}
          </button>
        </div>

        <div className="flex items-end gap-5">
          {SIZES.map((s) => (
            <div className="flex flex-col items-center gap-1.5" key={s}>
              <ThinkingLogo {...shared} size={s} />
              <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-zinc-200 border-t px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2.5 text-[13px] text-zinc-500 dark:text-zinc-400">
          <ThinkingLogo {...shared} size={18} />
          <span>Searching the codebase for the auth middleware…</span>
        </div>
      </div>
    </Card>
  );
}
