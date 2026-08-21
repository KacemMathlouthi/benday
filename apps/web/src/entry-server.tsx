import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";

import { App } from "@/app";
import { ThemeProvider } from "@/components/theme-provider";

// Re-exported so the prerender script consumes one bundled module and never has
// to resolve the app's path aliases itself.
export { PRESETS, PRESET_NAMES } from "@registry/ui/benday/presets";
export { buildMarkdown, llmsTxt, sitemap } from "@/lib/feeds";
export { headTags } from "@/lib/head";
export type { PageMeta } from "@/lib/seo";
export { PAGES, SITE_URL, canonicalFor } from "@/lib/seo";

/**
 * Render one route to HTML at build time. The tree is the same one `main.tsx`
 * hydrates, minus the CSS import — the client build already emits the
 * stylesheet, and the prerender only needs markup.
 */
export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="benday-theme">
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </ThemeProvider>
    </StrictMode>
  );
}
