import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";

export default defineConfig({
  extends: [core, react],
  ignorePatterns: [...core.ignorePatterns, "**/dist", ".turbo"],
  rules: {
    // The renderer is a closure of mutually-referencing helpers; hoisted
    // function declarations let them be ordered by meaning rather than by
    // dependency. Variables must still be declared before use, below.
    "eslint/func-style": "off",
    // Trailing clarifiers next to a numeric constant carry real meaning here.
    "eslint/no-inline-comments": "off",
    // The bake pipeline and the paint loop run per pixel and per dot. `++` is
    // the idiom every reader of that code expects, and the hazard the rule
    // guards against (postfix inside a larger expression) never appears.
    "eslint/no-plusplus": "off",
    "eslint/no-use-before-define": ["error", { functions: false }],
    // A canvas *is* the image being described; there is no <img> to swap in,
    // so role="img" plus an aria-label is the correct pairing.
    "jsx-a11y/prefer-tag-over-role": "off",
    // Wrapping an event-based browser API (Image load/error) in a Promise is
    // the correct pattern; there is no promise to return instead.
    "promise/avoid-new": "off",
    "promise/prefer-await-to-callbacks": "off",
    // React's own documentation defines components as function declarations,
    // and they give better stack traces than arrow assignments.
    "react/function-component-definition": "off",
  },
});
