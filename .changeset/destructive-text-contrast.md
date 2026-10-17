---
'@refraction-ui/tailwind-config': patch
'@refraction-ui/react': patch
---

Make `--destructive` readable as text in every theme. It is a fill and a text colour (error text, a destructive Callout or Toast), but it was tuned only as a fill: a destructive Callout read at about 1.9:1 in dark mode and 3.5:1 in light mode. The light value is now `0 72% 40%` and the dark value `0 63% 70%` in every theme, so destructive text reaches WCAG AA (4.5:1) on the page, on cards and on its own wash. In dark mode no red light enough to read on the page is dark enough to carry light text, so a destructive fill in dark mode now carries dark text: `--destructive-foreground` is the theme's dark background, as `--primary-foreground` already is. `validateThemeContrast` now also checks destructive as text, including on a tinted wash and dimmed to 90%.
