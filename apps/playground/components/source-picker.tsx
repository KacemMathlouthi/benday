import type { Sample } from "../samples";
import { SAMPLES } from "../samples";
import { Card, SectionTitle } from "./controls";

export function SourcePicker({
  source,
  onSelect,
}: {
  source: Sample;
  onSelect: (sample: Sample) => void;
}) {
  return (
    <Card>
      <SectionTitle>Source</SectionTitle>
      <div className="grid grid-cols-2 gap-2 px-4 pb-3 sm:grid-cols-4 lg:grid-cols-7">
        {SAMPLES.map((s) => (
          <button
            className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors ${
              source.id === s.id
                ? "border-zinc-900 dark:border-zinc-100"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
            }`}
            key={s.id}
            onClick={() => onSelect(s)}
            title={s.note}
            type="button"
          >
            <img
              alt={s.label}
              className="h-9 w-full object-contain dark:invert"
              src={s.src}
            />
            <span className="text-[10px] text-zinc-500 dark:text-zinc-500">
              {s.label}
            </span>
          </button>
        ))}
      </div>
      <p className="px-4 pb-4 text-[12px] text-zinc-500 dark:text-zinc-400">
        {source.note}{" "}
        <span className="text-zinc-400 dark:text-zinc-600">
          · or drop your own file anywhere
        </span>
      </p>
    </Card>
  );
}
