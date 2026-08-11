/** A dot colour offered as a swatch. `currentColor` is the component default. */
interface DotColor {
  label: string;
  value: string;
}

/**
 * The swatches both the home showcase and the playground offer. One list, so a
 * colour added here shows up in both places and the two cannot drift apart.
 *
 * Ordered around the wheel rather than by when they were added, so the row
 * reads as a spectrum, and closed out by the neutral. Every hue is a Tailwind
 * 500: saturated enough to hold at 20px, dark enough to survive a light
 * background and light enough to survive a dark one.
 */
export const DOT_COLORS: DotColor[] = [
  { label: "Ink", value: "currentColor" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Fuchsia", value: "#d946ef" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Lime", value: "#84cc16" },
  { label: "Emerald", value: "#10b981" },
  { label: "Sky", value: "#0ea5e9" },
  { label: "Slate", value: "#64748b" },
];
