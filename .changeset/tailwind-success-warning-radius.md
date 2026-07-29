---
'@refraction-ui/tailwind-config': minor
---

Add `success`/`success-foreground` and `warning`/`warning-foreground` color utilities to the preset (mapped to the existing `--success`/`--warning` CSS variables), and make `borderRadius.sm` a fixed `2px` absolute instead of `calc(var(--radius) - 4px)` so small elements (e.g. checkboxes) no longer collapse toward a circle at large `--radius` values. The default theme (`--radius: 0.375rem`) renders pixel-identical `sm` radius as before.
