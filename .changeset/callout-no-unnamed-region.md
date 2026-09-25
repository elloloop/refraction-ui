---
'@refraction-ui/react': patch
'@refraction-ui/astro': patch
---

`Callout` no longer defaults to an unnamed `role="region"` landmark (an axe violation). Non-destructive callouts get no role unless named with `aria-label`/`aria-labelledby` (then `region`); `destructive` stays `alert`; an explicit `role` always wins.
