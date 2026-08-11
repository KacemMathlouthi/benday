/// <reference types="bun" />

import { describe, expect, test } from "bun:test";

import { createRenderer } from "../ui/benday/renderer";
import type { DotMap, DotShape } from "../ui/benday/types";

let pendingFrame: FrameRequestCallback | null = null;
globalThis.cancelAnimationFrame = () => {
  pendingFrame = null;
};
globalThis.requestAnimationFrame = (callback) => {
  pendingFrame = callback;
  return 1;
};

interface Paint {
  alpha: number;
  blur: number;
  radius: number;
  shape: DotShape;
}

function makeCanvas() {
  const paints: Paint[] = [];
  let alpha = 1;
  let blur = 0;
  let pathRadius = 0;
  let pathShape: DotShape = "diamond";

  const context = {
    arc: (_x: number, _y: number, radius: number) => {
      pathRadius = radius;
      pathShape = "circle";
    },
    beginPath: () => {
      pathRadius = 0;
      pathShape = "diamond";
    },
    clearRect: () => null,
    closePath: () => null,
    fill: () => {
      paints.push({ alpha, blur, radius: pathRadius, shape: pathShape });
    },
    fillRect: (_x: number, _y: number, width: number) => {
      paints.push({ alpha, blur, radius: width / 2, shape: "square" });
    },
    fillStyle: "",
    get globalAlpha() {
      return alpha;
    },
    set globalAlpha(value: number) {
      alpha = value;
    },
    lineTo: (_x: number, y: number) => {
      pathRadius = Math.max(pathRadius, Math.abs(y));
    },
    moveTo: (_x: number, y: number) => {
      pathRadius = Math.abs(y);
    },
    setTransform: () => null,
    get shadowBlur() {
      return blur;
    },
    set shadowBlur(value: number) {
      blur = value;
    },
    shadowColor: "",
  };
  const canvas = {
    getContext: () => context,
    height: 0,
    style: { height: "", width: "" },
    width: 0,
  } as unknown as HTMLCanvasElement;

  return { canvas, paints };
}

function fullMap(cols: number, rows: number, aspect = cols / rows): DotMap {
  const dots = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      dots.push({
        col,
        d: 1,
        row,
        t: 1,
        v: 1,
        x: (col + 0.5) / cols,
        y: (row + 0.5) / rows,
      });
    }
  }
  return {
    aspect,
    cells: cols * rows,
    cols,
    dots,
    maskMode: "alpha",
    rows,
  };
}

const staticOptions = {
  color: "#000",
  padding: 0,
  reducedMotion: true,
  state: "done" as const,
};

describe("registry renderer fidelity", () => {
  test("represents coverage through area without fading the dot twice", () => {
    const { canvas, paints } = makeCanvas();
    const map = fullMap(1, 1);
    map.dots[0] = { ...map.dots[0], d: 1, v: 0.25 };

    createRenderer(canvas, {
      ...staticOptions,
      dotMap: map,
      dotScale: 1,
      size: 100,
      weight: 1,
    });

    expect(paints).toHaveLength(1);
    expect(paints[0]?.radius).toBeCloseTo(25, 0);
    expect(paints[0]?.alpha).toBe(1);
  });

  test("keeps opaque source layers visibly distinct", () => {
    const { canvas, paints } = makeCanvas();
    const map = fullMap(2, 1);
    map.dots[0] = { ...map.dots[0], t: 0 };
    map.dots[1] = { ...map.dots[1], t: 1 };

    createRenderer(canvas, {
      ...staticOptions,
      dotMap: map,
      dotScale: 1,
      size: 100,
      weight: 1,
    });

    expect(paints).toHaveLength(2);
    expect(paints[1]?.radius ?? 0).toBeGreaterThan(
      (paints[0]?.radius ?? 0) * 2
    );
  });

  test("uses distance from the outline to create restrained tonal depth", () => {
    const { canvas, paints } = makeCanvas();
    const map = fullMap(2, 1);
    map.dots[0] = { ...map.dots[0], d: 0, v: 0.5 };
    map.dots[1] = { ...map.dots[1], d: 1, v: 0.5 };

    createRenderer(canvas, {
      ...staticOptions,
      dotMap: map,
      dotScale: 1,
      size: 100,
      weight: 1,
    });

    expect(paints).toHaveLength(2);
    expect(paints[1]?.radius).toBeGreaterThan(paints[0]?.radius ?? 0);
  });

  test("consolidates an over-dense map at small CSS sizes", () => {
    const { canvas, paints } = makeCanvas();

    createRenderer(canvas, {
      ...staticOptions,
      dotMap: fullMap(24, 24),
      size: 20,
    });

    expect(paints).toHaveLength(10 * 10);
  });

  test("keeps a small animated mark legible at the quietest preset frame", () => {
    const { canvas, paints } = makeCanvas();

    createRenderer(canvas, {
      ...staticOptions,
      dotMap: fullMap(1, 1),
      preset: (_dot, _time, frame) => {
        frame.a = 0;
        frame.s = 0.2;
      },
      reducedMotion: false,
      size: 16,
      state: "thinking",
    });

    for (let frame = 1; frame <= 120; frame++) {
      const frameHandler = pendingFrame;
      pendingFrame = null;
      if (frameHandler) {
        frameHandler(frame * (1000 / 60));
      }
    }

    expect(paints.at(-1)?.alpha).toBeGreaterThanOrEqual(0.8);
  });

  test("leaves a small mark unblurred unless glow asks for it", () => {
    // A halo wider than the cell is what turned a small mark into haze.
    const { canvas, paints } = makeCanvas();
    createRenderer(canvas, {
      ...staticOptions,
      dotMap: fullMap(24, 24),
      size: 16,
    });

    expect(paints.length).toBeGreaterThan(0);
    expect(paints.every((paint) => paint.blur === 0)).toBe(true);
  });

  test("still blurs when glow is asked for", () => {
    const { canvas, paints } = makeCanvas();
    createRenderer(canvas, {
      ...staticOptions,
      dotMap: fullMap(24, 24),
      glow: 1,
      size: 16,
    });

    expect(paints.every((paint) => paint.blur > 0)).toBe(true);
  });

  test("lays a small lattice out on whole device pixels", () => {
    const { canvas, paints } = makeCanvas();
    createRenderer(canvas, {
      ...staticOptions,
      dotMap: fullMap(24, 24),
      size: 20,
    });

    // Consolidated to a coarser grid, and no denser than the 2px floor.
    const cols = Math.sqrt(paints.length);
    expect(Number.isInteger(cols)).toBe(true);
    expect(20 / cols).toBeGreaterThanOrEqual(2);
  });

  test("uses the source aspect rather than the rounded grid ratio", () => {
    const { canvas } = makeCanvas();
    const renderer = createRenderer(canvas, {
      ...staticOptions,
      dotMap: fullMap(24, 2, 10),
      fit: "natural",
      size: 100,
    });

    expect(renderer.height).toBe(10);
    expect(canvas.style.height).toBe("10px");
  });
});
