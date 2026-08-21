import { Link } from "react-router";

import { Container } from "@/components/container";
import { PageHeader, Prose, Section } from "@/components/section";
import {
  CONTRIBUTING,
  DISCUSSIONS,
  ISSUES,
  MAINTAINER,
  MAINTAINER_GITHUB,
  MAINTAINER_SITE,
  MAINTAINER_X,
  REPO,
} from "@/lib/links";

const Out = ({ href, children }: { href: string; children: string }) => (
  <a href={href} rel="noreferrer" target="_blank">
    {children}
  </a>
);

export function Contact() {
  return (
    <Container>
      <PageHeader
        lead="One maintainer, everything in public on the repository."
        title="Contact"
      />

      <Section title="Bugs and preset ideas">
        <Prose>
          <p>
            Open an <Out href={ISSUES}>issue on GitHub</Out>: a logo that bakes
            badly, a preset that misbehaves at small sizes, a prop that does not
            do what the documentation says. Include the logo, or the JSX the{" "}
            <Link to="/playground">playground</Link> generated for it. The bake
            depends on nothing else, so that is enough to reproduce it.
          </p>
        </Prose>
      </Section>

      <Section title="Code">
        <Prose>
          <p>
            Pull requests go to <Out href={REPO}>the repository</Out>;{" "}
            <Out href={CONTRIBUTING}>CONTRIBUTING.md</Out> covers the setup, the
            changeset, and the checks CI runs. Open questions that are not yet a
            bug fit best in <Out href={DISCUSSIONS}>discussions</Out>.
          </p>
        </Prose>
      </Section>

      <Section title="The maintainer">
        <Prose>
          <p>
            benday is built by {MAINTAINER}, reachable at{" "}
            <Out href={MAINTAINER_X}>@KacemMathlouthi on X</Out>, on{" "}
            <Out href={MAINTAINER_GITHUB}>GitHub</Out>, and through his site at{" "}
            <Out href={MAINTAINER_SITE}>kacemmathlouthi.dev</Out>. There is no
            support contract and no mailing list: issues are answered in the
            open, where the next person with the same question finds the answer.
            More about the project is on <Link to="/about">the about page</Link>
            .
          </p>
        </Prose>
      </Section>
    </Container>
  );
}
