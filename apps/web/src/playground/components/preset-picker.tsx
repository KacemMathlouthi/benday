import {
  Benday,
  PRESET_FAMILIES,
  PRESET_NAMES,
  PRESETS,
} from "@registry/ui/benday";
import type { DotMap, PresetName } from "@registry/ui/benday/types";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Patch, RenderState } from "@/playground/lib/state";

/** Searchable, grouped preset chooser with a live preview in every row. */
export function PresetPicker({
  dotMap,
  render,
  patch,
}: {
  dotMap: DotMap | null;
  render: RenderState;
  patch: Patch<RenderState>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return PRESET_FAMILIES.map((family) => ({
      family,
      presets: PRESET_NAMES.filter((preset) => {
        const definition = PRESETS[preset];
        if (definition.family !== family) {
          return false;
        }
        if (!search) {
          return true;
        }
        return `${definition.label} ${definition.description} ${family}`
          .toLocaleLowerCase()
          .includes(search);
      }),
    })).filter((group) => group.presets.length > 0);
  }, [query]);

  const preview = (preset: PresetName, size: number) => (
    <Benday
      aria-hidden
      dotMap={dotMap ?? undefined}
      dotScale={render.dotScale}
      preset={preset}
      shape={render.shape}
      size={size}
      speed={render.speed}
      state="thinking"
      weight={render.weight}
    />
  );

  const selected = PRESETS[render.preset];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm" htmlFor="preset">
        Preset
      </label>

      <Dialog
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setQuery("");
          }
        }}
        open={open}
      >
        <DialogTrigger
          render={
            <button
              aria-label={`Select preset, current: ${selected.label}`}
              className="flex h-11 w-full min-w-0 max-w-full items-center gap-2.5 overflow-hidden border border-input px-3 text-left text-sm outline-none transition-colors hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
              id="preset"
              type="button"
            />
          }
        >
          {preview(render.preset, 32)}
          <span className="min-w-0 flex-1 truncate">{selected.label}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {selected.family}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </DialogTrigger>

        <DialogContent
          aria-describedby={undefined}
          className="flex max-h-[calc(100svh-1rem)] w-[calc(100vw-1rem)] min-w-0 max-w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0 sm:w-full sm:max-w-2xl"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Select a preset</DialogTitle>

          <div className="flex items-center gap-2.5 border-border border-b px-4">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <input
              aria-label="Search presets"
              autoFocus
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search presets…"
              type="search"
              value={query}
            />
            <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
              {groups.reduce((count, group) => count + group.presets.length, 0)}
            </span>
          </div>

          {/* No padding above: a sticky heading offset from the top leaks rows under it. */}
          <div className="themed-scrollbar min-h-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto px-1.5 pb-1.5 sm:max-h-[min(34rem,70vh)] sm:px-2 sm:pb-2">
            {groups.length === 0 ? (
              <p className="px-3 py-10 text-center text-muted-foreground text-sm">
                No presets found.
              </p>
            ) : (
              groups.map((group) => (
                <section className="min-w-0 max-w-full" key={group.family}>
                  <h3 className="sticky top-0 z-10 bg-popover/95 px-2 py-2 font-medium text-[10px] text-muted-foreground uppercase tracking-wider backdrop-blur-sm">
                    {group.family}
                  </h3>
                  <div className="flex flex-col">
                    {group.presets.map((preset) => {
                      const definition = PRESETS[preset];
                      const active = preset === render.preset;
                      return (
                        <button
                          aria-pressed={active}
                          className={cn(
                            "flex w-full min-w-0 max-w-full items-center gap-3 overflow-hidden px-2 py-2.5 text-left outline-none transition-colors hover:bg-accent focus-visible:bg-accent sm:gap-4 sm:px-3 sm:py-3",
                            active && "bg-accent/60"
                          )}
                          key={preset}
                          onClick={() => {
                            patch({ preset });
                            setOpen(false);
                            setQuery("");
                          }}
                          type="button"
                        >
                          <span className="flex size-14 shrink-0 items-center justify-center border border-border bg-background/50 sm:size-16">
                            {preview(preset, 48)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm">
                              {definition.label}
                            </span>
                            <span className="line-clamp-1 block text-muted-foreground text-xs">
                              {definition.description}
                            </span>
                          </span>
                          <span className="flex size-4 shrink-0 items-center justify-center">
                            {active && <CheckIcon className="size-4" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <p className="text-muted-foreground text-xs leading-snug">
        {selected.description}
      </p>
    </div>
  );
}
