import type React from "react";

import { cn } from "@/lib/utils";

const WIDTHS = {
  /** Reading measure. Header, footer and every prose page use this. */
  default: "max-w-3xl",
  /** The playground needs room for a canvas beside its controls. */
  wide: "max-w-5xl",
} as const;

/**
 * The single source of truth for page width. Header, page bodies and footer all
 * go through this so nothing drifts a few pixels out of alignment.
 */
export function Container({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: keyof typeof WIDTHS }) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6", WIDTHS[size], className)}
      {...props}
    />
  );
}
