import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { DotMap } from "@/components/ui/benday";
import { Benday } from "@/components/ui/benday";
import { Button } from "@/components/ui/button";
import type { LogoProps } from "@/playground/lib/logo-props";

/** How long the fake work runs before the icon swaps back. */
const WORK_MS = 2600;

/** The glyph box both the icon and the mark are drawn into. */
const ICON_PX = 18;

/**
 * A button whose lucide icon morphs into the thinking dots while it works.
 *
 * The swap is the `t-icon-swap` transition from index.css: both glyphs sit in
 * one grid cell, so the outgoing one can blur and shrink out of the way without
 * the label moving a pixel.
 */
export function LoaderButton({
  icon: Icon,
  idle,
  working,
  dotMap,
  logo,
}: {
  icon: LucideIcon;
  idle: string;
  working: string;
  dotMap: DotMap | null;
  /** The render settings every preview on the page shares. */
  logo: LogoProps;
}) {
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  // The timeout outlives the click, so unmounting mid-run must cancel it.
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  return (
    <Button
      className="h-9 w-40 gap-2 px-3.5 text-sm"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        timer.current = setTimeout(() => setBusy(false), WORK_MS);
      }}
      size="lg"
      variant="outline"
    >
      <span
        className="t-icon-swap"
        data-state={busy ? "b" : "a"}
        style={{ height: ICON_PX, width: ICON_PX }}
      >
        <span className="t-icon flex items-center justify-center" data-icon="a">
          <Icon style={{ height: ICON_PX, width: ICON_PX }} />
        </span>
        <span className="t-icon flex items-center justify-center" data-icon="b">
          <Benday
            {...logo}
            dotMap={dotMap ?? undefined}
            size={ICON_PX}
            state={busy ? "thinking" : "done"}
          />
        </span>
      </span>
      {busy ? `${working}…` : idle}
    </Button>
  );
}
