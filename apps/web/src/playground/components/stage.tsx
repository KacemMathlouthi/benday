import {
  RefreshCwIcon,
  RocketIcon,
  SparklesIcon,
  SearchIcon,
} from "lucide-react";
import { useMemo } from "react";

import type { BakeOptions, DotMap } from "@/components/ui/benday";
import { Benday, useDotMap } from "@/components/ui/benday";
import { AgentPreview } from "@/playground/components/agent-preview";
import { LoaderButton } from "@/playground/components/loader-button";
import { gridForSize } from "@/playground/lib/grid";
import { logoProps } from "@/playground/lib/logo-props";
import type { LogoProps } from "@/playground/lib/logo-props";
import type { RenderState } from "@/playground/lib/state";

const SIZES = [64, 32, 20];

/** The slot the inline indicators sit in, and so the grid they bake for. */
const INLINE_SIZE = 18;

const LOADERS = [
  { icon: SparklesIcon, idle: "Generate", working: "Generating" },
  { icon: RocketIcon, idle: "Deploy", working: "Shipping" },
  { icon: SearchIcon, idle: "Search", working: "Searching" },
  { icon: RefreshCwIcon, idle: "Sync", working: "Syncing" },
];

function Caption({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground text-xs">{children}</span>;
}

/**
 * A map baked at a grid `size` can actually resolve. Reusing the full-size map
 * on a small logo is what turns an 18px indicator into grey fuzz; `bakeCached`
 * keys on source plus options, so previews at the same size share one bake.
 */
function useSizedMap(
  src: string,
  bakeOptions: BakeOptions,
  render: RenderState,
  size: number
): DotMap | null {
  const grid = gridForSize(size, render, bakeOptions.grid ?? 24);
  const options = useMemo(
    () => ({ ...bakeOptions, grid }),
    [bakeOptions, grid]
  );
  return useDotMap(src, options).dotMap;
}

/** One of the small size swatches, baked for its own size. */
function SizeSwatch({
  logo,
  size,
  src,
  bakeOptions,
  render,
}: {
  logo: LogoProps;
  size: number;
  src: string;
  bakeOptions: BakeOptions;
  render: RenderState;
}) {
  const dotMap = useSizedMap(src, bakeOptions, render, size);

  return (
    <div className="flex flex-col items-center gap-2">
      <Benday
        {...logo}
        dotMap={dotMap ?? undefined}
        size={size}
        state="thinking"
      />
      <Caption>{size}px</Caption>
    </div>
  );
}

function SimplePreview({
  logo,
  size,
  loading,
  error,
  src,
  bakeOptions,
  render,
}: {
  logo: LogoProps;
  size: number;
  loading: boolean;
  error: Error | null;
  src: string;
  bakeOptions: BakeOptions;
  render: RenderState;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex min-h-[320px] items-center justify-center px-6 py-10">
        <div className="flex flex-col items-center gap-3">
          <div className="flex min-h-50 items-center justify-center">
            {error ? (
              <p className="max-w-[220px] text-center text-destructive text-sm">
                {error.message}
              </p>
            ) : (
              <Benday {...logo} size={size} state="thinking" />
            )}
          </div>
          <Caption>{loading ? "Baking…" : "Dots"}</Caption>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-center gap-6 border-border border-t px-4 py-4">
        {SIZES.map((preview) => (
          <SizeSwatch
            bakeOptions={bakeOptions}
            key={preview}
            logo={logo}
            render={render}
            size={preview}
            src={src}
          />
        ))}
      </div>
    </div>
  );
}

function LoadersPreview({
  logo,
  inlineMap,
}: {
  logo: LogoProps;
  inlineMap: DotMap | null;
}) {
  return (
    <div className="flex flex-col items-center gap-5 px-6 py-8">
      {/* Two per row, and every cell the same width, so the buttons do not
          jump around as their labels change length mid-run. */}
      <div className="grid grid-cols-2 gap-3">
        {LOADERS.map((loader) => (
          <LoaderButton
            dotMap={inlineMap}
            icon={loader.icon}
            idle={loader.idle}
            key={loader.idle}
            logo={logo}
            working={loader.working}
          />
        ))}
      </div>
      <p className="max-w-md text-center text-muted-foreground text-sm leading-relaxed">
        Click one. The icon blurs out as the mark resolves in, the animation
        runs, and the settle spring pulls the dots back into the logo.
      </p>
    </div>
  );
}

/** One preview section: a titled band matching the control panels' chrome. */
function Preview({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-border">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-border border-b bg-muted px-4 py-2">
        <h2 className="font-medium text-sm">{title}</h2>
        <p className="text-muted-foreground text-xs">{lead}</p>
      </div>
      {children}
    </section>
  );
}

export function Stage({
  dotMap,
  loading,
  error,
  render,
  src,
  bakeOptions,
}: {
  dotMap: DotMap | null;
  loading: boolean;
  error: Error | null;
  render: RenderState;
  src: string;
  bakeOptions: BakeOptions;
}) {
  const logo = logoProps(render, dotMap);
  const inlineMap = useSizedMap(src, bakeOptions, render, INLINE_SIZE);

  return (
    <>
      <Preview lead="The mark on its own, at four sizes." title="Simple">
        <SimplePreview
          bakeOptions={bakeOptions}
          error={error}
          loading={loading}
          logo={logo}
          render={render}
          size={render.size}
          src={src}
        />
      </Preview>

      <Preview
        lead="Standing in for the spinner in a reasoning, task and message stream."
        title="AI agent"
      >
        <AgentPreview inlineMap={inlineMap} logo={logo} />
      </Preview>

      <Preview lead="Click one to watch the icon morph." title="Loaders">
        <LoadersPreview inlineMap={inlineMap} logo={logo} />
      </Preview>
    </>
  );
}
