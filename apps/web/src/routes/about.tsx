import { PRESET_NAMES } from "@registry/ui/benday";
import { Link } from "react-router";

import { Container } from "@/components/container";
import { PageHeader, Prose, Section } from "@/components/section";
import {
  CHANGELOG,
  CONTRIBUTING,
  LICENSE,
  MAINTAINER,
  MAINTAINER_GITHUB,
  MAINTAINER_SITE,
  REPO,
} from "@/lib/links";

/** External links open away from the site; internal ones stay in the router. */
const Out = ({ href, children }: { href: string; children: string }) => (
  <a href={href} rel="noreferrer" target="_blank">
    {children}
  </a>
);

export function About() {
  return (
    <Container>
      <PageHeader
        lead="A thinking indicator built out of your own logo."
        title="About benday"
      />

      <Section title="What it is">
        <Prose>
          <p>
            benday rasterizes a logo once, separates ink from background, and
            samples it into a grid of dots. The renderer animates that grid
            while an agent works, then settles it back into the crisp mark.
            There are {PRESET_NAMES.length} presets, and a preset is a plain
            function of one dot and the clock, so a project can write its own.
          </p>
          <p>
            It exists because every AI interface needs somewhere to say it is
            thinking, and a spinner says it in a voice that belongs to no one. A
            product already has a mark. This turns that mark into the wait.
          </p>
        </Prose>
      </Section>

      <Section title="How it is distributed">
        <Prose>
          <p>
            There is no package to depend on. Installing runs the{" "}
            <Out href="https://ui.shadcn.com/docs/cli">shadcn CLI</Out>, which
            copies seven TypeScript files into your project, where they are
            yours to edit. React is the only import in any of them.{" "}
            <Link to="/usage">Usage</Link> has the install command and the
            props; the <Link to="/playground">playground</Link> runs the whole
            pipeline in the browser on a logo you drop in.
          </p>
        </Prose>
      </Section>

      <Section title="Who maintains it">
        <Prose>
          <p>
            benday is written and maintained by {MAINTAINER} (
            <Out href={MAINTAINER_GITHUB}>@KacemMathlouthi</Out>), a software
            engineer working on AI products. More of his work is at{" "}
            <Out href={MAINTAINER_SITE}>kacemmathlouthi.dev</Out>. Development
            happens in the open on <Out href={REPO}>GitHub</Out>, and{" "}
            <Out href={CONTRIBUTING}>CONTRIBUTING.md</Out> describes the
            workflow for issues and pull requests.
          </p>
        </Prose>
      </Section>

      <Section title="License and releases">
        <Prose>
          <p>
            benday is released under the <Out href={LICENSE}>MIT license</Out>.
            Because the component is copied rather than installed, upgrading is
            deliberate: re-run the CLI when you want a newer version, then diff
            it against your own edits. Every user-facing change is recorded in
            the <Out href={CHANGELOG}>changelog</Out>. Questions and preset
            ideas belong on <Link to="/contact">the contact page</Link>.
          </p>
        </Prose>
      </Section>
    </Container>
  );
}
