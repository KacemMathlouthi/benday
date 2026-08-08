import type { ReactNode } from "react";

import { Slider as SliderPrimitive } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/** A control group: a rule and a label, no card, so it reads as page not box. */
export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-border">
      <h2 className="border-border border-b bg-muted px-4 py-2 font-medium text-sm">
        {title}
      </h2>
      <div className="flex flex-col gap-6 px-4 py-5">{children}</div>
    </section>
  );
}

/** Label, current value and helper text, laid out the same for every control. */
function Field({
  label,
  value,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  value?: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm" htmlFor={htmlFor}>
          {label}
        </label>
        {value && (
          <span className="font-mono text-muted-foreground text-xs tabular-nums">
            {value}
          </span>
        )}
      </div>
      {children}
      {hint && (
        <p className="text-muted-foreground text-xs leading-snug">{hint}</p>
      )}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  hint?: string;
}) {
  return (
    <Field
      hint={hint}
      label={label}
      value={format ? format(value) : String(value)}
    >
      <SliderPrimitive
        aria-label={label}
        max={max}
        min={min}
        onValueChange={(next) => onChange(next as number)}
        step={step}
        value={value}
      />
    </Field>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <Field label={label}>
      <ToggleGroup
        className="flex-wrap justify-start"
        onValueChange={(next) => {
          const picked = next[0] as T | undefined;
          if (picked) {
            onChange(picked);
          }
        }}
        size="sm"
        value={[value]}
        variant="outline"
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Field>
  );
}

export function Toggle({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm">{label}</span>
        {hint && (
          <span className="text-muted-foreground text-xs leading-snug">
            {hint}
          </span>
        )}
      </div>
      <Switch
        aria-label={label}
        checked={value}
        className="mt-0.5 shrink-0"
        onCheckedChange={onChange}
      />
    </div>
  );
}
