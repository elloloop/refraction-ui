---
'@refraction-ui/react': minor
---

Add `LevelBars` and `LiveLevelBars` audio level meters to `@refraction-ui/react`. `LevelBars` draws the given 0–1 `levels` exactly (`color` token, `height`, `barWidth`, `gap`, `taper`); `LiveLevelBars` samples a live `level` every `interval` ms into a scrolling history of `bars` entries. Both are decorative by default and become a `role="meter"` with a `label`. (#590)
