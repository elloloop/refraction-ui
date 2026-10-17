---
'@refraction-ui/react': minor
'@refraction-ui/tailwind-config': minor
---

Add `ColorChip` to `@refraction-ui/react`: a label with a categorical colour (`dot` on a `wash`) and an optional `hint`; with `onEdit` the whole chip is one button named by `editLabel` with an `editTooltip`. `colorFor(key)` picks a stable category for an id. `@refraction-ui/tailwind-config` gains an eight-entry categorical palette (`--category-N`, `-wash`, `-foreground`; Tailwind `category-N` colours), contrast-checked in light and dark for every theme. (#593)
