import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { PRESETS, PRESET_NAMES, ThinkingLogo, useDotMap } from 'benday';
import type {
  BakeOptions,
  DotShape,
  MaskMode,
  PresetName,
  ThinkingState,
} from 'benday';
import { SAMPLES } from './samples';
import type { Sample } from './samples';

/* ------------------------------------------------------------------ *
 * Primitives
 * ------------------------------------------------------------------ */

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white/70 dark:border-zinc-800 dark:bg-zinc-900/50 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="px-4 pt-3.5 pb-2 font-mono text-[10px] tracking-[0.14em] text-zinc-400 uppercase dark:text-zinc-500">
      {children}
    </h2>
  );
}

function Slider({
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
        <span className="text-[13px] text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className="font-mono text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 text-zinc-900 dark:text-zinc-100"
      />
      {hint && <p className="mt-1 text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">{hint}</p>}
    </label>
  );
}

function Segmented<T extends string>({
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
      <div className="mb-1.5 text-[13px] text-zinc-700 dark:text-zinc-300">{label}</div>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-md px-2.5 py-1 text-[12px] transition-colors ${
              value === o.value
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({
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
    <label className="flex cursor-pointer items-start justify-between gap-3 px-4 py-2">
      <span>
        <span className="text-[13px] text-zinc-700 dark:text-zinc-300">{label}</span>
        {hint && (
          <span className="mt-0.5 block text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">
            {hint}
          </span>
        )}
      </span>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`mt-0.5 h-[18px] w-[32px] shrink-0 rounded-full transition-colors ${
          value ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700'
        }`}
      >
        <span
          className={`block h-[14px] w-[14px] rounded-full bg-white transition-transform dark:bg-zinc-900 ${
            value ? 'translate-x-[16px]' : 'translate-x-[2px]'
          }`}
        />
      </button>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
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

/* ------------------------------------------------------------------ *
 * App
 * ------------------------------------------------------------------ */

const COLORS = [
  { label: 'Text', value: 'currentColor' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Rose', value: '#f43f5e' },
];

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const [source, setSource] = useState<Sample>(SAMPLES[0]);
  const [dragging, setDragging] = useState(false);

  // Bake options
  const [grid, setGrid] = useState(24);
  const [threshold, setThreshold] = useState(0.18);
  const [gamma, setGamma] = useState(1);
  const [dilate, setDilate] = useState(0);
  const [maskMode, setMaskMode] = useState<MaskMode>('auto');
  const [invert, setInvert] = useState(false);
  const [trim, setTrim] = useState(true);

  // Render options
  const [preset, setPreset] = useState<PresetName>('contour');
  const [state, setState] = useState<ThinkingState>('thinking');
  const [size, setSize] = useState(200);
  const [fitNatural, setFitNatural] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [dotScale, setDotScale] = useState(0.62);
  const [shape, setShape] = useState<DotShape>('circle');
  const [glow, setGlow] = useState(0);
  const [weight, setWeight] = useState(0.5);
  const [padding, setPadding] = useState(0.06);
  const [color, setColor] = useState('currentColor');
  const [paused, setPaused] = useState(false);

  const bakeOptions: BakeOptions = useMemo(
    () => ({ grid, threshold, gamma, dilate, maskMode, invert, trim }),
    [grid, threshold, gamma, dilate, maskMode, invert, trim]
  );

  const { dotMap, loading, error, elapsed } = useDotMap(source.src, bakeOptions);

  /* --- file intake --------------------------------------------------- */

  const ingest = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setSource({
        id: `upload-${file.name}-${file.size}`,
        label: file.name,
        note: `${file.type || 'unknown type'} · ${(file.size / 1024).toFixed(1)} KB`,
        src: String(reader.result),
      });
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    const over = (e: DragEvent) => {
      e.preventDefault();
      setDragging(true);
    };
    const leave = (e: DragEvent) => {
      if (e.relatedTarget === null) setDragging(false);
    };
    const drop = (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) ingest(file);
    };
    window.addEventListener('dragover', over);
    window.addEventListener('dragleave', leave);
    window.addEventListener('drop', drop);
    return () => {
      window.removeEventListener('dragover', over);
      window.removeEventListener('dragleave', leave);
      window.removeEventListener('drop', drop);
    };
  }, [ingest]);

  const fileInput = useRef<HTMLInputElement>(null);

  /* --- generated snippet --------------------------------------------- */

  const snippet = useMemo(() => {
    const bakeProps: string[] = [];
    if (grid !== 24) bakeProps.push(`grid: ${grid}`);
    if (threshold !== 0.18) bakeProps.push(`threshold: ${round(threshold)}`);
    if (gamma !== 1) bakeProps.push(`gamma: ${round(gamma)}`);
    if (dilate !== 0) bakeProps.push(`dilate: ${dilate}`);
    if (maskMode !== 'auto') bakeProps.push(`maskMode: '${maskMode}'`);
    if (invert) bakeProps.push(`invert: true`);
    if (!trim) bakeProps.push(`trim: false`);

    const props: string[] = [`src="/logo.svg"`];
    if (bakeProps.length) props.push(`bake={{ ${bakeProps.join(', ')} }}`);
    props.push(`preset="${preset}"`);
    if (state !== 'thinking') props.push(`state="${state}"`);
    if (size !== 64) props.push(`size={${size}}`);
    if (fitNatural) props.push(`fit="natural"`);
    if (speed !== 1) props.push(`speed={${round(speed)}}`);
    if (dotScale !== 0.62) props.push(`dotScale={${round(dotScale)}}`);
    if (shape !== 'circle') props.push(`shape="${shape}"`);
    if (glow !== 0) props.push(`glow={${round(glow)}}`);
    if (weight !== 0.5) props.push(`weight={${round(weight)}}`);
    if (padding !== 0.06) props.push(`padding={${round(padding)}}`);
    if (color !== 'currentColor') props.push(`color="${color}"`);

    return `<ThinkingLogo\n  ${props.join('\n  ')}\n/>`;
  }, [
    grid,
    threshold,
    gamma,
    dilate,
    maskMode,
    invert,
    trim,
    preset,
    state,
    size,
    fitNatural,
    speed,
    dotScale,
    shape,
    glow,
    weight,
    padding,
    color,
  ]);

  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  const downloadDots = () => {
    if (!dotMap) return;
    const blob = new Blob([JSON.stringify(dotMap)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${source.id}.dots.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shared = {
    dotMap: dotMap ?? undefined,
    preset,
    state,
    speed,
    dotScale,
    shape,
    glow,
    weight,
    padding,
    color,
    paused,
    fit: fitNatural ? ('natural' as const) : ('square' as const),
  };

  const tooFew = dotMap && dotMap.dots.length < 8;
  // Effective dot diameter at the current size — the number that decides
  // whether a grid setting survives at 20px or turns into grey fuzz.
  const dotPx = dotMap
    ? ((size * (1 - padding * 2)) / Math.max(dotMap.cols, dotMap.rows)) * dotScale
    : 0;
  const tooSmall = dotMap && dotPx < 1.6;

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm">
          <div className="rounded-xl border-2 border-dashed border-zinc-500 px-10 py-8 font-mono text-sm text-zinc-200">
            drop a logo — svg, png, jpg, webp
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1240px] px-5 py-6">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ThinkingLogo
              dotMap={dotMap ?? undefined}
              size={34}
              preset={preset}
              state="thinking"
              speed={speed}
              dotScale={0.6}
            />
            <div>
              <h1 className="font-mono text-[15px] font-medium tracking-tight">benday</h1>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                your logo, halftoned into a thinking indicator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInput.current?.click()}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-[12px] text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Upload logo
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) ingest(f);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-md border border-zinc-200 px-3 py-1.5 text-[12px] text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          {/* ---------------- Left column ---------------- */}
          <div className="flex flex-col gap-4">
            {/* Stage */}
            <Card className="overflow-hidden">
              <div className="flex min-h-[300px] items-center justify-center gap-10 px-6 py-10">
                {/* Source reference */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-[200px] w-[200px] items-center justify-center rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800/60">
                    <img
                      src={source.src}
                      alt="source"
                      className="max-h-full max-w-full object-contain dark:invert"
                    />
                  </div>
                  <span className="font-mono text-[10px] tracking-wider text-zinc-400 uppercase dark:text-zinc-600">
                    source
                  </span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex items-center justify-center rounded-lg"
                    style={{ minHeight: 200, minWidth: 200 }}
                  >
                    {error ? (
                      <p className="max-w-[220px] text-center text-[12px] text-rose-500">
                        {error.message}
                      </p>
                    ) : (
                      <ThinkingLogo {...shared} size={size} />
                    )}
                  </div>
                  <span className="font-mono text-[10px] tracking-wider text-zinc-400 uppercase dark:text-zinc-600">
                    {loading ? 'baking…' : 'dots'}
                  </span>
                </div>
              </div>

              {/* State + size strip */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <div className="flex gap-1">
                  {(['idle', 'thinking', 'done'] as ThinkingState[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setState(s)}
                      className={`rounded-md px-2.5 py-1 text-[12px] ${
                        state === s
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    onClick={() => setPaused(!paused)}
                    className={`ml-2 rounded-md px-2.5 py-1 text-[12px] ${
                      paused
                        ? 'bg-amber-500 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {paused ? 'paused' : 'pause'}
                  </button>
                </div>

                <div className="flex items-end gap-5">
                  {[64, 32, 20].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-1.5">
                      <ThinkingLogo {...shared} size={s} />
                      <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* In context */}
              <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <div className="flex items-center gap-2.5 text-[13px] text-zinc-500 dark:text-zinc-400">
                  <ThinkingLogo {...shared} size={18} />
                  <span>Searching the codebase for the auth middleware…</span>
                </div>
              </div>
            </Card>

            {/* Presets */}
            <Card>
              <SectionTitle>Preset</SectionTitle>
              <div className="grid grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-4">
                {PRESET_NAMES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPreset(p)}
                    title={PRESETS[p].description}
                    className={`flex flex-col items-center gap-2 rounded-lg border px-2 py-3 transition-colors ${
                      preset === p
                        ? 'border-zinc-900 bg-zinc-900/5 dark:border-zinc-100 dark:bg-zinc-100/5'
                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                    }`}
                  >
                    <ThinkingLogo
                      dotMap={dotMap ?? undefined}
                      size={46}
                      preset={p}
                      state="thinking"
                      speed={speed}
                      dotScale={dotScale}
                      shape={shape}
                      weight={weight}
                    />
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      {PRESETS[p].label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="px-4 pb-4 text-[12px] text-zinc-500 dark:text-zinc-400">
                {PRESETS[preset].description}
              </p>
            </Card>

            {/* Samples */}
            <Card>
              <SectionTitle>Source</SectionTitle>
              <div className="grid grid-cols-2 gap-2 px-4 pb-3 sm:grid-cols-4 lg:grid-cols-7">
                {SAMPLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSource(s)}
                    title={s.note}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors ${
                      source.id === s.id
                        ? 'border-zinc-900 dark:border-zinc-100'
                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                    }`}
                  >
                    <img
                      src={s.src}
                      alt={s.label}
                      className="h-9 w-full object-contain dark:invert"
                    />
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-500">{s.label}</span>
                  </button>
                ))}
              </div>
              <p className="px-4 pb-4 text-[12px] text-zinc-500 dark:text-zinc-400">
                {source.note} <span className="text-zinc-400 dark:text-zinc-600">· or drop your own file anywhere</span>
              </p>
            </Card>

            {/* Stats + code */}
            <Card>
              <div className="grid grid-cols-3 divide-x divide-zinc-200 sm:grid-cols-6 dark:divide-zinc-800">
                <Stat label="dots" value={dotMap?.dots.length ?? '—'} />
                <Stat label="grid" value={dotMap ? `${dotMap.cols}×${dotMap.rows}` : '—'} />
                <Stat
                  label="fill"
                  value={dotMap ? `${Math.round((dotMap.dots.length / dotMap.cells) * 100)}%` : '—'}
                />
                <Stat label="mask" value={dotMap?.maskMode ?? '—'} />
                <Stat
                  label="dot ⌀"
                  value={
                    dotMap ? (
                      <span className={tooSmall ? 'text-amber-500' : undefined}>
                        {dotPx.toFixed(1)}px
                      </span>
                    ) : (
                      '—'
                    )
                  }
                />
                <Stat label="bake" value={elapsed != null ? `${elapsed.toFixed(0)}ms` : '—'} />
              </div>
              {tooFew && (
                <p className="border-t border-zinc-200 px-4 py-2 text-[12px] text-amber-600 dark:border-zinc-800 dark:text-amber-500">
                  Almost nothing survived the threshold. Lower <code>threshold</code>, raise{' '}
                  <code>dilate</code>, or try <code>maskMode: luma</code>.
                </p>
              )}
              {tooSmall && !tooFew && (
                <p className="border-t border-zinc-200 px-4 py-2 text-[12px] text-amber-600 dark:border-zinc-800 dark:text-amber-500">
                  Dots are under 1.6px at this size — they will read as grey fuzz. Drop{' '}
                  <code>grid</code> to ~10 for a 20px indicator; bake a separate map per size.
                </p>
              )}
              <div className="border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 pt-3">
                  <span className="font-mono text-[10px] tracking-[0.14em] text-zinc-400 uppercase dark:text-zinc-500">
                    Usage
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadDots}
                      disabled={!dotMap}
                      className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      dots.json
                    </button>
                    <button
                      onClick={copy}
                      className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      {copied ? 'copied' : 'copy'}
                    </button>
                  </div>
                </div>
                <pre className="overflow-x-auto px-4 pt-2 pb-4 font-mono text-[11.5px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {snippet}
                </pre>
              </div>
            </Card>
          </div>

          {/* ---------------- Right column: controls ---------------- */}
          <div className="flex flex-col gap-4">
            <Card>
              <SectionTitle>Bake — image → dots</SectionTitle>
              <Slider
                label="Grid"
                value={grid}
                min={6}
                max={64}
                step={1}
                onChange={setGrid}
                format={(v) => `${v} dots`}
                hint="Dots across the longest side."
              />
              <Slider
                label="Threshold"
                value={threshold}
                min={0.02}
                max={0.8}
                step={0.01}
                onChange={setThreshold}
                format={round}
                hint="Ink coverage a cell needs to become a dot."
              />
              <Slider
                label="Gamma"
                value={gamma}
                min={0.3}
                max={2.5}
                step={0.05}
                onChange={setGamma}
                format={round}
                hint="Below 1 boosts faint ink."
              />
              <Slider
                label="Dilate"
                value={dilate}
                min={0}
                max={8}
                step={1}
                onChange={setDilate}
                format={(v) => `${v}px`}
                hint="Grows the mask. The fix for hairline strokes."
              />
              <Segmented
                label="Mask mode"
                value={maskMode}
                onChange={setMaskMode}
                options={[
                  { value: 'auto', label: 'auto' },
                  { value: 'alpha', label: 'alpha' },
                  { value: 'luma', label: 'luma' },
                ]}
              />
              <Toggle
                label="Invert"
                value={invert}
                onChange={setInvert}
                hint="Light ink on a dark background (luma mode)."
              />
              <Toggle label="Trim to content" value={trim} onChange={setTrim} />
              <div className="h-2" />
            </Card>

            <Card>
              <SectionTitle>Render</SectionTitle>
              <Slider
                label="Size"
                value={size}
                min={16}
                max={320}
                step={2}
                onChange={setSize}
                format={(v) => `${v}px`}
              />
              <Slider
                label="Speed"
                value={speed}
                min={0.1}
                max={3}
                step={0.05}
                onChange={setSpeed}
                format={(v) => `${round(v)}×`}
              />
              <Slider
                label="Dot scale"
                value={dotScale}
                min={0.15}
                max={1.3}
                step={0.01}
                onChange={setDotScale}
                format={round}
                hint="Dot diameter as a fraction of the cell."
              />
              <Slider
                label="Coverage weight"
                value={weight}
                min={0}
                max={1}
                step={0.01}
                onChange={setWeight}
                format={round}
                hint="How much ink coverage drives dot size."
              />
              <Slider
                label="Glow"
                value={glow}
                min={0}
                max={1}
                step={0.02}
                onChange={setGlow}
                format={round}
              />
              <Slider
                label="Padding"
                value={padding}
                min={0}
                max={0.3}
                step={0.01}
                onChange={setPadding}
                format={round}
              />
              <Segmented
                label="Dot shape"
                value={shape}
                onChange={setShape}
                options={[
                  { value: 'circle', label: 'circle' },
                  { value: 'square', label: 'square' },
                  { value: 'diamond', label: 'diamond' },
                ]}
              />
              <Segmented
                label="Color"
                value={color}
                onChange={setColor}
                options={COLORS.map((c) => ({ value: c.value, label: c.label }))}
              />
              <Toggle
                label="Natural aspect"
                value={fitNatural}
                onChange={setFitNatural}
                hint="Size the canvas to the mark instead of a square box."
              />
              <div className="h-2" />
            </Card>
          </div>
        </div>

        <footer className="mt-8 pb-6 text-center text-[11px] text-zinc-400 dark:text-zinc-600">
          Mask → EDT → grid sample → canvas. Respects{' '}
          <code className="font-mono">prefers-reduced-motion</code>; pauses off-screen.
        </footer>
      </div>
    </div>
  );
}

function round(v: number): string {
  return String(Math.round(v * 100) / 100);
}
