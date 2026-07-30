---
"@refraction-ui/tailwind-config": patch
---

feat(tailwind-config): add `info`/`info-foreground` color utilities to the preset

Maps `info` to the new `--info`/`--info-foreground` CSS variables (mirroring
the `success`/`warning` nested pattern), so `bg-info`, `text-info`,
`border-info`, `bg-info/10`, … follow the active theme. The variables are
defined in the default stylesheet and in every bundled theme (all 6, light
and dark): light uses `217 91% 60%` (#3B82F6, Tailwind blue-500 —
pixel-identical to the previously hardcoded `blue-500` info styles); dark
lightens to `217 91% 65%` to keep contrast sensible on dark surfaces. The
Flutter package's info token remains #2196F3 (Material blue) — a deliberate
small cross-framework delta.
