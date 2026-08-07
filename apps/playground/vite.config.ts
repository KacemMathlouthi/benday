import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const src = (path: string) =>
  fileURLToPath(new URL(`../../packages/benday/src/${path}`, import.meta.url));

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "dist",
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    // Point at source rather than the built package so the playground
    // hot-reloads on library edits with no rebuild in between.
    //
    // Anchored regexes, not the object form: object keys prefix-match, so a
    // bare "benday" entry would swallow "benday/react" — and key order is not
    // something a formatter preserves.
    alias: [
      { find: /^benday$/u, replacement: src("index.ts") },
      { find: /^benday\/react$/u, replacement: src("react/index.ts") },
    ],
  },
});
