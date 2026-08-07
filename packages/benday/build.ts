/**
 * Build the two published entries with Bun, then emit declarations with tsc.
 *
 * ESM only, with code splitting on. The package has two entrypoints that share
 * the core, so splitting is what keeps that core a single module — a bundled
 * CJS copy per entry would duplicate module state (the bake cache among it),
 * not just bytes. Every consumer of a canvas component goes through a bundler
 * anyway.
 *
 * tsc runs as a CLI rather than through its JS API on purpose: TypeScript 7
 * drops the JavaScript compiler API, which breaks bundler dts plugins. The CLI
 * is unaffected.
 */
import { rm } from "node:fs/promises";

const BANNER = `/**
 * benday — turn any logo into an animated dot-field thinking indicator
 * https://github.com/KacemMathlouthi/benday
 */`;

await rm("dist", { force: true, recursive: true });

const result = await Bun.build({
  banner: BANNER,
  entrypoints: ["src/index.ts", "src/react/index.ts"],
  external: ["react", "react-dom", "react/jsx-runtime"],
  format: "esm",
  naming: {
    chunk: "chunks/[name]-[hash].js",
    entry: "[dir]/[name].js",
  },
  outdir: "dist",
  sourcemap: "linked",
  splitting: true,
  target: "browser",
});

if (!result.success) {
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

const types = Bun.spawnSync(
  ["bunx", "tsc", "--project", "tsconfig.build.json", "--pretty"],
  {
    stdio: ["inherit", "inherit", "inherit"],
  }
);

if (types.exitCode !== 0) {
  console.error("benday: failed to emit type declarations");
  process.exit(types.exitCode ?? 1);
}

for (const output of result.outputs) {
  console.log(
    `benday: ${output.path.replace(`${process.cwd()}/`, "")} (${output.size} bytes)`
  );
}
