---
'@refraction-ui/react': patch
'@refraction-ui/astro': patch
---

Badge and Callout `success`/`warning` variants now use the theme token utilities (`bg-success`, `text-success-foreground`, `bg-success/10`, …) instead of hardcoded `green-500`/`yellow-500` palette classes, so they follow the active theme's `--success`/`--warning` variables. Rendered hues shift slightly from the old fixed palette values.
