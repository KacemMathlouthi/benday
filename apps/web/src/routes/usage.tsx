import { PRESET_NAMES, PRESETS } from "@registry/ui/benday";
import type React from "react";
import { Link } from "react-router";

import { CodeBlock } from "@/components/code-block";
import { Container } from "@/components/container";
import { RegistryInstall } from "@/components/registry-install";
import { Note, PageHeader, Section } from "@/components/section";
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

const PREBAKE = `// scripts/bake-logo.ts — run once, commit the JSON.
import { writeFile } from "node:fs/promises";
import { bake } from "@/components/ui/benday";

const dotMap = await bake("./public/logo.svg", { grid: 24 });
await writeFile("./src/logo-dots.json", JSON.stringify(dotMap));`;

const PREBAKE_USE = `import dotMap from "@/logo-dots.json";

<Benday dotMap={dotMap} size={64} />;`;

const MANUAL = `components/ui/
├── benday.tsx          the component and the public exports
└── benday/
    ├── bake.ts         image → dot map
    ├── dom.ts          colour, theme, visibility, DPR
    ├── presets.ts      the seven animations
    ├── renderer.ts     the canvas painter
    ├── types.ts        every exported type
    └── use-dot-map.ts  the React binding`;

export function Usage() {
  return (
    <Container className="pb-20">
      <PageHeader
        lead="An open-code shadcn primitive. The CLI writes the component and its canvas runtime into your project; there is no package to depend on."
        title="Usage"
      />

      <Section
        lead="Needs React 18 or 19, a shadcn components.json, and a logo as SVG, PNG, JPG or WebP."
        title="Install"
      >
        <RegistryInstall />
        <Note>
          The code lands at <code>components/ui/benday.tsx</code> and{" "}
          <code>components/ui/benday/*</code>, and is yours to edit.
        </Note>
      </Section>

      <Section
        lead="No CLI? Copy the seven files out of the registry payload by hand. Nothing generates them, and the imports between them are relative, so the tree is all that matters."
        title="Manual install"
      >
        <CodeBlock code={MANUAL} filename="where the files go" />
        <Note>
          Every file&rsquo;s source is the <code>content</code> field of{" "}
          <a
            className="underline hover:text-foreground"
            href="/r/benday.json"
            rel="noreferrer"
            target="_blank"
          >
            /r/benday.json
          </a>
          . Only React is required — there is nothing else to install.
        </Note>
      </Section>

      <Section
        lead="Point it at an image. It bakes the logo into a dot map on mount, then animates it."
        title="Quick start"
      >
        <CodeBlock code={QUICK_START} filename="benday-example.tsx" />
        <Note>
          <code>currentColor</code> is the default and re-resolves when the
          theme flips, so the mark tracks surrounding text on its own.
        </Note>
      </Section>

      <Section
        lead="The bake runs once per URL and options, then caches. Transparency is used when present; opaque images fall back to a luminance mask."
        title="Tune the bake"
      >
        <CodeBlock code={RUNTIME} filename="benday-example.tsx" />
        <Note>
          The{" "}
          <Link className="underline hover:text-foreground" to="/playground">
            playground
          </Link>{" "}
          is the fast way to find settings that hold up at your smallest size.
        </Note>
      </Section>

      <Section
        lead="Same dot map, different motion. Swap the name; nothing else changes."
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
          A preset is a function of one dot and the clock, so you can pass your
          own instead of a name.
        </Note>
      </Section>

      <Section
        lead="thinking runs the preset; idle and done show the crisp mark. Switching springs the dots back into the logo."
        title="States"
      >
        <CodeBlock code={STATES} filename="states.tsx" />
      </Section>

      <Section
        lead="The bake is the only expensive step, and it does not need to happen in the browser. Run it once at build time, commit the dot map, and the client just paints."
        title="Bake ahead of time"
      >
        <CodeBlock code={PREBAKE} filename="bake-logo.ts" />
        <CodeBlock code={PREBAKE_USE} filename="app.tsx" />
        <Note>
          <code>dotMap</code> wins over <code>src</code>, so nothing rasterizes
          on mount and the mark is there on the first frame. A 24-dot map is a
          few KB of JSON. <code>bake</code> draws through a canvas, so the
          script needs a DOM — run it under Playwright, jsdom with node-canvas,
          or any browser context. Settle the bake options in the{" "}
          <Link className="underline hover:text-foreground" to="/playground">
            playground
          </Link>{" "}
          first, then pass the same ones here.
        </Note>
      </Section>

      <Section
        lead="Put the indicator next to what is pending, at the size that thing occupies."
        title="Use in real UI"
      >
        <CodeBlock code={SAVE_BUTTON} filename="save-button.tsx" />
        <Note>
          Note the <code>grid</code> override: at 18px a 24-dot grid gives
          sub-pixel dots that read as grey fuzz.
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
            "Coarser grid for smaller sizes. Below roughly 1.6px per dot the mark stops reading.",
            "Thin strokes vanish. A dilate of 1 to 3px rescues a hairline logo; drop threshold alongside it.",
            'Wide wordmarks want fit="natural", or a square letterboxes away half their size.',
            "One indicator per pending region. Several at once compete.",
            'Motion is decorative: role="img" with a per-state label, and one static frame under prefers-reduced-motion.',
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
