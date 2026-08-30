# benday

## 0.5.0

### Minor Changes

- 982a4bc: Read tone as contrast against the surface the artwork sits on, so mid shades keep the weight they have in the source.
- d659b33: Paint dot area as the cell's own tone. Coverage, source tone and depth each entered through a floor before, so an empty cell painted 0.169 and a full one 0.319 and every logo arrived the same flat grey. `dotScale` is now measured against a full-coverage halftone dot; its default is unchanged, but the same value paints differently.
- 4e8fb55: Measure the lattice floor in device pixels, so small marks keep their shape instead of collapsing to a handful of dots.

### Patch Changes

- b1a1f94: Resample the lattice by area when consolidating, so small marks lose the uneven beat their edges picked up.

## 0.4.0

### Minor Changes

- 582a8bf: Fix small marks rendering as haze, and layered logos rendering as one solid layer and one faint one.

  Marks under 32px were given a shadow halo for optical weight, but the halo came out wider than the cell it sat in, so neighbouring dots bled together — at 16px the painted footprint was 1.6× the lattice pitch. Only `glow` blurs now; small marks get their weight from radius and alpha, the auto-consolidated lattice will not go below a 2px pitch, and small lattices are laid out on whole device pixels so every dot resolves the same way.

  The bake also normalized each source to its own luminance range, which turned any difference at all into the full tonal range: two brand colours nineteen levels apart came out as one layer at full strength and one on the floor, a six-fold difference in painted area for inks of the same visual weight. Tone is now applied in proportion to the separation the artwork actually has, so near-uniform artwork stays flat and genuinely layered artwork still separates.

  Marks will look different after this change, and pre-baked `dotMap`s keep their old tone until re-baked.

## 0.3.0

### Minor Changes

- 17bc4cf: Add fourteen logo-preserving animation presets organized into signature, sweep, orbit, field, and transform families.

## 0.2.0

### Minor Changes

- 5169ce4: Preserve source tone and geometric depth in layered logos, retain the source aspect ratio, and keep animated marks crisp and legible in small inline contexts.

## 0.1.0

- Initial public registry release with runtime and build-time logo baking, seven animation presets, three indicator states, and the React canvas renderer.
