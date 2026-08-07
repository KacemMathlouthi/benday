import { Link } from "react-router";

import { Container } from "@/components/container";
import { GithubIcon } from "@/components/icons/github-icon";
import { Logo } from "@/components/logo";
import { NAV_LINKS } from "@/components/nav-links";
import { Button } from "@/components/ui/button";

const REPO = "https://github.com/KacemMathlouthi/benday";
const NPM = "https://www.npmjs.com/package/benday";

const externalLinks = [
  { href: REPO, label: "GitHub" },
  { href: NPM, label: "npm" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-border border-t">
      <Container>
        <div className="flex flex-col gap-6 py-6">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center">
              <Button
                nativeButton={false}
                render={
                  <a
                    aria-label="GitHub"
                    href={REPO}
                    rel="noreferrer"
                    target="_blank"
                  />
                }
                size="icon"
                variant="ghost"
              >
                <GithubIcon />
              </Button>
            </div>
          </div>

          <nav>
            <ul className="flex flex-wrap gap-4 font-medium text-muted-foreground text-sm md:gap-6">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link className="hover:text-foreground" to={link.to}>
                    {link.label}
                  </Link>
                </li>
              ))}
              {externalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    className="hover:text-foreground"
                    href={link.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center justify-between gap-4 border-border border-t py-4 text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} benday</p>

          <p className="inline-flex items-center gap-1">
            <span>Built by</span>
            <a
              className="inline-flex items-center gap-1 text-foreground/80 hover:text-foreground hover:underline"
              href="https://github.com/KacemMathlouthi"
              rel="noreferrer"
              target="_blank"
            >
              <img
                alt="Kacem Mathlouthi"
                className="size-4 rounded-full"
                height="16"
                src="https://github.com/KacemMathlouthi.png"
                width="16"
              />
              Kacem
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
