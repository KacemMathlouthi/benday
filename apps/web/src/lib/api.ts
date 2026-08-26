/**
 * The prop table, described once. The usage page renders it, and the prerender
 * writes the same rows into `usage.md` for agents reading the site as markdown.
 * Two hand-kept copies would drift the moment a default changed.
 */

interface PropRow {
  name: string;
  type: string;
  /** Default value, as written in the signature; "None" when there is none. */
  def: string;
  note: string;
}

export const PROPS: PropRow[] = [
  {
    def: "None",
    name: "src",
    note: "URL, data URI, File/Blob, or a loaded HTMLImageElement",
    type: "BakeSource",
  },
  {
    def: "None",
    name: "dotMap",
    note: "A pre-baked map. Takes precedence over src",
    type: "DotMap",
  },
  {
    def: "None",
    name: "bake",
    note: "grid, threshold, gamma, dilate, maskMode, invert, trim",
    type: "BakeOptions",
  },
  { def: "64", name: "size", note: "CSS pixels", type: "number" },
  {
    def: "'square'",
    name: "fit",
    note: "'natural' sizes to the mark, which is what wordmarks need",
    type: "'square' | 'natural'",
  },
  {
    def: "'thinking'",
    name: "state",
    note: "thinking runs the preset; the others settle to the crisp mark",
    type: "BendayState",
  },
  {
    def: "'contour'",
    name: "preset",
    note: "A preset name or your own per-dot function",
    type: "PresetName | Preset",
  },
  { def: "1", name: "speed", note: "Multiplier", type: "number" },
  {
    def: "'currentColor'",
    name: "color",
    note: "Resolved off the canvas, re-resolved on theme change",
    type: "string",
  },
  {
    def: "1",
    name: "dotScale",
    note: "Dot size against a full-coverage halftone dot",
    type: "number",
  },
  {
    def: "'circle'",
    name: "shape",
    note: "circle, square or diamond",
    type: "DotShape",
  },
  {
    def: "0",
    name: "glow",
    note: "Halo radius as a fraction of the dot",
    type: "number",
  },
  {
    def: "0.06",
    name: "padding",
    note: "Inset as a fraction of the box",
    type: "number",
  },
  {
    def: "1",
    name: "weight",
    note: "How strongly ink coverage drives dot size",
    type: "number",
  },
  {
    def: "false",
    name: "paused",
    note: "Freeze on the current frame",
    type: "boolean",
  },
  {
    def: "'auto'",
    name: "reducedMotion",
    note: "'auto' follows prefers-reduced-motion",
    type: "boolean | 'auto'",
  },
];
