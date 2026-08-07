import type React from "react";

/**
 * The benday mark: a halftone gradation of four dots stepping down in size.
 * The logo is the thing the library does.
 */
const LogoIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    fill="currentColor"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>benday</title>
    <circle cx="29" cy="29" r="25" />
    <circle cx="73" cy="29" r="17" />
    <circle cx="29" cy="73" r="17" />
    <circle cx="73" cy="73" r="10" />
  </svg>
);

export const Logo = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={`flex items-center gap-2 ${className ?? ""}`} {...props}>
    <LogoIcon className="size-4" />
    <span className="font-medium text-[15px] tracking-tight">benday</span>
  </div>
);
