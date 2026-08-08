import type React from "react";
import { Link } from "react-router";

import { CodeBlock } from "@/components/code-block";
import { Container } from "@/components/container";
import { RegistryInstall } from "@/components/registry-install";
import { Note, PageHeader, Section } from "@/components/section";
import { PRESET_NAMES, PRESETS } from "@/components/ui/benday";
import { Button } from "@/components/ui/button";

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground text-sm leading-relaxed marker:text-muted-foreground/40">
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static copy
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

const PROPS: { name: string; type: string; def: string; note: string }[] = [
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
    def: "0.62",
    name: "dotScale",
    note: "Dot diameter as a fraction of the grid cell",
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
    def: "0.5",
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

const QUICK_START = `import { Benday } from "@/components/ui/benday";

export function Example() {
  return <Benday src="/logo.svg" size={64} />;
}`;

const RUNTIME = `<Benday src="/logo.svg" bake={{ grid: 24, dilate: 1 }} />`;

const SAVE_BUTTON = `import { Benday } from "@/components/ui/benday";

export function SaveButton({ isSaving }: { isSaving: boolean }) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-md border px-3 py-2"
      disabled={isSaving}
      type="button"
    >
      {isSaving ? (
        <Benday src="/logo.svg" size={18} bake={{ grid: 10 }} />
      ) : null}
      <span>{isSaving ? "Saving…" : "Save changes"}</span>
    </button>
  );
}`;

const STATES = `const state = isStreaming ? "thinking" : "done";

<Benday src="/logo.svg" state={state} />;`;

export function Usage() {
  return (
    <Container className="pb-20">
      <PageHeader
        lead="benday is an open-code shadcn primitive. The CLI writes the component and its small canvas runtime into your project, where you can change every line."
        title="Usage"
      />

      <Section
        lead="benday renders to a canvas in the browser and brings no runtime package dependency."
        title="Prerequisites"
      >
        <Bullets
          items={[
            "A React 18 or 19 app.",
            "A shadcn components.json file so the CLI knows where your ui directory lives.",
            "A logo as SVG, PNG, JPG or WebP. Transparency helps but is not required; opaque images fall back to a luminance mask.",
          ]}
        />
      </Section>

      <Section
        lead="This copies the source into your configured ui directory. It does not add a benday package to package.json."
        title="Install"
      >
        <RegistryInstall />
        <Note>
          After installation, the code is yours at{" "}
          <code>components/ui/benday.tsx</code> and{" "}
          <code>components/ui/benday/*</code>.
        </Note>
      </Section>

      <Section
        lead="Point the component at an image. It bakes the logo into a dot map on mount and animates it."
        title="Quick start"
      >
        <CodeBlock code={QUICK_START} filename="benday-example.tsx" />
        <Note>
          Colour is inherited: the default <code>currentColor</code> resolves
          against the canvas and re-resolves when the theme flips, so the
          indicator matches surrounding text without being told twice.
        </Note>
      </Section>

      <Section
        lead="The browser bakes the source image into a small dot map once, then caches it by URL and options."
        title="Tune the bake"
      >
        <CodeBlock code={RUNTIME} filename="benday-example.tsx" />
        <Note>
          Use the{" "}
          <Link className="underline hover:text-foreground" to="/playground">
            playground
          </Link>{" "}
          to find settings that preserve your mark at its smallest rendered
          size.
        </Note>
      </Section>

      <Section
        lead="Every preset animates the same dot map differently. Swap the name; nothing else changes."
        title="Presets"
      >
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Preset names and what each one does
            </caption>
            <tbody>
              {PRESET_NAMES.map((name) => (
                <tr className="border-border border-b last:border-0" key={name}>
                  <th
                    className="w-32 px-3 py-2.5 text-left align-top font-mono font-normal text-[12.5px]"
                    scope="row"
                  >
                    {name}
                  </th>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {PRESETS[name].description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note>
          A preset is just a function of one dot and the clock, so you can pass
          your own instead of a name.
        </Note>
      </Section>

      <Section
        lead="idle and done both show the crisp mark; thinking runs the preset. Transitions run through a light spring, so done gives you the dots snapping back into the logo."
        title="States"
      >
        <CodeBlock code={STATES} filename="states.tsx" />
      </Section>

      <Section
        lead="Keep the indicator next to the thing that is pending, at the size that thing occupies."
        title="Use in real UI"
      >
        <CodeBlock code={SAVE_BUTTON} filename="save-button.tsx" />
        <Note>
          Note the <code>grid</code> override. At 18px a 24-dot grid produces
          sub-pixel dots that read as grey fuzz, so small indicators want a
          coarser bake of their own.
        </Note>
      </Section>

      <Section title="Props">
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Every prop the Benday component accepts
            </caption>
            <thead>
              <tr className="border-border border-b bg-muted text-muted-foreground text-xs">
                <th className="px-3 py-2 text-left font-medium" scope="col">
                  Prop
                </th>
                <th className="px-3 py-2 text-left font-medium" scope="col">
                  Type
                </th>
                <th className="px-3 py-2 text-left font-medium" scope="col">
                  Default
                </th>
              </tr>
            </thead>
            <tbody>
              {PROPS.map((prop) => (
                <tr
                  className="border-border border-b last:border-0"
                  key={prop.name}
                >
                  <th
                    className="px-3 py-2.5 text-left align-top font-mono font-normal text-[12.5px]"
                    scope="row"
                  >
                    {prop.name}
                    <span className="mt-0.5 block font-sans text-muted-foreground text-xs">
                      {prop.note}
                    </span>
                  </th>
                  <td className="px-3 py-2.5 align-top font-mono text-[12px] text-muted-foreground">
                    {prop.type}
                  </td>
                  <td className="px-3 py-2.5 align-top font-mono text-[12px] text-muted-foreground">
                    {prop.def}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Guidelines">
        <Bullets
          items={[
            "Bake a coarser grid for small sizes. Below roughly 1.6px per dot the mark stops reading as a mark.",
            "Thin strokes vanish. A dilate of 1 to 3px restores a hairline logo; lower threshold alongside it.",
            'Wide wordmarks want fit="natural", or they get letterboxed into a square and lose half their size.',
            "One indicator per pending region. Several animated marks in a viewport compete with each other.",
            'Motion is decorative. The component ships role="img" with a per-state label, and renders a single static frame under prefers-reduced-motion.',
          ]}
        />
      </Section>

      <Section
        lead="Throw your ugliest logo at it and see what survives."
        title="Next step"
      >
        <div className="flex gap-2">
          <Button render={<Link to="/playground" />}>
            Open the playground
          </Button>
          <Button
            render={
              <a
                aria-label="benday on GitHub"
                href="https://github.com/KacemMathlouthi/benday"
                rel="noreferrer"
                target="_blank"
              />
            }
            variant="outline"
          >
            GitHub
          </Button>
        </div>
      </Section>
    </Container>
  );
}
