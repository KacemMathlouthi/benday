import { NavLink } from "react-router";

import { NAV_LINKS } from "@/components/nav-links";
import { cn } from "@/lib/utils";

export function DesktopNav() {
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV_LINKS.map((link) => (
        <NavLink
          className={({ isActive }) =>
            cn(
              "rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )
          }
          end={link.to === "/"}
          key={link.to}
          to={link.to}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
