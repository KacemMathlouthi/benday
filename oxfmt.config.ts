import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    "**/dist",
    "apps/web/public/r",
    ".turbo",
    // Vendored verbatim from shadcn registries — regenerated, not authored.
    "apps/web/src/components/ui",
    "apps/web/src/components/icons",
    "apps/web/src/components/portal.tsx",
    "apps/web/src/components/theme-provider.tsx",
    "apps/web/src/hooks/use-scroll.ts",
  ],
});
