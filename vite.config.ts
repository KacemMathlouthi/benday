import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Demo / playground config. Library build lives in vite.config.lib.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'benday': new URL('./src/index.ts', import.meta.url).pathname,
    },
  },
  root: 'demo',
  build: {
    outDir: '../dist-demo',
    emptyOutDir: true,
  },
});
