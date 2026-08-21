# Playground: drop your logo in

The playground at <https://benday.kacemmathlouthi.dev/playground> runs the whole benday pipeline in the browser. Drop in a logo, SVG or PNG or anything a canvas can draw, and it is rasterized, masked, distance-transformed and gridded on the spot, then animated with any of the presets.

Everything happens locally. The file is never uploaded and never persisted.

## What you can tune

**The bake:** grid density, coverage threshold, gamma, dilation, mask mode (alpha or luminance), inversion for light-on-dark artwork, and trimming. Two warnings watch the result: one when almost nothing survived the threshold, one when the dots fall under 1.6 pixels at the chosen size and will read as grey fuzz. Both name the setting to reach for.

**The render:** preset, size, fit (square or the mark's natural aspect), speed, dot scale, shape, glow, ink weight, padding and colour.

An agent-interface preview sits beside the controls, running on hard-coded text, so a candidate setting can be judged where it will actually ship rather than at poster size.

## Copy the result

The playground writes the JSX for the settings you landed on, listing only what differs from the defaults. For the build-time path, baking once and shipping a `dotMap`, see [the usage guide](/usage.md).

## Where to go next

- [Usage and API reference](/usage.md)
- [Home](/index.md)
