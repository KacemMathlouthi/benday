import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import "./index.css";
import { App } from "@/app";
import { ThemeProvider } from "@/components/theme-provider";

const root = document.querySelector("#root");

if (!root) {
  throw new Error("web: #root is missing from index.html");
}

const tree = (
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="benday-theme">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);

// A built page arrives prerendered and is hydrated; the dev server sends an
// empty shell, which has nothing to hydrate.
if (root.hasChildNodes()) {
  hydrateRoot(root, tree);
} else {
  createRoot(root).render(tree);
}
