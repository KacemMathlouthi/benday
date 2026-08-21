interface NavLinkItem {
  label: string;
  to: string;
}

/** The site nav, in the header and the footer: what a visitor came for. */
export const NAV_LINKS: NavLinkItem[] = [
  { label: "Home", to: "/" },
  { label: "Usage", to: "/usage" },
  { label: "Playground", to: "/playground" },
];

/**
 * Footer only. These answer "who is behind this and what happens to what I drop
 * in", which is a question worth an answer but not a slot in the header.
 */
export const FOOTER_LINKS: NavLinkItem[] = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy", to: "/privacy" },
];
