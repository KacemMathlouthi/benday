import type { DotShape } from "@registry/ui/benday";

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
  dotScale: 0.65,
  logo: "/benday-mark.svg",
  shape: "circle",
  size: 128,
  speed: 1.25,
};

export const SHOWCASE_SHAPES: { label: string; value: DotShape }[] = [
  { label: "Circle", value: "circle" },
  { label: "Square", value: "square" },
  { label: "Diamond", value: "diamond" },
];
