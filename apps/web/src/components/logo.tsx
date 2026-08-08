import type React from "react";

/** The benday monogram. */
const LogoIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    fill="currentColor"
    viewBox="1.4 5.99 67 68"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>benday</title>
    <path d="m55 23.3c-.6-1.7-1.7-3.3-3.1-4.3L32.7 7.7c-1-.6-2.4-.7-3.5 0L16 15.1c-1 .6-1.6 1.7-1.6 2.9v44c0 1.2.6 2.4 1.7 3.1l12.8 7h.1c-1-.7.9 1.2 3.7.3L51.4 59c2.2-1.4 3.9-4.4 4-8s-1.2-6.9-4.5-8.5L42.7 38l8.1-4.2c2.1-1.2 3.5-2.8 4.2-5.2.4-1.7.5-3.6 0-5.3Zm-4.2 8.8c-1.6 1.1-3.5 2-4.8 2.7l-6 3.1c-.3.2-.2.7.1.8l10.3 5.5c2.3 1.3 3.3 3.7 3.3 6.2-.1 3.5-1.9 6.2-3.6 7.3-.2.1-.3.1-.5 0L20.1 42.3c-1.3-.7-2.2-2.1-2.2-3.8 0-1.6 1-3.2 2.5-3.9l28.3-14.1c2.3-1.4 4.9 1.3 5.1 4.5.2 2.7-1 5.6-3 7.1Z" />
  </svg>
);

/*
 * Geist Pixel ships a single weight, so `font-medium` here would only ask the
 * browser to synthesise a bold and smear the pixel grid. Weight comes from the
 * face; presence comes from the size.
 */
export const Logo = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={`flex items-center gap-2 ${className ?? ""}`} {...props}>
    <LogoIcon className="size-6" />
    <span className="font-pixel-circle text-lg leading-none">benday</span>
  </div>
);
