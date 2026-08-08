import type React from "react";

import { cn } from "@/lib/utils";

/**
 * The single source of truth for page width. Header, page bodies and footer all
 * go through this so nothing drifts a few pixels out of alignment — and every
 * route shares one measure, so navigating never shifts the layout. The width is
 * set by the playground, which needs room for a canvas beside its controls;
 * prose elsewhere caps itself well inside it.
 */
export function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-5xl px-4 sm:px-6", className)}
      {...props}
    />
  );
}
