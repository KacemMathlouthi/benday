import type { DotShape } from "benday";

/** The settings the home page applies to every preview at once. */
export interface ShowcaseSettings {
  size: number;
  speed: number;
  dotScale: number;
  shape: DotShape;
  color: string;
  logo: string;
}

export const DEFAULT_SHOWCASE: ShowcaseSettings = {
  color: "currentColor",
  dotScale: 0.62,
  logo: "/benday-mark.svg",
  shape: "circle",
  size: 120,
  speed: 1,
};

export const SHOWCASE_COLORS = [
  { label: "Ink", value: "currentColor" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Emerald", value: "#10b981" },
  { label: "Rose", value: "#f43f5e" },
];

export const SHOWCASE_SHAPES: { label: string; value: DotShape }[] = [
  { label: "Circle", value: "circle" },
  { label: "Square", value: "square" },
  { label: "Diamond", value: "diamond" },
];
