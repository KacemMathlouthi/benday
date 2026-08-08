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
    alias: [
      { find: /^@registry\//u, replacement: `${here("../../registry")}/` },
      { find: /^@\//u, replacement: `${here("./src")}/` },
    ],
  },
});
