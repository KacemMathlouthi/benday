interface NavLinkItem {
  label: string;
  to: string;
}

export const NAV_LINKS: NavLinkItem[] = [
  { label: "Home", to: "/" },
  { label: "Usage", to: "/usage" },
  { label: "Playground", to: "/playground" },
];
