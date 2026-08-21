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
            Nothing. No analytics script, no tag manager, no session recording,
            no advertising pixel, no cookie. No page asks for a name, an email
            address or a payment method, because there is nothing here to sign
            up for or buy.
          </p>
        </Prose>
      </Section>

      <Section title="The playground">
        <Prose>
          <p>
            The <Link to="/playground">playground</Link> runs entirely in your
            browser: a logo you drop in is read locally and turned into a dot
            map by JavaScript already on the page. It is never uploaded and
            never persisted, so reloading the tab loses it. The agent preview
            beside it streams hard-coded text, so no model is called.
          </p>
        </Prose>
      </Section>

      <Section title="What is stored in your browser">
        <Prose>
          <p>
            One <code>localStorage</code> entry, <code>benday-theme</code>,
            remembering whether you chose the light theme, the dark theme, or to
            follow your system. It never leaves your device, and clearing site
            data removes it.
          </p>
        </Prose>
      </Section>

      <Section title="Requests that leave this site">
        <Prose>
          <p>
            Fonts, images and scripts are served from this domain, with one
            exception: the footer shows the maintainer&rsquo;s avatar, loaded
            from <code>github.com</code>, so GitHub sees that request.
          </p>
          <p>
            The site is hosted on <Out href="https://vercel.com">Vercel</Out>,
            which like any host processes the request data needed to serve a
            page under{" "}
            <Out href="https://vercel.com/legal/privacy-policy">
              its own privacy policy
            </Out>
            . {MAINTAINER} does not query or retain those logs. If that ever
            changes, this page will say so first; anything unclear is worth{" "}
            <Out href={ISSUES}>raising as an issue</Out>.
          </p>
        </Prose>
      </Section>
    </Container>
  );
}
