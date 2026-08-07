import { PRESET_NAMES } from "benday";
import { ThinkingLogo } from "benday/react";
import { useCallback, useState } from "react";
import { Link } from "react-router";

import { Container } from "@/components/container";
import { PresetCard } from "@/components/preset-card";
import { Section } from "@/components/section";
import { ShowcaseControls } from "@/components/showcase-controls";
import { Button } from "@/components/ui/button";
import type { ShowcaseSettings } from "@/lib/showcase";
import { DEFAULT_SHOWCASE } from "@/lib/showcase";

export function Home() {
  const [settings, setSettings] = useState<ShowcaseSettings>(DEFAULT_SHOWCASE);

  const patch = useCallback(
    (next: Partial<ShowcaseSettings>) =>
      setSettings((current) => ({ ...current, ...next })),
    []
  );

  return (
    <Container>
      <section className="flex flex-col items-center py-16 text-center sm:py-24">
        <h1 className="font-medium text-4xl tracking-tight sm:text-5xl">
          benday
        </h1>

        <div className="my-10 flex h-50 items-center justify-center">
          <ThinkingLogo
            preset="contour"
            size={200}
            src={DEFAULT_SHOWCASE.logo}
            state="thinking"
          />
        </div>

        <p className="max-w-xl text-balance text-muted-foreground leading-relaxed">
          Agents need somewhere to say they are thinking. Shimmering text, dot
          matrices and orbs all fill that slot with something generic. benday
          fills it with{" "}
          <em className="text-foreground not-italic">your logo</em>, baked into
          a field of dots that breathes, ripples, scatters and settles back into
          the mark.
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
        className="pb-4"
        title="Presets"
      >
        <ShowcaseControls onChange={patch} settings={settings} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PRESET_NAMES.map((preset) => (
            <PresetCard key={preset} preset={preset} settings={settings} />
          ))}
        </div>
      </Section>
    </Container>
  );
}
