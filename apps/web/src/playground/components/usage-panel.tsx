import type { DotMap } from "benday";

import { CodeBlock } from "@/components/code-block";
import { Button } from "@/components/ui/button";
import { Stat } from "@/playground/components/controls";
import type { RenderState } from "@/playground/lib/state";

const NONE = "n/a";

/**
 * Effective dot diameter at the current size. This is the number that decides
 * whether a grid setting survives at 20px or turns into grey fuzz.
 */
function dotDiameter(dotMap: DotMap, render: RenderState): number {
  const available = render.size * (1 - render.padding * 2);
  return (available / Math.max(dotMap.cols, dotMap.rows)) * render.dotScale;
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-border border-t px-4 py-2.5 text-sm leading-relaxed">
      {children}
    </p>
  );
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
    <div className="flex flex-col gap-4">
      <section className="border border-border">
        <div className="grid grid-cols-3 divide-x divide-border sm:grid-cols-6">
          <Stat label="Dots" value={dotMap?.dots.length ?? NONE} />
          <Stat
            label="Grid"
            value={dotMap ? `${dotMap.cols}×${dotMap.rows}` : NONE}
          />
          <Stat
            label="Fill"
            value={
              dotMap
                ? `${Math.round((dotMap.dots.length / dotMap.cells) * 100)}%`
                : NONE
            }
          />
          <Stat label="Mask" value={dotMap?.maskMode ?? NONE} />
          <Stat
            label="Dot size"
            value={dotMap ? `${dotPx.toFixed(1)}px` : NONE}
          />
          <Stat
            label="Bake"
            value={elapsed === null ? NONE : `${elapsed.toFixed(0)}ms`}
          />
        </div>

        {tooFew && (
          <Warning>
            <span className="font-medium">
              Almost nothing survived the threshold.
            </span>{" "}
            Lower <code>threshold</code>, raise <code>dilate</code>, or try{" "}
            <code>maskMode: luma</code>.
          </Warning>
        )}
        {tooSmall && !tooFew && (
          <Warning>
            <span className="font-medium">
              Dots are under 1.6px at this size,
            </span>{" "}
            so they will read as grey fuzz. Drop <code>grid</code> to about 10
            for a 20px indicator, and bake a separate map per size.
          </Warning>
        )}
      </section>

      <CodeBlock
        actions={
          <Button
            disabled={!dotMap}
            onClick={downloadDots}
            size="sm"
            variant="ghost"
          >
            Download dots.json
          </Button>
        }
        code={snippet}
        filename="usage.tsx"
      />
    </div>
  );
}
