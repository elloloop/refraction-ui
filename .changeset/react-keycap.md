---
'@refraction-ui/react': minor
---

Add `Keycap` and `KeyLegend` to `@refraction-ui/react`: a key as it is printed, rendered as `<kbd>` in `sm`/`md`/`lg` with `pressed`, `highlighted`, `minWidth` and `semanticLabel`. `KeyLegend` takes a `word` (`Alt`, `Option`, `Mod`, `K`, …), an optional `icon` and `side`, prints platform-aware glyphs from ShortcutBadge's mapping (⌥ on macOS, Alt elsewhere; `Mod` is ⌘ or Ctrl), and gives screen readers the name ("Right Option"), not the glyph. (#591)
