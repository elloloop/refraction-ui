---
"@refraction-ui/react": minor
"@refraction-ui/astro": minor
---

Show live media and call state on video tiles. `VideoGrid` gains `renderMedia` (a participant's `<video>`, transport-agnostic) and `renderTile` (custom or extended tiles, with the region and default tile props), and its participant type is generic so your own fields reach both. Grid rows now pack to the top instead of stretching into each other when the parent is shorter than the grid, and the speaker-view spotlight tile fills its area instead of overflowing it.

`VideoTile` gains `handRaised`, `screenShare` (a "Presenting" qualifier on the name, a screen icon and letterboxed media), a `menu` slot for tile options, `fill` and localisable `labels`. The speaking and pinned highlights move from an outer ring, which a clipping parent cut off, to an inset edge drawn above the media with the success and primary tokens, plus a sound-wave icon and a pin badge so neither cue is colour-only. Media children now fill the tile, a long name truncates inside the chip, and the avatar circle and its initials shrink with the tile so they never run under the name chip. The Astro `VideoTile` matches and is exported by name.
