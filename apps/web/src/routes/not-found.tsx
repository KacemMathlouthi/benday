import { Benday } from "@registry/ui/benday";
import { Link } from "react-router";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

/**
 * The recovery rail. This body is served on every unknown URL, so an agent that
 * lands here should be able to read where to go next out of the page itself,
 * not infer it from a button.
 */
const ELSEWHERE = [
  { href: "/usage", label: "Usage and API reference" },
  { href: "/playground", label: "Playground" },
  { href: "/about", label: "About the project" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
];

const MACHINE_READABLE = [
  { href: "/llms.txt", label: "/llms.txt" },
  { href: "/sitemap.xml", label: "/sitemap.xml" },
  { href: "/r/registry.json", label: "/r/registry.json" },
];

/** No header, no footer: a dead end gets the whole viewport and nothing else. */
export function NotFound() {
  return (
    <Container className="flex min-h-svh flex-col items-center justify-center py-12 text-center">
      <Benday
        preset="scatter"
        size={128}
        src="/benday-mark.svg"
        state="thinking"
      />

      {/* One weight in the pixel face, so size carries the emphasis instead of
          a synthesised bold. Already gridded, so no `tracking-tight` either. */}
      <p className="mt-8 font-pixel-circle text-6xl leading-none sm:text-7xl">
        404
      </p>

      <h1 className="mt-6 font-medium text-2xl tracking-tight">Not found</h1>

      <p className="mt-2 max-w-md text-balance text-muted-foreground leading-relaxed">
        That page scattered and never reconverged. Every page the site does
        serve is listed below.
      </p>

      <div className="mt-8 flex items-center gap-2">
        <Button render={<Link to="/" />}>Back home</Button>
        <Button render={<Link to="/playground" />} variant="outline">
          Playground
        </Button>
      </div>

      <nav className="mt-10 flex flex-col items-center gap-3 text-muted-foreground text-sm">
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {ELSEWHERE.map((link) => (
            <li key={link.href}>
              <Link className="hover:text-foreground" to={link.href}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 font-mono text-xs">
          {MACHINE_READABLE.map((link) => (
            <li key={link.href}>
              <a className="hover:text-foreground" href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Container>
  );
}
