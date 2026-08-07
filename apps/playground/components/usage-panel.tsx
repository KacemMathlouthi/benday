import type { DotMap } from "benday";
import { useState } from "react";

import type { RenderState } from "../lib/state";
import { Card, Stat } from "./controls";

/**
 * Effective dot diameter at the current size — the number that decides whether
 * a grid setting survives at 20px or turns into grey fuzz.
 */
function dotDiameter(dotMap: DotMap, render: RenderState): number {
  const available = render.size * (1 - render.padding * 2);
  return (available / Math.max(dotMap.cols, dotMap.rows)) * render.dotScale;
}

export function UsagePanel({
  dotMap,
  elapsed,
  render,
  snippet,
  sourceId,
}: {
  dotMap: DotMap | null;
  elapsed: number | null;
  render: RenderState;
  snippet: string;
  sourceId: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const downloadDots = () => {
    if (!dotMap) {
      return;
    }
    const blob = new Blob([JSON.stringify(dotMap)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${sourceId}.dots.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const dotPx = dotMap ? dotDiameter(dotMap, render) : 0;
  const tooFew = dotMap !== null && dotMap.dots.length < 8;
  const tooSmall = dotMap !== null && dotPx < 1.6;

  return (
    <Card>
      <div className="grid grid-cols-3 divide-x divide-zinc-200 sm:grid-cols-6 dark:divide-zinc-800">
        <Stat label="dots" value={dotMap?.dots.length ?? "—"} />
        <Stat
          label="grid"
          value={dotMap ? `${dotMap.cols}×${dotMap.rows}` : "—"}
        />
        <Stat
          label="fill"
          value={
            dotMap
              ? `${Math.round((dotMap.dots.length / dotMap.cells) * 100)}%`
              : "—"
          }
        />
        <Stat label="mask" value={dotMap?.maskMode ?? "—"} />
        <Stat
          label="dot ⌀"
          value={
            dotMap ? (
              <span className={tooSmall ? "text-amber-500" : undefined}>
                {dotPx.toFixed(1)}px
              </span>
            ) : (
              "—"
            )
          }
        />
        <Stat
          label="bake"
          value={elapsed === null ? "—" : `${elapsed.toFixed(0)}ms`}
        />
      </div>

      {tooFew && (
        <p className="border-zinc-200 border-t px-4 py-2 text-[12px] text-amber-600 dark:border-zinc-800 dark:text-amber-500">
          Almost nothing survived the threshold. Lower <code>threshold</code>,
          raise <code>dilate</code>, or try <code>maskMode: luma</code>.
        </p>
      )}
      {tooSmall && !tooFew && (
        <p className="border-zinc-200 border-t px-4 py-2 text-[12px] text-amber-600 dark:border-zinc-800 dark:text-amber-500">
          Dots are under 1.6px at this size — they will read as grey fuzz. Drop{" "}
          <code>grid</code> to ~10 for a 20px indicator; bake a separate map per
          size.
        </p>
      )}

      <div className="border-zinc-200 border-t dark:border-zinc-800">
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="font-mono text-[10px] tracking-[0.14em] text-zinc-400 uppercase dark:text-zinc-500">
            Usage
          </span>
          <div className="flex gap-2">
            <button
              className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
              disabled={!dotMap}
              onClick={downloadDots}
              type="button"
            >
              dots.json
            </button>
            <button
              className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
              onClick={copy}
              type="button"
            >
              {copied ? "copied" : "copy"}
            </button>
          </div>
        </div>
        <pre className="overflow-x-auto px-4 pt-2 pb-4 font-mono text-[11.5px] leading-relaxed text-zinc-700 dark:text-zinc-300">
          {snippet}
        </pre>
      </div>
    </Card>
  );
}
