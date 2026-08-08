import type React from "react";

import { cn } from "@/lib/utils";

/**
 * The one source of page width, so nothing drifts and navigating never shifts
 * the layout. Sized for the playground; prose caps itself well inside it.
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
