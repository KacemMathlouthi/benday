import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles.css";
import { App } from "./app";

const root = document.querySelector("#root");

if (!root) {
  throw new Error("playground: #root is missing from index.html");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
