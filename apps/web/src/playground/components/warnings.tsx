import type { DotMap } from "@registry/ui/benday";

import type { RenderState } from "@/playground/lib/state";

/** Effective dot diameter — what decides whether a grid survives at 20px. */
function dotDiameter(dotMap: DotMap, render: RenderState): number {
  const available = render.size * (1 - render.padding * 2);
  return (available / Math.max(dotMap.cols, dotMap.rows)) * render.dotScale;
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-border px-4 py-2.5 text-sm leading-relaxed">
      {children}
    </p>
  );
}

/** The two ways a bake goes wrong that the preview alone does not explain. */
export function Warnings({
  dotMap,
  render,
}: {
  dotMap: DotMap | null;
  render: RenderState;
}) {
  const tooFew = dotMap !== null && dotMap.dots.length < 8;
  const tooSmall =
    dotMap !== null && !tooFew && dotDiameter(dotMap, render) < 1.6;

  if (!(tooFew || tooSmall)) {
    return null;
  }

  return (
    <>
      {tooFew && (
        <Warning>
          <span className="font-medium">
            Almost nothing survived the threshold.
          </span>{" "}
          Lower <code>threshold</code>, raise <code>dilate</code>, or try{" "}
          <code>maskMode: luma</code>.
        </Warning>
      )}
      {tooSmall && (
        <Warning>
          <span className="font-medium">
            Dots are under 1.6px at this size,
          </span>{" "}
          so they will read as grey fuzz. Drop <code>grid</code> to about 10 for
          a 20px indicator, and bake a separate map per size.
        </Warning>
      )}
    </>
  );
}
