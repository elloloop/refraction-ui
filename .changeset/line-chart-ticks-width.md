---
'@refraction-ui/react': patch
'@refraction-ui/astro': patch
---

`LineChart` fixes: y-axis ticks are now round numbers on a "nice" 1-2-5 scale (e.g. 0, 2000, 4000, 6000) instead of fractions of `max × headroom` (e.g. 5999.9999), so tick formatters print clean labels; `niceScale` is exported. In React the chart measures its container (ResizeObserver, SSR falls back to `width`) and draws at that width, so axis text and `height` stay at their authored size in narrow panels instead of being scaled down; x labels thin automatically to fit.
