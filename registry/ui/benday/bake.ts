import type {
  BakeOptions,
  Dot,
  DotMap,
  MaskMode,
  ResolvedBakeOptions,
} from "./types";

export const DEFAULT_BAKE: Omit<ResolvedBakeOptions, "workingSize"> = {
  dilate: 0,
  gamma: 1,
  grid: 24,
  invert: false,
  maskMode: "auto",
  threshold: 0.18,
  trim: true,
};

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const clamp01 = (v: number) => clamp(v, 0, 1);

function smoothstep(edge0: number, edge1: number, value: number): number {
  const x = clamp01((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

/** Luminance spread, in levels, over which layers go from flat to fully separated. */
const TONE_SPREAD_MIN = 16;
const TONE_SPREAD_FULL = 200;

export function resolveBakeOptions(
  options: BakeOptions = {}
): ResolvedBakeOptions {
  const merged = { ...DEFAULT_BAKE, ...stripUndefined(options) };
  const workingSize =
    options.workingSize ?? clamp(Math.round(merged.grid * 16), 192, 768);
  return { ...merged, workingSize };
}

function stripUndefined<T extends object>(o: T): Partial<T> {
  const out: Partial<T> = {};
  for (const k of Object.keys(o) as (keyof T)[]) {
    if (o[k] !== undefined) {
      out[k] = o[k];
    }
  }
  return out;
}

export type BakeSource = string | Blob | HTMLImageElement | ImageBitmap;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.addEventListener("load", () => resolve(img), { once: true });
    img.addEventListener(
      "error",
      () => reject(new Error(`benday: failed to load image "${src}"`)),
      { once: true }
    );
    img.src = src;
  });
}

/**
 * Rasterize at `workingSize` (longest side). SVGs go straight to the target
 * size — vectors rasterize cleanly at any scale, so no intermediate pass.
 */
async function rasterize(
  source: BakeSource,
  workingSize: number
): Promise<{ data: ImageData; width: number; height: number }> {
  let el: CanvasImageSource;
  let iw = 0;
  let ih = 0;
  let revoke: string | undefined;

  try {
    if (typeof source === "string") {
      const img = await loadImage(source);
      el = img;
      iw = img.naturalWidth || img.width;
      ih = img.naturalHeight || img.height;
    } else if (
      typeof ImageBitmap !== "undefined" &&
      source instanceof ImageBitmap
    ) {
      el = source;
      iw = source.width;
      ih = source.height;
    } else if (source instanceof Blob) {
      revoke = URL.createObjectURL(source);
      const img = await loadImage(revoke);
      el = img;
      iw = img.naturalWidth || img.width;
      ih = img.naturalHeight || img.height;
    } else {
      const img = source as HTMLImageElement;
      el = img;
      iw = img.naturalWidth || img.width;
      ih = img.naturalHeight || img.height;
    }

    // SVGs with only a viewBox report 0×0 in some browsers.
    if (!iw || !ih) {
      iw = 1024;
      ih = 1024;
    }

    const scale = workingSize / Math.max(iw, ih);
    const width = Math.max(1, Math.round(iw * scale));
    const height = Math.max(1, Math.round(ih * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      throw new Error("benday: could not acquire a 2D context");
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(el, 0, 0, width, height);

    let data: ImageData;
    try {
      data = ctx.getImageData(0, 0, width, height);
    } catch {
      throw new Error(
        "benday: the image tainted the canvas (cross-origin without CORS headers)"
      );
    }
    return { data, height, width };
  } finally {
    if (revoke) {
      URL.revokeObjectURL(revoke);
    }
  }
}

const luma = (r: number, g: number, b: number) =>
  (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

function hasAlpha(px: Uint8ClampedArray): boolean {
  // A handful of soft edge pixels is enough; a fully opaque photo has none.
  let soft = 0;
  for (let i = 3; i < px.length; i += 4) {
    if (px[i] < 250) {
      soft++;
      if (soft > 8) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Ink coverage per pixel, 0 = background, 1 = solid ink. Luma mode reads the
 * corners for a background level, then measures each pixel's departure.
 */
function buildCoverage(
  img: ImageData,
  width: number,
  height: number,
  mode: "alpha" | "luma",
  invert: boolean
): Float32Array {
  const px = img.data;
  const cov = new Float32Array(width * height);

  if (mode === "alpha") {
    for (let i = 0, p = 0; p < cov.length; i += 4, p++) {
      cov[p] = px[i + 3] / 255;
    }
    return cov;
  }

  const corners = [
    0,
    (width - 1) * 4,
    (height - 1) * width * 4,
    ((height - 1) * width + width - 1) * 4,
  ];
  const cornerLuma = corners
    .map((i) => luma(px[i], px[i + 1], px[i + 2]))
    .toSorted((a, b) => a - b);
  let bg = (cornerLuma[1] + cornerLuma[2]) / 2; // median of four
  let bgIsLight = bg > 0.5;
  if (invert) {
    bgIsLight = !bgIsLight;
  }
  // Guard against a background that sits mid-grey, which would leave no headroom.
  const span = Math.max(0.12, bgIsLight ? bg : 1 - bg);
  if (!bgIsLight) {
    bg = Math.min(bg, 1 - span);
  }

  for (let i = 0, p = 0; p < cov.length; i += 4, p++) {
    const l = luma(px[i], px[i + 1], px[i + 2]);
    const ink = bgIsLight ? bg - l : l - bg;
    // Transparent regions in a luma-mode image still read as background.
    cov[p] = clamp01(ink / span) * (px[i + 3] / 255);
  }
  return cov;
}

/**
 * Preserve visible layers independently from silhouette coverage. Alpha tells
 * us where artwork exists, but not whether one opaque region is lighter than
 * another. A robust visible-pixel range turns that source contrast into a
 * separate 0..1 tone channel. Uniform artwork stays at full tone.
 */
function buildTone(img: ImageData, cov: Float32Array): Float32Array {
  const px = img.data;
  const histogram = new Float64Array(256);
  let total = 0;
  let luminanceSum = 0;

  for (let i = 0, p = 0; p < cov.length; i += 4, p++) {
    const coverage = cov[p];
    if (coverage <= 0.02) {
      continue;
    }
    const level = Math.round(luma(px[i], px[i + 1], px[i + 2]) * 255);
    histogram[level] += coverage;
    luminanceSum += level * coverage;
    total += coverage;
  }

  const tone = new Float32Array(cov.length);
  if (total === 0) {
    return tone;
  }

  const low = histogramPercentile(histogram, total, 0.08);
  const high = histogramPercentile(histogram, total, 0.92);
  const span = high - low;

  // Stretching the source's own range to a full 0..1 manufactures contrast: two
  // brand colours a few levels apart came out one at full strength and one on
  // the floor. Apply the range in proportion to the separation that is there.
  const separation = smoothstep(TONE_SPREAD_MIN, TONE_SPREAD_FULL, span);
  if (separation <= 0) {
    for (let p = 0; p < cov.length; p++) {
      tone[p] = cov[p] > 0.02 ? 1 : 0;
    }
    return tone;
  }

  // White artwork on transparency is as common as black artwork. Let the
  // dominant half of the source decide which end of its range is strongest.
  const lightIsStrong = luminanceSum / total > 140;
  for (let i = 0, p = 0; p < cov.length; i += 4, p++) {
    if (cov[p] <= 0.02) {
      continue;
    }
    const level = luma(px[i], px[i + 1], px[i + 2]) * 255;
    const normalized = clamp01(
      lightIsStrong ? (level - low) / span : (high - level) / span
    );
    tone[p] = 1 - separation * (1 - normalized);
  }
  return tone;
}

function histogramPercentile(
  histogram: Float64Array,
  total: number,
  percentile: number
): number {
  const target = total * percentile;
  let seen = 0;
  for (let i = 0; i < histogram.length; i++) {
    seen += histogram[i];
    if (seen >= target) {
      return i;
    }
  }
  return histogram.length - 1;
}

/** Separable box dilation — grows the mask to rescue hairline strokes. */
function dilateCoverage(
  cov: Float32Array,
  width: number,
  height: number,
  r: number
): Float32Array {
  if (r <= 0) {
    return cov;
  }
  const radius = Math.round(r);
  const tmp = new Float32Array(cov.length);
  const out = new Float32Array(cov.length);

  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      let m = 0;
      const lo = Math.max(0, x - radius);
      const hi = Math.min(width - 1, x + radius);
      for (let k = lo; k <= hi; k++) {
        if (cov[row + k] > m) {
          m = cov[row + k];
        }
      }
      tmp[row + x] = m;
    }
  }
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let m = 0;
      const lo = Math.max(0, y - radius);
      const hi = Math.min(height - 1, y + radius);
      for (let k = lo; k <= hi; k++) {
        const v = tmp[k * width + x];
        if (v > m) {
          m = v;
        }
      }
      out[y * width + x] = m;
    }
  }
  return out;
}

const INF = 1e20;

/** 1D squared distance transform of a sampled function, in place-ish. */
function edt1d(
  f: Float64Array,
  d: Float64Array,
  v: Int32Array,
  z: Float64Array,
  n: number
): void {
  let k = 0;
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) {
      k++;
    }
    const dq = q - v[k];
    d[q] = dq * dq + f[v[k]];
  }
}

/**
 * Exact distance from each inside pixel to the nearest outside one, after
 * Felzenszwalb & Huttenlocher: O(n), and true distance a ripple can order by.
 */
function distanceTransform(
  mask: Uint8Array,
  width: number,
  height: number
): { dist: Float32Array; max: number } {
  const grid = new Float64Array(width * height);
  for (let i = 0; i < grid.length; i++) {
    grid[i] = mask[i] ? INF : 0;
  }

  const n = Math.max(width, height);
  const f = new Float64Array(n);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);

  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      f[x] = grid[row + x];
    }
    edt1d(f, d, v, z, width);
    for (let x = 0; x < width; x++) {
      grid[row + x] = d[x];
    }
  }
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      f[y] = grid[y * width + x];
    }
    edt1d(f, d, v, z, height);
    for (let y = 0; y < height; y++) {
      grid[y * width + x] = d[y];
    }
  }

  const dist = new Float32Array(width * height);
  let max = 0;
  for (let i = 0; i < dist.length; i++) {
    const val = Math.sqrt(grid[i]);
    dist[i] = val;
    if (val > max) {
      max = val;
    }
  }
  return { dist, max };
}

interface ContentBounds {
  minX: number;
  minY: number;
  boxW: number;
  boxH: number;
}

/** Which masking strategy to run, resolving `auto` against the pixels. */
function resolveMaskMode(
  mode: MaskMode,
  pixels: Uint8ClampedArray
): "alpha" | "luma" {
  if (mode !== "auto") {
    return mode;
  }
  return hasAlpha(pixels) ? "alpha" : "luma";
}

/** Bounding box of the ink; the full frame if trimming is off or it is empty. */
function findContentBounds(
  cov: Float32Array,
  width: number,
  height: number,
  trim: boolean
): ContentBounds {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  if (trim) {
    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        if (cov[row + x] > 0.06) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { boxH: height, boxW: width, minX: 0, minY: 0 };
  }
  return {
    boxH: maxY - minY + 1,
    boxW: maxX - minX + 1,
    minX,
    minY,
  };
}

/** Mean coverage and coverage-weighted depth per cell. */
function sampleDots(
  cov: Float32Array,
  tone: Float32Array,
  dist: Float32Array,
  width: number,
  height: number,
  bounds: ContentBounds,
  cols: number,
  rows: number,
  threshold: number
): Dot[] {
  const cellW = bounds.boxW / cols;
  const cellH = bounds.boxH / rows;
  const dots: Dot[] = [];

  for (let row = 0; row < rows; row++) {
    const y0 = Math.floor(bounds.minY + row * cellH);
    const y1 = Math.max(y0 + 1, Math.floor(bounds.minY + (row + 1) * cellH));

    for (let col = 0; col < cols; col++) {
      const x0 = Math.floor(bounds.minX + col * cellW);
      const x1 = Math.max(x0 + 1, Math.floor(bounds.minX + (col + 1) * cellW));

      let sum = 0;
      let count = 0;
      let weightedDepth = 0;
      let weightedTone = 0;

      for (let y = y0; y < y1 && y < height; y++) {
        const r = y * width;
        for (let x = x0; x < x1 && x < width; x++) {
          sum += cov[r + x];
          weightedDepth += dist[r + x] * cov[r + x];
          weightedTone += tone[r + x] * cov[r + x];
          count++;
        }
      }

      if (count === 0) {
        continue;
      }
      const v = sum / count;
      if (v < threshold) {
        continue;
      }

      dots.push({
        col,
        d: sum > 0 ? weightedDepth / sum : 0,
        row,
        t: sum > 0 ? weightedTone / sum : 1,
        v: clamp01(v),
        x: (col + 0.5) / cols,
        y: (row + 0.5) / rows,
      });
    }
  }

  return dots;
}

/**
 * Normalize against the deepest sampled dot, not the deepest pixel: a hairline
 * mark would otherwise flatten `d` to zero and leave depth presets inert.
 */
function normalizeDepth(dots: Dot[]): void {
  let maxDepth = 0;
  for (const dot of dots) {
    maxDepth = Math.max(maxDepth, dot.d);
  }
  for (const dot of dots) {
    dot.d = maxDepth > 0 ? clamp01(dot.d / maxDepth) : 0;
  }
}

/**
 * Turn an image into a {@link DotMap}. Browser-only: it goes via a canvas. Run
 * it at build time and ship the JSON, or at runtime for any-logo drop-in.
 */
export async function bake(
  source: BakeSource,
  options: BakeOptions = {}
): Promise<DotMap> {
  const opts = resolveBakeOptions(options);
  const { data, width, height } = await rasterize(source, opts.workingSize);
  const mode = resolveMaskMode(opts.maskMode, data.data);

  let cov = buildCoverage(data, width, height, mode, opts.invert);
  const tone = buildTone(data, cov);
  if (opts.gamma !== 1) {
    const g = Math.max(0.05, opts.gamma);
    for (let i = 0; i < cov.length; i++) {
      cov[i] **= g;
    }
  }
  cov = dilateCoverage(cov, width, height, opts.dilate);

  // Binary mask for the distance transform. A low fixed cut keeps antialiased
  // edges inside the shape so the EDT measures the stroke, not the core.
  const mask = new Uint8Array(cov.length);
  for (let i = 0; i < cov.length; i++) {
    mask[i] = cov[i] > 0.5 ? 1 : 0;
  }

  const bounds = findContentBounds(cov, width, height, opts.trim);
  const { dist } = distanceTransform(mask, width, height);

  // Grid the content box so the longest side gets `grid` cells.
  const longest = Math.max(bounds.boxW, bounds.boxH);
  const cols = Math.max(1, Math.round((bounds.boxW / longest) * opts.grid));
  const rows = Math.max(1, Math.round((bounds.boxH / longest) * opts.grid));

  const dots = sampleDots(
    cov,
    tone,
    dist,
    width,
    height,
    bounds,
    cols,
    rows,
    opts.threshold
  );
  normalizeDepth(dots);

  return {
    aspect: bounds.boxW / bounds.boxH,
    cells: cols * rows,
    cols,
    dots,
    maskMode: mode,
    rows,
  };
}

const cache = new Map<string, Promise<DotMap>>();

/** Cache key for a (source, options) pair. Only string sources are cacheable. */
export function bakeKey(src: string, options: BakeOptions = {}): string {
  const o = resolveBakeOptions(options);
  return [
    src,
    o.grid,
    o.threshold,
    o.gamma,
    o.maskMode,
    o.invert ? 1 : 0,
    o.dilate,
    o.trim ? 1 : 0,
    o.workingSize,
  ].join("|");
}

/** A failed bake must not stay cached, or the error is permanent. */
async function bakeAndForgetOnFailure(
  key: string,
  src: string,
  options: BakeOptions
): Promise<DotMap> {
  try {
    return await bake(src, options);
  } catch (error) {
    cache.delete(key);
    throw error;
  }
}

/** {@link bake}, memoized per (url, options). */
export function bakeCached(
  src: string,
  options: BakeOptions = {}
): Promise<DotMap> {
  const key = bakeKey(src, options);
  let hit = cache.get(key);
  if (!hit) {
    hit = bakeAndForgetOnFailure(key, src, options);
    cache.set(key, hit);
  }
  return hit;
}

export function clearBakeCache(): void {
  cache.clear();
}
