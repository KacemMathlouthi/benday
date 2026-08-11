---
"benday": minor
---

Fix small marks rendering as haze, and layered logos rendering as one solid layer and one faint one.

Marks under 32px were given a shadow halo for optical weight, but the halo came out wider than the cell it sat in, so neighbouring dots bled together — at 16px the painted footprint was 1.6× the lattice pitch. Only `glow` blurs now; small marks get their weight from radius and alpha, the auto-consolidated lattice will not go below a 2px pitch, and small lattices are laid out on whole device pixels so every dot resolves the same way.

The bake also normalized each source to its own luminance range, which turned any difference at all into the full tonal range: two brand colours nineteen levels apart came out as one layer at full strength and one on the floor, a six-fold difference in painted area for inks of the same visual weight. Tone is now applied in proportion to the separation the artwork actually has, so near-uniform artwork stays flat and genuinely layered artwork still separates.

Marks will look different after this change, and pre-baked `dotMap`s keep their old tone until re-baked.
