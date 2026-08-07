import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "dist",
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    // Anchored regexes, not the object form: object keys prefix-match, so a
    // bare "benday" entry would swallow "benday/react".
    alias: [
      { find: /^@\//u, replacement: `${here("./src")}/` },
      {
        find: /^benday$/u,
        replacement: here("../../packages/benday/src/index.ts"),
      },
      {
        find: /^benday\/react$/u,
        replacement: here("../../packages/benday/src/react/index.ts"),
      },
    ],
  },
});
