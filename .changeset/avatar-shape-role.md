---
'@refraction-ui/react': minor
'@refraction-ui/astro': minor
---

`Avatar` gains `shape` (`circle` default, `square`). The root no longer has an unnamed `role="img"` (which hid the inner image's alt and fallback text); it becomes `role="img"` only when given an `aria-label`.
