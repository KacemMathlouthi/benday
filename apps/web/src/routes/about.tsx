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
            benday samples a logo into a grid of dots and animates that grid
            while an agent works, then settles it back into the crisp mark.
            There are {PRESET_NAMES.length} presets, and a preset is a plain
            function of one dot and the clock, so you can write your own.
          </p>
          <p>
            It exists because a spinner says &ldquo;thinking&rdquo; in a voice
            that belongs to no one. A product already has a mark. This turns
            that mark into the wait.
          </p>
        </Prose>
      </Section>

      <Section title="How it is distributed">
        <Prose>
          <p>
            There is no package to depend on. Installing runs the{" "}
            <Out href="https://ui.shadcn.com/docs/cli">shadcn CLI</Out>, which
            copies seven TypeScript files into your project, where they are
            yours to edit. React is the only import.{" "}
            <Link to="/usage">Usage</Link> has the install command and the
            props; the <Link to="/playground">playground</Link> runs the
            pipeline on a logo you drop in.
          </p>
        </Prose>
      </Section>

      <Section title="Who maintains it">
        <Prose>
          <p>
            benday is written and maintained by {MAINTAINER} (
            <Out href={MAINTAINER_GITHUB}>@KacemMathlouthi</Out>), a software
            engineer working on AI products, whose other work is at{" "}
            <Out href={MAINTAINER_SITE}>kacemmathlouthi.dev</Out>. Development
            happens in the open on <Out href={REPO}>GitHub</Out>, and{" "}
            <Out href={CONTRIBUTING}>CONTRIBUTING.md</Out> describes the
            workflow.
          </p>
        </Prose>
      </Section>

      <Section title="License and releases">
        <Prose>
          <p>
            benday is released under the <Out href={LICENSE}>MIT license</Out>.
            Because the component is copied rather than installed, upgrading is
            deliberate: re-run the CLI, then diff against your own edits. Every
            user-facing change is recorded in the{" "}
            <Out href={CHANGELOG}>changelog</Out>. Questions and preset ideas
            belong on <Link to="/contact">the contact page</Link>.
          </p>
        </Prose>
      </Section>
    </Container>
  );
}
