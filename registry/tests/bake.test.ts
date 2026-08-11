/// <reference types="bun" />

import { afterEach, describe, expect, test } from "bun:test";

import { bake } from "../ui/benday/bake";
import type { BakeOptions, Dot, DotMap } from "../ui/benday/types";

interface Pixels {
  data: Uint8ClampedArray;
  height: number;
  width: number;
}

type Paint = (
  x: number,
  y: number
) => readonly [number, number, number, number];

const TRANSPARENT = [0, 0, 0, 0] as const;
const SIZE = 64;
/** The inset of every authored mark, so trimming always has something to cut. */
const INSET = 8;

const inside = (x: number, y: number) =>
  x >= INSET && x < SIZE - INSET && y >= INSET && y < SIZE - INSET;

/** Author a source image pixel by pixel, the way a designer's export arrives. */
function image(paint: Paint): Pixels {
  const data = new Uint8ClampedArray(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const [r, g, b, a] = paint(x, y);
      const i = (y * SIZE + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }
  return { data, height: SIZE, width: SIZE };
}

/** A grey, opaque, and only inside the inset mark. */
const layer =
  (level: (x: number) => number): Paint =>
  (x, y) =>
    inside(x, y) ? [level(x), level(x), level(x), 255] : TRANSPARENT;

/**
 * The smallest canvas and Image that `rasterize` can work through. `drawImage`
 * is a no-op because the stub hands back the authored pixels directly — which
 * holds only while the working size matches the source, as `bakeImage` ensures.
 */
function install(pixels: Pixels): () => void {
  const context = {
    drawImage: () => null,
    getImageData: () => ({
      data: pixels.data,
      height: pixels.height,
      width: pixels.width,
    }),
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "high",
  };

  globalThis.document = {
    createElement: () => ({ getContext: () => context, height: 0, width: 0 }),
  } as unknown as Document;

  globalThis.Image = class {
    crossOrigin = "";
    naturalHeight = pixels.height;
    naturalWidth = pixels.width;
    #onLoad: (() => void)[] = [];
    #src = "";

    addEventListener(type: string, listener: () => void) {
      if (type === "load") {
        this.#onLoad.push(listener);
      }
    }

    get src() {
      return this.#src;
    }

    // Assigning src is what starts a real decode; here it just resolves.
    set src(value: string) {
      this.#src = value;
      for (const listener of this.#onLoad) {
        listener();
      }
    }
  } as unknown as typeof Image;

  return () => {
    globalThis.document = undefined as unknown as Document;
    globalThis.Image = undefined as unknown as typeof Image;
  };
}

let restore: (() => void) | null = null;

afterEach(() => {
  restore?.();
  restore = null;
});

/**
 * Pin `workingSize` to the source so no rescale sits between the authored
 * pixels and the mask, and the assertions can name exact cells.
 */
function bakeImage(pixels: Pixels, options: BakeOptions = {}): Promise<DotMap> {
  restore = install(pixels);
  return bake("stub://logo.png", { workingSize: SIZE, ...options });
}

function dotAt(map: DotMap, col: number, row: number): Dot {
  const dot = map.dots.find((d) => d.col === col && d.row === row);
  if (!dot) {
    throw new Error(`no dot at ${col},${row}`);
  }
  return dot;
}

describe("bake", () => {
  test("separates ink from transparency and trims to the mark", async () => {
    // A wide block in the corner: the frame is square, the mark is not.
    const map = await bakeImage(
      image((x, y) => (x < 32 && y < 16 ? [0, 0, 0, 255] : TRANSPARENT)),
      { grid: 8 }
    );

    expect(map.maskMode).toBe("alpha");
    expect(map.aspect).toBeCloseTo(2, 5);
    expect(map.cols).toBe(8);
    expect(map.rows).toBe(4);
    expect(map.dots).toHaveLength(map.cells);
    expect(map.dots.every((dot) => dot.v > 0.99)).toBe(true);
  });

  test("keeps the whole frame when trimming is off", async () => {
    const map = await bakeImage(
      image((x, y) => (x < 32 && y < 16 ? [0, 0, 0, 255] : TRANSPARENT)),
      { grid: 8, trim: false }
    );

    expect(map.aspect).toBeCloseTo(1, 5);
    expect(map.cols).toBe(8);
    expect(map.rows).toBe(8);
    // Only the top-left quarter carries ink.
    expect(map.dots.length).toBeLessThan(map.cells);
    expect(map.dots.every((dot) => dot.row < 2)).toBe(true);
  });

  test("falls back to a luminance mask for an opaque source", async () => {
    // No soft pixels anywhere, so alpha carries no information about the mark.
    const map = await bakeImage(
      image((x, y) => (inside(x, y) ? [0, 0, 0, 255] : [255, 255, 255, 255])),
      { grid: 8 }
    );

    expect(map.maskMode).toBe("luma");
    expect(map.aspect).toBeCloseTo(1, 5);
    expect(map.dots).toHaveLength(map.cells);
    expect(map.dots.every((dot) => dot.v > 0.99)).toBe(true);
  });

  test("reads the darker layer as the stronger one in dark artwork", async () => {
    // Two opaque layers on transparency — black mark, mid-grey secondary.
    const map = await bakeImage(image(layer((x) => (x < SIZE / 2 ? 0 : 128))), {
      grid: 8,
    });

    expect(dotAt(map, 0, 4).t).toBeCloseTo(1, 5);
    // Clearly the weaker layer, but not slammed onto the floor: half the
    // luminance range apart should read as roughly half the tone.
    expect(dotAt(map, 7, 4).t).toBeGreaterThan(0.2);
    expect(dotAt(map, 7, 4).t).toBeLessThan(0.6);
  });

  test("reads the lighter layer as the stronger one in light artwork", async () => {
    // The same geometry inverted: white ink, grey secondary. A dark-mode export.
    const map = await bakeImage(
      image(layer((x) => (x < SIZE / 2 ? 255 : 150))),
      { grid: 8 }
    );

    expect(dotAt(map, 0, 4).t).toBeCloseTo(1, 5);
    expect(dotAt(map, 7, 4).t).toBeGreaterThan(0.3);
    expect(dotAt(map, 7, 4).t).toBeLessThan(0.75);
  });

  test("does not separate two inks of the same visual weight", async () => {
    // A blue and a red that differ by nineteen luminance levels. Normalizing to
    // the source's own range used to stretch that into the full tonal range,
    // painting one half of the mark at six times the area of the other.
    const map = await bakeImage(
      image((x, y) => {
        if (!inside(x, y)) {
          return TRANSPARENT;
        }
        return x < SIZE / 2 ? [59, 130, 246, 255] : [239, 68, 68, 255];
      }),
      { grid: 8 }
    );

    const left = dotAt(map, 0, 4).t;
    const right = dotAt(map, 7, 4).t;
    expect(Math.abs(left - right)).toBeLessThan(0.1);
    expect(Math.min(left, right)).toBeGreaterThan(0.9);
  });

  test("still separates artwork that is genuinely layered", async () => {
    // Black through to near-white across the mark: real tonal range, kept.
    const map = await bakeImage(
      image(layer((x) => Math.round(((x - INSET) / (SIZE - INSET * 2)) * 255))),
      { grid: 8 }
    );

    expect(dotAt(map, 0, 4).t).toBeCloseTo(1, 1);
    expect(dotAt(map, 7, 4).t).toBeLessThan(0.15);
  });

  test("holds one flat layer at full tone", async () => {
    // Nothing to separate: a single ink colour must not be read as half-strength.
    const map = await bakeImage(image(layer(() => 20)), { grid: 8 });

    expect(map.dots.every((dot) => dot.t === 1)).toBe(true);
  });

  test("measures depth from the outline inward and normalizes it", async () => {
    const map = await bakeImage(image(layer(() => 0)), { grid: 8 });

    expect(dotAt(map, 4, 4).d).toBeGreaterThan(dotAt(map, 0, 0).d);
    expect(Math.max(...map.dots.map((dot) => dot.d))).toBeCloseTo(1, 5);
    expect(Math.min(...map.dots.map((dot) => dot.d))).toBeGreaterThanOrEqual(0);
  });

  test("drops cells below the coverage threshold", async () => {
    // Every other column is ink, so each cell lands at half coverage.
    const striped = image((x, y) =>
      inside(x, y) && x % 2 === 0 ? [0, 0, 0, 255] : TRANSPARENT
    );

    // Cells straddle the stripe by a pixel either way, so coverage lands near
    // a half rather than exactly on it.
    const kept = await bakeImage(striped, { grid: 8, threshold: 0.35 });
    expect(kept.dots).toHaveLength(kept.cells);
    expect(kept.dots.every((dot) => dot.v >= 0.4 && dot.v <= 0.6)).toBe(true);

    const dropped = await bakeImage(striped, { grid: 8, threshold: 0.65 });
    expect(dropped.dots).toHaveLength(0);
  });

  test("rescues a hairline stroke by dilating the mask", async () => {
    // A one-pixel rule. Trimming off, so the cell stays 8px tall and the
    // hairline stays the 1/8 coverage that the default threshold rejects.
    const hairline = image((_x, y) =>
      y === 32 ? [0, 0, 0, 255] : TRANSPARENT
    );

    const bare = await bakeImage(hairline, { grid: 8, trim: false });
    expect(bare.dots).toHaveLength(0);

    const rescued = await bakeImage(hairline, {
      dilate: 3,
      grid: 8,
      trim: false,
    });
    expect(rescued.dots.length).toBeGreaterThan(0);
  });

  test("survives a source with no ink at all", async () => {
    const map = await bakeImage(
      image(() => TRANSPARENT),
      { grid: 8 }
    );

    expect(map.dots).toHaveLength(0);
    expect(map.cols).toBe(8);
    expect(map.rows).toBe(8);
    expect(Number.isFinite(map.aspect)).toBe(true);
  });
});
