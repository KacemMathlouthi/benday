import type { DotMap, PresetName } from "benday";
import { ThinkingLogo } from "benday/react";
import { useRef } from "react";

export function SiteHeader({
  dotMap,
  speed,
  preset,
  theme,
  onToggleTheme,
  onFile,
}: {
  dotMap: DotMap | null;
  speed: number;
  preset: PresetName;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onFile: (file: File) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <ThinkingLogo
          dotMap={dotMap ?? undefined}
          dotScale={0.6}
          preset={preset}
          size={34}
          speed={speed}
          state="thinking"
        />
        <div>
          <h1 className="font-mono text-[15px] font-medium tracking-tight">
            benday
          </h1>
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
            your logo, halftoned into a thinking indicator
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-[12px] text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          onClick={() => fileInput.current?.click()}
          type="button"
        >
          Upload logo
        </button>
        <input
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onFile(file);
            }
            event.target.value = "";
          }}
          ref={fileInput}
          type="file"
        />
        <button
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
          onClick={onToggleTheme}
          type="button"
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  );
}
