import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";

import { NAV_LINKS } from "@/components/nav-links";
import { Portal, PortalBackdrop } from "@/components/portal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Toggle menu"
        className="md:hidden"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="outline"
      >
        <div
          className={cn(
            "transition-all",
            open ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}
        >
          <XIcon />
        </div>
        <div
          className={cn(
            "absolute transition-all",
            open ? "scale-0 opacity-0" : "scale-100 opacity-100"
          )}
        >
          <MenuIcon />
        </div>
      </Button>

      {open && (
        <Portal className="top-14">
          <PortalBackdrop />
          <div
            className="ease-out data-[slot=open]:zoom-in-97 size-full overflow-y-auto p-4 data-[slot=open]:animate-in"
            data-slot={open ? "open" : "closed"}
            id="mobile-menu"
          >
            <div className="flex w-full flex-col">
              {NAV_LINKS.map((link) => (
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      "border-border/60 border-b py-3 text-base",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )
                  }
                  end={link.to === "/"}
                  key={link.to}
                  onClick={() => setOpen(false)}
                  to={link.to}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
