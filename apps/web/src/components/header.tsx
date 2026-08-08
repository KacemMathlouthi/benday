import { Link } from "react-router";

import { Container } from "@/components/container";
import { DesktopNav } from "@/components/desktop-nav";
import { GithubIcon } from "@/components/icons/github-icon";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";

const REPO = "https://github.com/KacemMathlouthi/benday";

export function Header() {
  const scrolled = useScroll(10);

  return (
    <header
      className={cn("sticky top-0 z-50 w-full border-transparent border-b", {
        "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50":
          scrolled,
      })}
    >
      <Container className="flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/">
            <Logo />
          </Link>
          <DesktopNav />
        </div>

        {/* Icon buttons pad their own glyphs inset from the container edge;
            the negative margin pulls the cluster back out to align. */}
        <div className="-mr-2 flex items-center gap-1">
          <Button
            nativeButton={false}
            render={
              <a
                aria-label="benday on GitHub"
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
          <ThemeToggle />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
