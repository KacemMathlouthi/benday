/// <reference types="bun" />

import { describe, expect, test } from "bun:test";

import { PRESET_NAMES, PRESETS, makeFrame } from "./presets";
import type { DotContext, DotFrame } from "./types";

const contexts: DotContext[] = [
  {
    angle: 0,
    cols: 31,
    d: 0,
    i: 0,
    n: 80,
    nx: 0,
    ny: 0,
    r: 0,
    rand: 0,
    rows: 7,
    t: 0,
    v: 0.2,
    x: 0.5,
    y: 0.5,
  },
  {
    angle: -2.42,
    cols: 31,
    d: 0.47,
    i: 37,
    n: 80,
    nx: -0.82,
    ny: -0.72,
    r: 0.77,
    rand: 0.618,
    rows: 7,
    t: 0.42,
    v: 0.68,
    x: 0.09,
    y: 0.14,
  },
  {
    angle: 0.69,
    cols: 31,
    d: 1,
    i: 79,
    n: 80,
    nx: 0.9,
    ny: 0.74,
    r: 0.82,
    rand: 0.997,
    rows: 7,
    t: 1,
    v: 1,
    x: 0.95,
    y: 0.87,
  },
];

const times = [0, 0.37, 2.4, 19.8];

describe("presets", () => {
  test("ships 21 distinct named motions", () => {
    expect(PRESET_NAMES).toHaveLength(21);
    expect(new Set(PRESET_NAMES).size).toBe(PRESET_NAMES.length);
    expect(PRESET_NAMES.toSorted().join(",")).toBe(
      Object.keys(PRESETS).toSorted().join(",")
    );
  });

  test("writes a complete finite frame for arbitrary logo geometry", () => {
    for (const name of PRESET_NAMES) {
      for (const context of contexts) {
        for (const time of times) {
          const frame: DotFrame = {
            a: Number.NaN,
            dx: Number.NaN,
            dy: Number.NaN,
            s: Number.NaN,
          };
          PRESETS[name].fn(context, time, frame);

          expect(Object.values(frame).every(Number.isFinite)).toBe(true);
          expect(frame.a).toBeGreaterThanOrEqual(0);
          expect(frame.a).toBeLessThanOrEqual(1);
          expect(frame.s).toBeGreaterThan(0);
        }
      }
    }
  });

  test("creates a neutral reusable frame", () => {
    expect(makeFrame()).toEqual({ a: 1, dx: 0, dy: 0, s: 1 });
  });
});
