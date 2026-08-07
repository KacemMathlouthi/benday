import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white/70 dark:border-zinc-800 dark:bg-zinc-900/50 ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="px-4 pt-3.5 pb-2 font-mono text-[10px] tracking-[0.14em] text-zinc-400 uppercase dark:text-zinc-500">
      {children}
    </h2>
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
    <label className="block px-4 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
          {label}
        </span>
        <span className="font-mono text-[11px] text-zinc-500 tabular-nums dark:text-zinc-400">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        className="mt-2 text-zinc-900 dark:text-zinc-100"
        max={max}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        type="range"
        value={value}
      />
      {hint && (
        <p className="mt-1 text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">
          {hint}
        </p>
      )}
    </label>
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
    <div className="px-4 py-2">
      <div className="mb-1.5 text-[13px] text-zinc-700 dark:text-zinc-300">
        {label}
      </div>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            className={`rounded-md px-2.5 py-1 text-[12px] transition-colors ${
              value === o.value
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
            key={o.value}
            onClick={() => onChange(o.value)}
            type="button"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
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
    <div className="flex items-start justify-between gap-3 px-4 py-2">
      <span>
        <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">
            {hint}
          </span>
        )}
      </span>
      <button
        aria-checked={value}
        aria-label={label}
        className={`mt-0.5 h-[18px] w-[32px] shrink-0 rounded-full transition-colors ${
          value
            ? "bg-zinc-900 dark:bg-zinc-100"
            : "bg-zinc-300 dark:bg-zinc-700"
        }`}
        onClick={() => onChange(!value)}
        role="switch"
        type="button"
      >
        <span
          className={`block h-[14px] w-[14px] rounded-full bg-white transition-transform dark:bg-zinc-900 ${
            value ? "translate-x-[16px]" : "translate-x-[2px]"
          }`}
        />
      </button>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="px-3 py-2">
      <div className="font-mono text-[10px] tracking-wider text-zinc-400 uppercase dark:text-zinc-600">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[13px] text-zinc-800 tabular-nums dark:text-zinc-200">
        {value}
      </div>
    </div>
  );
}
