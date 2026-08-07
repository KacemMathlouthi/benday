import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import "./index.css";
import { App } from "@/app";
import { ThemeProvider } from "@/components/theme-provider";

const root = document.querySelector("#root");

if (!root) {
  throw new Error("web: #root is missing from index.html");
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="benday-theme">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
