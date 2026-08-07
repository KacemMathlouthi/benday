import { cn } from "@/lib/utils";
import type { Sample } from "@/playground/samples";
import { SAMPLES } from "@/playground/samples";

export function SourcePicker({
  source,
  onSelect,
}: {
  source: Sample;
  onSelect: (sample: Sample) => void;
}) {
  return (
    <section className="border border-border">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-border border-b bg-muted px-4 py-2">
        <h2 className="font-medium text-sm">Source</h2>
        <p className="text-muted-foreground text-xs">{source.note}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 p-4 sm:grid-cols-4 lg:grid-cols-7">
        {SAMPLES.map((sample) => (
          <button
            aria-pressed={source.id === sample.id}
            className={cn(
              "flex flex-col items-center gap-2 border p-2 transition-colors",
              source.id === sample.id
                ? "border-foreground"
                : "border-border hover:border-ring"
            )}
            key={sample.id}
            onClick={() => onSelect(sample)}
            title={sample.note}
            type="button"
          >
            <img
              alt={sample.label}
              className="h-9 w-full object-contain dark:invert"
              src={sample.src}
            />
            <span className="text-muted-foreground text-xs">
              {sample.label}
            </span>
          </button>
        ))}
      </div>

      <p className="border-border border-t px-4 py-2.5 text-muted-foreground text-xs">
        Or drop your own file anywhere on the page.
      </p>
    </section>
  );
}
