import { readFile } from "node:fs/promises";
import type { ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

import type { PageMeta } from "./src/lib/seo";

const here = (relative: string) =>
  fileURLToPath(new URL(relative, import.meta.url));

interface Feeds {
  PAGES: PageMeta[];
  buildMarkdown: (page: PageMeta, body: string) => string;
  llmsTxt: (pages: PageMeta[]) => string;
  sitemap: (pages: PageMeta[]) => string;
}

function send(res: ServerResponse, type: string, body: string): void {
  res.setHeader("Content-Type", `${type}; charset=utf-8`);
  // What Vercel sends, so a negotiating client sees the same contract.
  res.setHeader("Vary", "Accept");
  res.end(body);
}

async function markdownFor(feeds: Feeds, page: PageMeta): Promise<string> {
  const body = await readFile(
    path.join(here("./content"), `${page.file}.md`),
    "utf-8"
  );
  return feeds.buildMarkdown(page, body);
}

/**
 * `dist` gets its markdown twins, llms.txt and sitemap from the prerender, which
 * only runs on a build. Without this the dev server answers all of them with the
 * SPA shell, which routes to the 404, so the one thing you cannot check locally
 * is the thing agents read. Serve them from the same builders instead.
 */
function agentFeeds(): Plugin {
  return {
    apply: "serve",
    configureServer(server) {
      // Loaded through Vite so the aliases and the TypeScript resolve, and so an
      // edit to the builders or the content is picked up on the next request.
      const load = async (): Promise<Feeds> => {
        const feeds = await server.ssrLoadModule("/src/lib/feeds.ts");
        const seo = await server.ssrLoadModule("/src/lib/seo.ts");
        return {
          PAGES: seo.PAGES,
          buildMarkdown: feeds.buildMarkdown,
          llmsTxt: feeds.llmsTxt,
          sitemap: feeds.sitemap,
        };
      };

      const handle = async (
        url: string,
        accept: string,
        res: ServerResponse
      ): Promise<boolean> => {
        if (url === "/llms.txt" || url === "/sitemap.xml") {
          const feeds = await load();
          const isIndex = url === "/llms.txt";
          send(
            res,
            isIndex ? "text/plain" : "application/xml",
            isIndex ? feeds.llmsTxt(feeds.PAGES) : feeds.sitemap(feeds.PAGES)
          );
          return true;
        }

        if (url.endsWith(".md")) {
          const feeds = await load();
          const file = url.slice(1, -".md".length);
          const page = feeds.PAGES.find((entry) => entry.file === file);
          if (page) {
            send(res, "text/markdown", await markdownFor(feeds, page));
            return true;
          }
        }

        // The rewrite Vercel performs in production, so `Accept: text/markdown`
        // can be exercised against the dev server too.
        if (accept.includes("text/markdown")) {
          const feeds = await load();
          const page = feeds.PAGES.find((entry) => entry.path === url);
          if (page) {
            send(res, "text/markdown", await markdownFor(feeds, page));
            return true;
          }
        }

        return false;
      };

      server.middlewares.use(async (request, response, forward) => {
        const url = (request.url ?? "/").split("?")[0] ?? "/";
        // Anything this does not answer, and anything it throws on, falls
        // through to Vite: a broken feed must not take the dev server with it.
        try {
          const handled = await handle(
            url,
            request.headers.accept ?? "",
            response
          );
          if (!handled) {
            forward();
          }
        } catch (error) {
          forward(error);
        }
      });
    },
    name: "benday-agent-feeds",
  };
}

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "dist",
  },
  plugins: [react(), tailwindcss(), agentFeeds()],
  resolve: {
    alias: [
      { find: /^@registry\//u, replacement: `${here("../../registry")}/` },
      { find: /^@\//u, replacement: `${here("./src")}/` },
    ],
  },
});
