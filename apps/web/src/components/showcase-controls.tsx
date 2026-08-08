import type { DotShape } from "@/components/ui/benday";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ShowcaseSettings } from "@/lib/showcase";
import { SHOWCASE_COLORS, SHOWCASE_SHAPES } from "@/lib/showcase";
import { cn } from "@/lib/utils";

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-muted-foreground text-xs">{label}</span>
        {value && (
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {value}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * One control bar for the whole grid, so the cards stay a like-for-like
 * comparison. Sliders share a row; four columns overflowed the pickers.
 */
export function ShowcaseControls({
  settings,
  onChange,
}: {
  settings: ShowcaseSettings;
  onChange: (patch: Partial<ShowcaseSettings>) => void;
}) {
  return (
    <div className="flex flex-col gap-5 border border-border p-5">
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
        <Field label="Size" value={`${settings.size}px`}>
          <Slider
            aria-label="Size"
            max={200}
            min={48}
            onValueChange={(value) => onChange({ size: value as number })}
            step={4}
            value={settings.size}
          />
        </Field>

        <Field label="Speed" value={`${settings.speed.toFixed(2)}×`}>
          <Slider
            aria-label="Speed"
            max={3}
            min={0.1}
            onValueChange={(value) => onChange({ speed: value as number })}
            step={0.05}
            value={settings.speed}
          />
        </Field>

        <Field label="Dot scale" value={settings.dotScale.toFixed(2)}>
          <Slider
            aria-label="Dot scale"
            max={1.2}
            min={0.2}
            onValueChange={(value) => onChange({ dotScale: value as number })}
            step={0.01}
            value={settings.dotScale}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-[auto_1fr] sm:items-start">
        <Field label="Dot shape">
          <ToggleGroup
            className="flex-wrap justify-start"
            onValueChange={(value) => {
              const next = value[0] as DotShape | undefined;
              if (next) {
                onChange({ shape: next });
              }
            }}
            size="sm"
            value={[settings.shape]}
            variant="outline"
          >
            {SHOWCASE_SHAPES.map((shape) => (
              <ToggleGroupItem key={shape.value} value={shape.value}>
                {shape.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>

        <Field label="Colour">
          <div className="flex flex-wrap items-center gap-2 py-1">
            {SHOWCASE_COLORS.map((color) => (
              <button
                aria-label={color.label}
                aria-pressed={settings.color === color.value}
                className={cn(
                  "size-5 shrink-0 rounded-full border border-border transition-opacity",
                  settings.color === color.value
                    ? "ring-1 ring-ring ring-offset-2 ring-offset-background"
                    : "opacity-70 hover:opacity-100"
                )}
                key={color.value}
                onClick={() => onChange({ color: color.value })}
                style={{
                  backgroundColor:
                    color.value === "currentColor" ? undefined : color.value,
                }}
                type="button"
              >
                {color.value === "currentColor" && (
                  <span className="block size-full rounded-full bg-foreground" />
                )}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}
