import { Link } from "react-router";

import { Container } from "@/components/container";
import { PageHeader, Prose, Section } from "@/components/section";
import { ISSUES, MAINTAINER } from "@/lib/links";

const Out = ({ href, children }: { href: string; children: string }) => (
  <a href={href} rel="noreferrer" target="_blank">
    {children}
  </a>
);

export function Privacy() {
  return (
    <Container>
      <PageHeader
        lead="No accounts, no analytics, no cookies."
        title="Privacy"
      />

      <Section title="What this site collects">
        <Prose>
          <p>
            Nothing. There is no analytics script, no tag manager, no session
            recording, no advertising pixel and no cookie set by this site. No
            page asks for a name, an email address or a payment method, because
            there is nothing here to sign up for or buy.
          </p>
        </Prose>
      </Section>

      <Section title="The playground">
        <Prose>
          <p>
            The <Link to="/playground">playground</Link> runs entirely in your
            browser. A logo you drop in is read locally, drawn to a canvas and
            turned into a dot map by JavaScript already on the page. It is never
            uploaded and never persisted: reload the tab and it is gone. The
            agent preview beside it streams hard-coded text, so no model is
            called.
          </p>
        </Prose>
      </Section>

      <Section title="What is stored in your browser">
        <Prose>
          <p>
            One <code>localStorage</code> entry, under the key{" "}
            <code>benday-theme</code>, remembering whether you chose the light
            theme, the dark theme, or to follow your system. It stays on your
            device and is never transmitted. Clearing site data removes it.
          </p>
        </Prose>
      </Section>

      <Section title="Requests that leave this site">
        <Prose>
          <p>
            Fonts, images and scripts are served from this domain, with one
            exception: the footer shows the maintainer&rsquo;s avatar, loaded
            from <code>github.com</code>, so GitHub sees that request. The other
            links in the footer are ordinary links, followed only if you click
            them.
          </p>
          <p>
            The site is hosted on <Out href="https://vercel.com">Vercel</Out>,
            which like any host processes the request data needed to serve a
            page under{" "}
            <Out href="https://vercel.com/legal/privacy-policy">
              its own privacy policy
            </Out>
            . {MAINTAINER} does not query or retain those logs. If this ever
            changes, this page will say so first. Anything unclear is worth{" "}
            <Out href={ISSUES}>raising as an issue</Out>.
          </p>
        </Prose>
      </Section>
    </Container>
  );
}
