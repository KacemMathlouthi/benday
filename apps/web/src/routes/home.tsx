import { Benday, PRESET_NAMES } from "@registry/ui/benday";
import type React from "react";
import { useCallback, useState } from "react";
import { Link } from "react-router";

import { Container } from "@/components/container";
import { PresetCard } from "@/components/preset-card";
import { Prose, Section } from "@/components/section";
import { ShowcaseControls } from "@/components/showcase-controls";
import { Button } from "@/components/ui/button";
import type { ShowcaseSettings } from "@/lib/showcase";
import { DEFAULT_SHOWCASE } from "@/lib/showcase";

/** A term the lead turns on. Four of them, so the sentence still has a shape. */
const Key = ({ children }: { children: React.ReactNode }) => (
  <em className="text-foreground not-italic">{children}</em>
);

export function Home() {
  const [settings, setSettings] = useState<ShowcaseSettings>(DEFAULT_SHOWCASE);

  const patch = useCallback(
    (next: Partial<ShowcaseSettings>) =>
      setSettings((current) => ({ ...current, ...next })),
    []
  );

  return (
    <Container>
      {/* The sticky header still takes its 3.5rem of flow, so a plain 100svh
          section would hang past the fold and centre everything low. */}
      <section className="flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center py-12 text-center">
        <div className="flex items-center gap-5 sm:gap-6">
          <Benday
            preset="breathe"
            size={128}
            src={DEFAULT_SHOWCASE.logo}
            state="thinking"
          />
          {/* One weight, so no `font-medium` — a synthesised bold smears the
              pixel grid. Already gridded letterforms, so no `tracking-tight`. */}
          <h1 className="font-pixel-circle text-6xl leading-none sm:text-7xl">
            benday
          </h1>
        </div>

        {/* The art is white dots on true black — which is exactly the dark
            palette. Light mode inverts it to black dots on white. */}
        <img
          alt="A stippled figure standing on a field of dots, trailing the grid behind it"
          className="mt-8 w-full max-w-xl invert dark:invert-0"
          src="/hero-field.webp"
        />

        <p className="mt-8 w-full max-w-2xl text-balance text-muted-foreground leading-relaxed">
          Agents need somewhere to say they are <Key>thinking</Key>. Shimmering
          text, dot matrices and orbs all fill that slot with something{" "}
          <Key>generic</Key>. benday fills it with <Key>your logo</Key>, baked
          into a <Key>field of dots</Key> that breathes, ripples, scatters and
          settles back into the mark.
        </p>

        <div className="mt-8 flex items-center gap-2">
          <Button render={<Link to="/playground" />}>Try your logo</Button>
          <Button render={<Link to="/usage" />} variant="outline">
            Usage
          </Button>
        </div>
      </section>

      <Section
        actions={
          <span className="text-muted-foreground text-sm">
            {PRESET_NAMES.length} ways to animate one mark
          </span>
        }
        title="Presets"
      >
        <ShowcaseControls onChange={patch} settings={settings} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRESET_NAMES.map((preset) => (
            <PresetCard key={preset} preset={preset} settings={settings} />
          ))}
        </div>
      </Section>

      <Section
        className="pb-4"
        lead="Three steps, run once."
        title="How it works"
      >
        <Prose>
          <p>
            The logo is rasterized once and its ink separated from its
            background, by alpha or by a luminance mask. A distance transform
            gives every pixel its depth inside the shape, and the result is
            sampled onto a grid: a few hundred dots carrying position, coverage,
            tone and depth.
          </p>
          <p>
            That dot map is all the renderer animates. It resolves{" "}
            <code>currentColor</code> against the canvas, stops painting
            off-screen, and honours reduced motion. Bake at build time, pass{" "}
            <code>dotMap</code> instead of <code>src</code>, and the client
            skips the rest.
          </p>
        </Prose>
      </Section>
    </Container>
  );
}
